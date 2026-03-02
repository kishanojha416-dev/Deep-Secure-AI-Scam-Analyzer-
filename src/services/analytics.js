const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID || import.meta.env.NEXT_PUBLIC_GA_ID || '';

let hasInitialized = false;

function canTrack() {
  return import.meta.env.PROD && Boolean(GA_MEASUREMENT_ID);
}

export function initAnalytics() {
  if (!canTrack() || hasInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  hasInitialized = true;
}

export function trackPageView(path = `${window.location.pathname}${window.location.search}`) {
  if (!canTrack() || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

export function trackEvent(name, params = {}) {
  if (!canTrack() || typeof window.gtag !== 'function') return;

  window.gtag('event', name, params);
}
