// ══ GOOGLE REVIEWS WIDGET ══
const SUPABASE_URL = 'https://slcksfqbsbcmvqupbhox.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY2tzZnFic2JjbXZxdXBiaG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTk1NTksImV4cCI6MjA4ODI3NTU1OX0.Uv3yUk7s1ASmvwra0bYjZDLXTB8LRDNU9qeDfuuyk4I'
const FUNCTION_NAME = 'site-google-reviews'
const GMB_URL = 'https://www.google.com/maps/place/2PC+Peinture+%7C+Artisan+peintre+en+B%C3%A2timent/@43.6072369,1.3618638,17z'

function starSVG(filled) {
  return `<svg viewBox="0 0 24 24" fill="${filled ? '#FBBC04' : '#E0E0E0'}" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>`
}

function starsHTML(rating, cssClass = 'avis-stars') {
  let html = `<div class="${cssClass}">`
  for (let i = 1; i <= 5; i++) {
    html += starSVG(i <= Math.round(rating))
  }
  html += '</div>'
  return html
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function renderHeader(data, container) {
  const headerHTML = `
    <div class="avis-header">
      <div class="avis-header-left">
        <svg class="avis-google-icon" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.2-2.7-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.5 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/>
        </svg>
        <div class="avis-header-info">
          <div class="avis-rating-big">
            ${data.rating.toFixed(1)}
            ${starsHTML(data.rating)}
          </div>
          <div class="avis-rating-count">${data.totalReviews} avis Google</div>
        </div>
      </div>
      <a href="${data.googleMapsUrl || GMB_URL}" target="_blank" rel="noopener" class="avis-gmb-link">
        Voir tous les avis
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 6 15 12 9 18"/></svg>
      </a>
    </div>
  `
  container.insertAdjacentHTML('afterbegin', headerHTML)
}

function renderReviews(reviews, container) {
  const carouselHTML = `
    <div class="avis-carousel">
      <button class="avis-carousel-btn avis-carousel-prev" aria-label="Avis précédents">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 6 9 12 15 18"/></svg>
      </button>
      <div class="avis-carousel-viewport">
      <div class="avis-carousel-track">
        ${reviews.map(review => `
          <div class="avis-slide">
            <div class="avis-card">
              <div class="avis-card-top">
                <div class="avis-avatar">${getInitials(review.author)}</div>
                <div class="avis-card-meta">
                  <div class="avis-card-name">${review.author}</div>
                  <div class="avis-card-date">${review.relativeTime}</div>
                </div>
              </div>
              <div class="avis-card-stars">${starsHTML(review.rating, 'avis-stars')}</div>
              <p class="avis-text">${review.text}</p>
            </div>
          </div>
        `).join('')}
      </div>
      </div>
      <button class="avis-carousel-btn avis-carousel-next" aria-label="Avis suivants">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    </div>
    <div class="avis-carousel-dots"></div>
  `
  container.insertAdjacentHTML('beforeend', carouselHTML)
  initCarousel(container, reviews.length)
}

function initCarousel(container, total) {
  const track = container.querySelector('.avis-carousel-track')
  const prevBtn = container.querySelector('.avis-carousel-prev')
  const nextBtn = container.querySelector('.avis-carousel-next')
  const dotsContainer = container.querySelector('.avis-carousel-dots')

  let currentIndex = 0

  function getPerPage() {
    if (window.innerWidth <= 640) return 1
    if (window.innerWidth <= 1024) return 2
    return 3
  }

  function getMaxIndex() {
    return Math.max(0, total - getPerPage())
  }

  function renderDots() {
    const perPage = getPerPage()
    const pages = Math.ceil(total / perPage)
    const activePage = Math.floor(currentIndex / perPage)
    dotsContainer.innerHTML = Array.from({ length: pages }, (_, i) =>
      `<button class="avis-dot${i === activePage ? ' active' : ''}" aria-label="Page ${i + 1}"></button>`
    ).join('')
    dotsContainer.querySelectorAll('.avis-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => {
        currentIndex = Math.min(i * perPage, getMaxIndex())
        update()
      })
    })
  }

  function update() {
    const perPage = getPerPage()
    const cardWidth = 100 / perPage
    track.style.transform = `translateX(-${currentIndex * cardWidth}%)`
    prevBtn.disabled = currentIndex === 0
    nextBtn.disabled = currentIndex >= getMaxIndex()
    renderDots()
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - getPerPage())
    update()
  })

  nextBtn.addEventListener('click', () => {
    currentIndex = Math.min(getMaxIndex(), currentIndex + getPerPage())
    update()
  })

  window.addEventListener('resize', () => {
    currentIndex = Math.min(currentIndex, getMaxIndex())
    update()
  })

  update()
}

function renderFallback(container) {
  container.innerHTML = `
    <div class="avis-header" style="justify-content:center">
      <a href="${GMB_URL}" target="_blank" rel="noopener" class="avis-gmb-link" style="font-size:1rem">
        <svg class="avis-google-icon" viewBox="0 0 48 48" style="width:28px;height:28px">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.2-2.7-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.5 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/>
        </svg>
        Consultez nos avis sur Google
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:16px;height:16px"><polyline points="9 6 15 12 9 18"/></svg>
      </a>
    </div>
  `
}

async function loadGoogleReviews() {
  const container = document.getElementById('google-reviews-widget')
  if (!container) return

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`, {
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (!data.reviews || data.reviews.length === 0) throw new Error('No reviews')

    // Clear loading state
    container.innerHTML = ''

    renderHeader(data, container)
    renderReviews(data.reviews, container)
  } catch (err) {
    console.warn('Could not load Google reviews:', err)
    renderFallback(container)
  }
}

// Lazy-init: charge les avis quand la section est visible (hors chaîne critique)
function initReviewsLazy() {
  const container = document.getElementById('google-reviews-widget')
  if (!container) return

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect()
        loadGoogleReviews()
      }
    }, { rootMargin: '200px' })
    observer.observe(container)
  } else {
    loadGoogleReviews()
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReviewsLazy)
} else {
  initReviewsLazy()
}
