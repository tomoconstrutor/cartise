export function isLocalPreview(hostname = globalThis.location?.hostname ?? '') {
  return ['localhost', '127.0.0.1', '[::1]', '::1', 'terminal.local'].includes(hostname) || /^192\.168\./.test(hostname) || /^10\./.test(hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
}

// No personal fields or file names are recorded. Connect cartise:event to an approved analytics service when available.
export function track(name, details = {}) {
  if (typeof window === 'undefined') return;
  const event = { name, page: location.pathname, audience: details.audience, example: details.example, time: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent('cartise:event', { detail: event }));
  if (isLocalPreview()) {
    try {
      const events = JSON.parse(sessionStorage.getItem('cartise:events') || '[]');
      sessionStorage.setItem('cartise:events', JSON.stringify([...events, event].slice(-50)));
    } catch { /* Preview still works when browser storage is unavailable. */ }
  }
}
