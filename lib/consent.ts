// evento dispatchato da CookieConsentInit ad ogni consenso/cambio preferenze,
// così altri componenti client (mappa, analytics) possono ri-verificare lo stato
export const CONSENT_CHANGED_EVENT = "cc:consent-changed";

export function dispatchConsentChanged() {
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT));
}

export function onConsentChanged(callback: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, callback);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, callback);
}
