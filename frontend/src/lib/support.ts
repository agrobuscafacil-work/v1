export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const SUPPORT_FILE_URL = (path: string) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvida',
  CLOSED: 'Fechada',
};

export const SUPPORT_STATUS_BADGE: Record<string, string> = {
  OPEN: 'badge-yellow',
  IN_PROGRESS: 'badge-blue',
  RESOLVED: 'badge-green',
  CLOSED: 'badge-red',
};

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${units[i]}`;
}

export interface SupportBrowserInfo {
  browser?: string;
  os?: string;
  device?: string;
  appVersion?: string;
}

export function getBrowserInfo(): SupportBrowserInfo {
  if (typeof navigator === 'undefined') return {};

  const ua = navigator.userAgent || '';
  const info: SupportBrowserInfo = {};

  if (ua.includes('Edg/')) info.browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) info.browser = 'Opera';
  else if (ua.includes('Chrome/')) info.browser = 'Chrome';
  else if (ua.includes('Safari/')) info.browser = 'Safari';
  else if (ua.includes('Firefox/')) info.browser = 'Firefox';
  else if (ua.includes('MSIE') || ua.includes('Trident/')) info.browser = 'Internet Explorer';

  if (ua.includes('Windows')) info.os = 'Windows';
  else if (ua.includes('Android')) info.os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) info.os = 'iOS';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) info.os = 'macOS';
  else if (ua.includes('Linux')) info.os = 'Linux';

  if (ua.includes('iPhone')) info.device = 'iPhone';
  else if (ua.includes('iPad')) info.device = 'iPad';
  else if (ua.includes('Android')) info.device = 'Android';
  else if (/Mobi/.test(ua)) info.device = 'Celular';
  else if (ua.includes('Tablet')) info.device = 'Tablet';
  else info.device = 'Computador';

  const match = ua.match(/version\/([\d.]+)/i) || ua.match(/(?:chrome|firefox|edg)\/([\d.]+)/i);
  if (match) info.appVersion = match[1];

  return info;
}
