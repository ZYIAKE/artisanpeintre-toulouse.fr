import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = [
  "https://artisanpeintre-toulouse.fr",
  "https://www.artisanpeintre-toulouse.fr",
  "http://localhost:3000",
  "http://localhost:5173",
];

const PLACE_SEARCH_QUERY = "2PC Peinture Artisan peintre Toulouse";
const MAPS_URL =
  "https://www.google.com/maps/place/2PC+Peinture+%7C+Artisan+peintre+en+B%C3%A2timent/@43.6072369,1.3618638,17z/data=!4m8!3m7!1s0x12aeb1229d26ef5f:0x1e1a520ac08d3591!8m2!3d43.6072369!4d1.3618638!9m1!1b1!16s";

let cachedPlaceId: string | null = null;

interface Review {
  author: string;
  photoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
}

function getCorsHeaders(origin: string): Record<string, string> | null {
  const isLocalhost = origin.startsWith("http://localhost:");
  if (!ALLOWED_ORIGINS.includes(origin) && !isLocalhost) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Client-Info, Apikey",
  };
}

function jsonResponse(
  data: unknown,
  status: number,
  cors: Record<string, string>,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// ═══════════════════════════════════════════
// SCRAPING: Extract all reviews from Google Maps HTML
// ═══════════════════════════════════════════

function findMatchingBracket(str: string, start: number): number {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < str.length && i < start + 5_000_000; i++) {
    if (esc) { esc = false; continue; }
    const ch = str[i];
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractDataBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  let pos = 0;
  const marker = "AF_initDataCallback(";
  while (pos < html.length) {
    const idx = html.indexOf(marker, pos);
    if (idx === -1) break;
    const dataIdx = html.indexOf("data:", idx + marker.length);
    if (dataIdx === -1 || dataIdx > idx + 500) { pos = idx + 1; continue; }
    const arrStart = html.indexOf("[", dataIdx);
    if (arrStart === -1 || arrStart > dataIdx + 50) { pos = idx + 1; continue; }
    const end = findMatchingBracket(html, arrStart);
    if (end > 0) {
      try {
        blocks.push(JSON.parse(html.substring(arrStart, end + 1)));
      } catch { /* not valid JSON */ }
    }
    pos = (end > 0 ? end : idx) + 1;
  }
  return blocks;
}

function tryExtractReview(item: unknown): Review | null {
  if (!Array.isArray(item) || item.length < 3) return null;

  let author: string | null = null;
  let rating: number | null = null;
  let text: string | null = null;
  let relativeTime: string | null = null;
  let photoUrl: string | null = null;

  function scan(arr: unknown[], d: number) {
    if (d > 6) return;
    for (const v of arr) {
      if (typeof v === "number" && v >= 1 && v <= 5 && Number.isInteger(v) && !rating) {
        rating = v;
      }
      if (typeof v === "string") {
        if (v.length > 30 && !text) text = v;
        if (/il y a|ago|mois|an[s]?\b|jour|semaine|month|year|day|week/i.test(v) && v.length < 80 && !relativeTime) {
          relativeTime = v;
        }
        if (/googleusercontent|photo|lh[0-9]\.google/i.test(v) && !photoUrl) {
          photoUrl = v;
        }
      }
      if (Array.isArray(v)) scan(v, d + 1);
    }
  }

  function findAuthor(arr: unknown[], d: number): string | null {
    if (d > 4) return null;
    for (let i = 0; i < arr.length && i < 10; i++) {
      const v = arr[i];
      if (
        typeof v === "string" && v.length >= 2 && v.length <= 60 &&
        /^[A-ZÀ-ÝÉÈÊËÎÏÔÙÛÜÇŒÆa-z]/.test(v) &&
        !/^https?:/.test(v) && !/[{}[\]<>]/.test(v)
      ) {
        return v;
      }
      if (Array.isArray(v)) {
        const found = findAuthor(v, d + 1);
        if (found) return found;
      }
    }
    return null;
  }

  scan(item, 0);
  author = findAuthor(item, 0);

  if (rating && (author || text)) {
    return {
      author: author || "Anonyme",
      rating,
      text: text || "",
      relativeTime: relativeTime || "",
      photoUrl,
      publishTime: "",
    };
  }
  return null;
}

function findReviewsInData(data: unknown, depth = 0): Review[] | null {
  if (depth > 25 || !Array.isArray(data)) return null;

  // Try to interpret items as reviews
  const reviews: Review[] = [];
  for (const item of data) {
    const r = tryExtractReview(item);
    if (r) reviews.push(r);
  }
  if (reviews.length >= 3) return reviews;

  // Recurse into sub-arrays
  for (const item of data) {
    if (Array.isArray(item)) {
      const found = findReviewsInData(item, depth + 1);
      if (found && found.length >= 3) return found;
    }
  }

  return reviews.length > 0 ? reviews : null;
}

async function scrapeAllReviews(): Promise<Review[] | null> {
  try {
    const res = await fetch(MAPS_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      console.error("Maps fetch failed:", res.status);
      return null;
    }

    const html = await res.text();
    console.log("Fetched Google Maps page, length:", html.length);

    const blocks = extractDataBlocks(html);
    console.log("Found", blocks.length, "AF_initDataCallback blocks");

    // Search each block for reviews, keep the largest set found
    let bestReviews: Review[] | null = null;
    for (const block of blocks) {
      const reviews = findReviewsInData(block);
      if (reviews && (!bestReviews || reviews.length > bestReviews.length)) {
        bestReviews = reviews;
      }
    }

    if (bestReviews) {
      console.log("Scraped", bestReviews.length, "reviews from Google Maps");
    }
    return bestReviews;
  } catch (err) {
    console.error("Scrape error:", err);
    return null;
  }
}

// ═══════════════════════════════════════════
// API: Google Places API (fallback, max 5 reviews)
// ═══════════════════════════════════════════

async function fetchPlaceData(apiKey: string) {
  // Resolve Place ID
  if (!cachedPlaceId) {
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id",
        },
        body: JSON.stringify({ textQuery: PLACE_SEARCH_QUERY }),
      },
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    cachedPlaceId = searchData.places?.[0]?.id;
    if (!cachedPlaceId) return null;
    console.log("Resolved Place ID:", cachedPlaceId);
  }

  // Get place details
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${cachedPlaceId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "displayName,rating,userRatingCount,reviews,googleMapsUri",
      },
    },
  );

  if (!response.ok) return null;
  return await response.json();
}

