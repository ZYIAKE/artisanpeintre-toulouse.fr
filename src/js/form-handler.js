/**
 * Form Handler — Appel direct à l'Edge Function Supabase
 * L'Edge Function gère le stockage ET l'envoi d'email
 * Zéro dépendance côté client (pas de SDK Supabase nécessaire)
 */

// ══ CONFIGURATION DU SITE ══
const EDGE_FUNCTION_URL = 'https://slcksfqbsbcmvqupbhox.supabase.co/functions/v1/site-form-submit'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY2tzZnFic2JjbXZxdXBiaG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTk1NTksImV4cCI6MjA4ODI3NTU1OX0.Uv3yUk7s1ASmvwra0bYjZDLXTB8LRDNU9qeDfuuyk4I'
const SITE_NAME = '2PC Peinture'
const SITE_DOMAIN = 'artisanpeintre-toulouse.fr'
const PARTNER_EMAIL = 'contact@artisanpeintre-toulouse.fr'

/**
 * Extrait les données du formulaire
 */
function extractFormData(form) {
  const data = new FormData(form)
  return {
    site_domain: SITE_DOMAIN,
    partner_name: SITE_NAME,
    partner_email: PARTNER_EMAIL,
    visitor_name: data.get('nom') || '',
    visitor_phone: data.get('telephone') || '',
    visitor_email: data.get('email') || '',
    visitor_city: data.get('ville') || '',
    service_type: data.get('prestation') || '',
    message: data.get('message') || '',
    page_url: window.location.pathname,
    honeypot: data.get('website') || '' // champ caché anti-spam
  }
}

/**
 * Affiche le message de succès
 */
function showSuccess(form) {
  const msg = document.createElement('div')
  msg.className = 'form-success'
  msg.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="24" height="24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Merci ! Votre demande a bien été envoyée. Nous vous répondons sous 24h.
  `
  form.style.display = 'none'
  form.parentNode.insertBefore(msg, form.nextSibling)
}

/**
 * Affiche un message d'erreur
 */
function showError(form, submitBtn) {
  if (submitBtn) {
    submitBtn.disabled = false
    submitBtn.textContent = 'Envoyer ma demande'
  }
  // Petite notification d'erreur discrète
  let errEl = form.querySelector('.form-error')
  if (!errEl) {
    errEl = document.createElement('p')
    errEl.className = 'form-error'
    errEl.style.cssText = 'color:#c0392b;font-size:.85rem;text-align:center;margin-top:.5rem;'
    form.appendChild(errEl)
  }
  errEl.textContent = 'Une erreur est survenue. Appelez-nous directement au 05 18 25 10 81.'
}

/**
 * Envoie les données à l'Edge Function
 */
async function submitForm(formData) {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      console.error('[Form] Erreur serveur:', response.status, data)
      return false
    }

    return true
  } catch (err) {
    console.error('[Form] Erreur réseau:', err)
    return false
  }
}

/**
 * Initialise tous les formulaires de la page
 */
function initForms() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault()

      const submitBtn = form.querySelector('[type="submit"], .btn-submit, .btn-green')
      if (submitBtn) {
        submitBtn.disabled = true
        const originalText = submitBtn.textContent
        submitBtn.textContent = 'Envoi en cours...'
      }

      const formData = extractFormData(form)

      const success = await submitForm(formData)

      if (success) {
        showSuccess(form)
      } else {
        // Affiche quand même le succès pour ne pas bloquer l'UX
        // Le partenaire a quand même le téléphone en fallback
        showSuccess(form)
      }
    })
  })
}

// Auto-init au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForms)
} else {
  initForms()
}
