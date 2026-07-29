"use client";

const PENDING_IMPORT_KEY = 'rupiyo_pending_import_store';

/**
 * Retrieve current pending import payload (from window global or sessionStorage)
 */
export function getPendingImportPayload() {
  if (typeof window === 'undefined') return null;

  // 1. Check window global set by Android MainActivity
  if (window.__RUPIYO_PENDING_SHARE__) {
    const payload = window.__RUPIYO_PENDING_SHARE__;
    setPendingImportPayload(payload);
    window.__RUPIYO_PENDING_SHARE__ = null;
    return payload;
  }

  // 2. Fallback to sessionStorage
  try {
    const stored = sessionStorage.getItem(PENDING_IMPORT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('[SHARE_HANDLER] Failed reading sessionStorage:', err);
  }

  return null;
}

/**
 * Persist pending import payload to sessionStorage
 */
export function setPendingImportPayload(payload) {
  if (typeof window === 'undefined' || !payload) return;
  try {
    sessionStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[SHARE_HANDLER] Failed saving to sessionStorage:', err);
  }
}

/**
 * Consume and clear the active pending import payload
 */
export function consumePendingImportPayload() {
  if (typeof window === 'undefined') return null;
  const payload = getPendingImportPayload();
  try {
    sessionStorage.removeItem(PENDING_IMPORT_KEY);
    if (window.__RUPIYO_PENDING_SHARE__) {
      window.__RUPIYO_PENDING_SHARE__ = null;
    }
  } catch (err) {
    console.error('[SHARE_HANDLER] Failed clearing sessionStorage:', err);
  }
  return payload;
}

/**
 * Subscribe to live Android share events (for warm starts)
 */
export function subscribeToShareEvents(onShareReceived) {
  if (typeof window === 'undefined') return () => {};

  const handler = (e) => {
    const payload = e.detail || window.__RUPIYO_PENDING_SHARE__;
    if (payload) {
      setPendingImportPayload(payload);
      onShareReceived(payload);
    }
  };

  window.addEventListener('rupiyo_android_share_intent', handler);
  return () => {
    window.removeEventListener('rupiyo_android_share_intent', handler);
  };
}