function formatApiReviews(placeData: Record<string, unknown>): Review[] {
  const reviews = (placeData.reviews as Array<Record<string, unknown>>) || [];
  return reviews.map(
    (review) => ({
      author:
        (review.authorAttribution as Record<string, string>)?.displayName ||
        "Anonyme",
      photoUrl:
        (review.authorAttribution as Record<string, string>)?.photoUri || null,
      rating: (review.rating as number) || 5,
      text: ((review.text as Record<string, string>)?.text) || "",
      relativeTime:
        (review.relativePublishTimeDescription as string) || "",
      publishTime: (review.publishTime as string) || "",
    }),
  );
}

// ═══════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const cors = getCorsHeaders(origin) || {
    "Access-Control-Allow-Origin": "*",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405, cors);
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      return jsonResponse(
        { error: "Google Places API key not configured" },
        500,
        cors,
      );
    }

    // Always fetch place data from API (for rating, total count, maps URL)
    const placeData = await fetchPlaceData(apiKey);
    if (!placeData) {
      return jsonResponse(
        { error: "Failed to fetch place details" },
        502,
        cors,
      );
    }

    const name =
      (placeData.displayName as Record<string, string>)?.text || "2PC Peinture";
    const rating = (placeData.rating as number) || 0;
    const totalReviews = (placeData.userRatingCount as number) || 0;
    const googleMapsUrl = (placeData.googleMapsUri as string) || MAPS_URL;

    // Try scraping for all reviews first
    console.log("Attempting scrape for all reviews...");
    const scrapedReviews = await scrapeAllReviews();

    if (scrapedReviews && scrapedReviews.length > 0) {
      console.log(`Using ${scrapedReviews.length} scraped reviews`);
      return jsonResponse(
        { name, rating, totalReviews, googleMapsUrl, reviews: scrapedReviews },
        200,
        cors,
      );
    }

    // Fallback: use API reviews (max 5)
    console.log("Scraping returned nothing, falling back to API reviews");
    const apiReviews = formatApiReviews(placeData);

    return jsonResponse(
      { name, rating, totalReviews, googleMapsUrl, reviews: apiReviews },
      200,
      cors,
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500, cors);
  }
});
