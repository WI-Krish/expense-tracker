/**
 * client/src/utils/api.js - API Configuration & Auto-detect Base URL
 *
 * Automatically detects whether running locally / LAN / hotspot (e.g. 172.20.x.x, 192.168.x.x, localhost)
 * or in cloud production:
 * - VITE_API_URL environment variable if explicitly configured
 * - http://<current-host>:5001 when running locally or on LAN
 * - https://expense-tracker-5i3x.onrender.com in production deployment
 */

export const API_BASE = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // Detect localhost, loopback, or private LAN / hotspot IP addresses (172.16-31.x.x, 192.168.x.x, 10.x.x.x)
    const isLocalOrLAN =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      Boolean(import.meta.env.DEV);

    if (isLocalOrLAN) {
      // Connects to local server port 5001 on the same machine/host
      return `${protocol}//${host}:5001`;
    }
  }

  return 'https://expense-tracker-5i3x.onrender.com';
})();
