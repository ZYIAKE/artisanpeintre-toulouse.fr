/**
 * Main JavaScript — Modules partagés sur toutes les pages
 * Artisan Peintre Toulouse — 2PC Peinture
 */

// ══ HAMBURGER MENU ══
const hamburger = document.querySelector('.hamburger')
const navLinks = document.querySelector('.nav-links')

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active')
    navLinks.classList.toggle('open')
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'))
  })
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => {
      hamburger.classList.remove('active')
      navLinks.classList.remove('open')
      hamburger.setAttribute('aria-expanded', 'false')
    })
  )
}

// ══ NAV ACTIVE LINK ══
;(function () {
  const page = location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(a => {
    const href = a.getAttribute('href')
    if (href === page) a.classList.add('active')
    // Pages de prestation → activer le lien "Prestations"
    if (
      page.match(/^peinture|^renovation|^remise/) &&
      href === 'prestations.html'
    ) {
      a.classList.add('active')
    }
    // Pages de ville → aucun lien spécifique actif (ou "Accueil")
  })
})()

// ══ REVEAL ANIMATIONS (Intersection Observer) ══
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
)
document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

// ══ STAT COUNTERS (animates 0 → target on scroll into view) ══
// Looks for `.stat-number` elements and animates the leading integer
// from 0 to its final value over ~1.4s. Keeps suffixes like "+" or "/5"
// intact by parsing only the digits at the start.
const statObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target
      const finalText = el.textContent.trim()
      const match = finalText.match(/^(\d+(?:[\.,]\d+)?)(.*)$/)
      if (!match) {
        statObserver.unobserve(el)
        return
      }
      const endRaw = match[1].replace(',', '.')
      const suffix = match[2] || ''
      const end = parseFloat(endRaw)
      const isFloat = endRaw.includes('.')
      const duration = 1400
      const start = performance.now()

      function step(now) {
        const p = Math.min(1, (now - start) / duration)
        // ease-out cubic
        const e = 1 - Math.pow(1 - p, 3)
        const current = end * e
        el.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix
        if (p < 1) requestAnimationFrame(step)
        else el.textContent = (isFloat ? end.toFixed(1) : end) + suffix
      }
      requestAnimationFrame(step)
      statObserver.unobserve(el)
    })
  },
  { threshold: 0.5 }
)
document.querySelectorAll('.stat-number').forEach(el => {
  // Snapshot the final text BEFORE we reset to 0, so the observer
  // callback can read the true target from data-stat-final.
  el.dataset.statFinal = el.textContent.trim()
  // Don't reset inline to avoid layout shift — just start observing.
  statObserver.observe(el)
})

// ══ SMOOTH SCROLL ══
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'))
    if (target) {
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

// ══ FAQ ACCORDION ══
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling
    const isOpen = answer.classList.contains('open')
    // Close all
    document.querySelectorAll('.faq-a.open').forEach(el => {
      el.classList.remove('open')
      el.previousElementSibling.classList.remove('open')
      el.previousElementSibling.setAttribute('aria-expanded', 'false')
    })
    // Toggle current
    if (!isOpen) {
      answer.classList.add('open')
      btn.classList.add('open')
      btn.setAttribute('aria-expanded', 'true')
    }
  })
})

// ══ CAROUSEL (Réalisations) ══
document.querySelectorAll('.real-carousel').forEach(carousel => {
  const slides = carousel.querySelectorAll('.real-slide')
  const dots = carousel.querySelectorAll('.real-dot')
  if (slides.length === 0) return
  let current = 0
  function goTo(index) {
    slides[current].classList.remove('active')
    if (dots[current]) dots[current].classList.remove('active')
    current = (index + slides.length) % slides.length
    slides[current].classList.add('active')
    if (dots[current]) dots[current].classList.add('active')
  }
  const prevBtn = carousel.querySelector('.real-prev')
  const nextBtn = carousel.querySelector('.real-next')
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1))
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1))
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)))
})

// ══ GALERIE CHANTIER (si présente) ══
;(function () {
  const mainPhoto = document.querySelector('.chantier-main-photo img')
  const thumbs = document.querySelectorAll('.chantier-thumb')
  const counter = document.querySelector('.chantier-counter')
  const prevBtn = document.querySelector('.chantier-nav-prev')
  const nextBtn = document.querySelector('.chantier-nav-next')
  if (!mainPhoto || thumbs.length === 0) return

  let current = 0
  const sources = Array.from(thumbs).map(
    t => t.querySelector('img')?.src || ''
  )
  const alts = Array.from(thumbs).map(
    t => t.querySelector('img')?.alt || ''
  )

  function goTo(index) {
    current = (index + sources.length) % sources.length
    mainPhoto.src = sources[current]
    mainPhoto.alt = alts[current]
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current))
    if (counter) counter.textContent = `${current + 1} / ${sources.length}`
  }

  thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)))
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1))
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1))
})()
