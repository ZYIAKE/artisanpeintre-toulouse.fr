// Cookie consent banner — RGPD compliant.
// Strategy:
//   - On first visit: banner visible, GA4 NOT loaded
//   - User clicks "Accepter": stores consent=accepted → loads GA4
//   - User clicks "Refuser": stores consent=refused → GA4 stays off
//   - Stored in localStorage under key "atlinker-cookie-consent"
//
// The "load GA4" function is defined inline in each HTML <head>
// as window.__loadGA4() so this file only needs to decide IF to call it.
// If the user has previously accepted, GA4 is loaded immediately on DOM
// ready (no banner shown). If refused or no choice, banner is shown on
// first visit and GA4 stays off.

(function () {
  var STORAGE_KEY = 'atlinker-cookie-consent';
  var GA_LOADER_KEY = '__loadGA4';

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch (_e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_e) { /* ignore */ }
  }
  function loadGA4() {
    if (typeof window[GA_LOADER_KEY] === 'function') {
      window[GA_LOADER_KEY]();
    }
  }
  function loadClarity() {
    if (typeof window.__loadClarity === 'function') {
      window.__loadClarity();
    }
  }
  function loadAll() {
    loadGA4();
    loadClarity();
  }

  function hideBanner() {
    var b = document.getElementById('cookie-consent-banner');
    if (b) b.remove();
  }

  function wireBanner() {
    var accept = document.getElementById('cookie-accept');
    var refuse = document.getElementById('cookie-refuse');
    if (accept) {
      accept.addEventListener('click', function () {
        setConsent('accepted');
        loadAll();
        hideBanner();
      });
    }
    if (refuse) {
      refuse.addEventListener('click', function () {
        setConsent('refused');
        hideBanner();
      });
    }
  }

  function init() {
    var consent = getConsent();
    if (consent === 'accepted') {
      // Already accepted in a previous visit — load GA4 + Clarity silently
      loadAll();
      hideBanner();
      return;
    }
    if (consent === 'refused') {
      // Already refused — don't show again, don't load GA4
      hideBanner();
      return;
    }
    // First visit: reveal banner (was hidden via [hidden] attr)
    var b = document.getElementById('cookie-consent-banner');
    if (b) {
      b.removeAttribute('hidden');
      wireBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
