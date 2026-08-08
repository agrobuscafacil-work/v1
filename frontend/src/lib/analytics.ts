import { api } from './api';

function detectDevice(userAgent: string): string {
  if (/Android/i.test(userAgent)) return 'Mobile';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'Mobile';
  if (/Windows Phone/i.test(userAgent)) return 'Mobile';
  if (/Windows/i.test(userAgent)) return 'Desktop';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Desktop';
  if (/Linux/i.test(userAgent)) return 'Desktop';
  if (/CrOS/i.test(userAgent)) return 'Desktop';
  return 'Outro';
}

function detectBrowser(userAgent: string): string {
  if (/Edg\//i.test(userAgent)) return 'Edge';
  if (/OPR\//i.test(userAgent)) return 'Opera';
  if (/Chrome\//i.test(userAgent)) return 'Chrome';
  if (/Firefox\//i.test(userAgent)) return 'Firefox';
  if (/Safari\//i.test(userAgent)) return 'Safari';
  return 'Outro';
}

let sessionIdCache: string | null = null;

function getSessionId(): string {
  if (sessionIdCache) return sessionIdCache;
  try {
    sessionIdCache = localStorage.getItem('agro_session_id');
    if (!sessionIdCache) {
      sessionIdCache = 's-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('agro_session_id', sessionIdCache);
    }
  } catch {
    sessionIdCache = 's-' + Date.now().toString(36);
  }
  return sessionIdCache;
}

export function trackPageView(pagePath?: string) {
  if (typeof window === 'undefined') return;
  if (navigator.webdriver) return;
  const userAgent = navigator.userAgent;
  const payload = {
    sessionId: getSessionId(),
    pagePath: pagePath || window.location.pathname,
    userAgent,
    device: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
  };
  api.post('/analytics/session', payload).catch(() => undefined);
}

export function trackSearch(term: string) {
  if (typeof window === 'undefined' || !term.trim()) return;
  api.post('/analytics/search', { term: term.trim() }).catch(() => undefined);
}