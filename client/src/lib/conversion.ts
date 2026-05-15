/**
 * GTC Conversion Helpers
 * Centralizes WhatsApp messaging, analytics tracking, and conversion utilities.
 */

const WHATSAPP_NUMBER = '243829664720';
const DIRECT_WA_LINK = 'https://wa.me/message/63NJO3NTNQIWC1';

// ============ WHATSAPP PRE-FILLED MESSAGES ============

export type WhatsAppContext =
  | 'general'
  | 'software'
  | 'training'
  | 'data'
  | 'consulting'
  | 'product'
  | 'navbar'
  | 'floating';

const PRE_FILLED_MESSAGES: Record<WhatsAppContext, string> = {
  general: 'Bonjour GTC, je souhaite en savoir plus sur vos services.',
  software: 'Bonjour GTC, je souhaite créer un système de gestion sur mesure (logiciel / application).',
  training: 'Bonjour GTC, je souhaite suivre une formation en Excel / Google Sheets.',
  data: 'Bonjour GTC, j\'ai besoin d\'une analyse de données pour mon entreprise.',
  consulting: 'Bonjour GTC, je souhaite bénéficier d\'une consultation gratuite avec un expert.',
  product: 'Bonjour GTC, je souhaite acheter un de vos e-books.',
  navbar: 'Bonjour GTC, je viens de visiter votre site et je souhaite discuter.',
  floating: 'Bonjour GTC, j\'ai une question rapide.',
};

/**
 * Returns a WhatsApp link with a pre-filled, context-specific message.
 */
export function getWhatsAppLink(context: WhatsAppContext = 'general'): string {
  const message = PRE_FILLED_MESSAGES[context];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns the direct WhatsApp business link (without pre-filled message).
 * Useful when redirecting to a specific WA Business catalog or message.
 */
export function getDirectWhatsAppLink(): string {
  return DIRECT_WA_LINK;
}

// ============ ANALYTICS TRACKING ============

/**
 * Tracks a custom event in both Google Analytics 4 and Meta Pixel.
 * Safe to call even if scripts are not loaded.
 */
export function trackEvent(
  eventName: string,
  params: Record<string, any> = {}
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  try {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  } catch (e) {
    // silently ignore
  }

  // Meta Pixel (Facebook)
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      // Standard events get mapped to 'track', custom ones use 'trackCustom'
      const standardEvents = [
        'PageView', 'Lead', 'Contact', 'CompleteRegistration',
        'InitiateCheckout', 'Purchase', 'ViewContent', 'AddToCart',
      ];
      if (standardEvents.includes(eventName)) {
        fbq('track', eventName, params);
      } else {
        fbq('trackCustom', eventName, params);
      }
    }
  } catch (e) {
    // silently ignore
  }
}

/**
 * Tracks a WhatsApp click with context.
 */
export function trackWhatsAppClick(context: WhatsAppContext): void {
  trackEvent('whatsapp_click', { context, channel: 'whatsapp' });
  // Also fire a Lead-equivalent event for Meta
  trackEvent('Contact', { context, method: 'whatsapp' });
}

/**
 * Tracks a form submission.
 */
export function trackFormSubmit(formType: string, method: 'whatsapp' | 'email'): void {
  trackEvent('form_submit', { form_type: formType, send_method: method });
  trackEvent('Lead', { form_type: formType, method });
}

/**
 * Tracks a CTA button click.
 */
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent('cta_click', { cta_name: ctaName, location });
}

/**
 * Tracks a page view (auto-fired on route change).
 * Uses GA4's recommended `config` call for SPA navigation,
 * and Meta Pixel's PageView standard event.
 */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4 - use config to update page_path
  try {
    const gtag = (window as any).gtag;
    const config = (window as any).GTC_ANALYTICS;
    if (typeof gtag === 'function' && config?.GA4_MEASUREMENT_ID) {
      gtag('config', config.GA4_MEASUREMENT_ID, {
        page_path: path,
        page_title: document.title,
      });
      gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  } catch (e) {
    // silently ignore
  }

  // Meta Pixel - PageView standard event
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
    }
  } catch (e) {
    // silently ignore
  }
}

/**
 * Tracks a lead capture (email opt-in, lead magnet, newsletter signup).
 * Fires both a custom `lead_capture` event and the standard Meta `Lead` event.
 */
export function trackLead(source: string): void {
  trackEvent('lead_capture', { source });
  trackEvent('Lead', { source, content_name: source });
}
