/**
 * Utility functions for reliable image resolution and crisp SVG fallbacks.
 */

// If VITE_API_URL is set (e.g. http://localhost:5000), use it; otherwise fallback to backend port 5000
const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');

/**
 * Clean, elegant placeholder SVG generated dynamically for listings without photos.
 */
export const getFallbackSvg = (label = 'ReLife Item') => {
  const safeLabel = (label || 'ReLife Item')
    .toString()
    .replace(/[<>&"]/g, '')
    .slice(0, 24);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f1f5f9;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bgGrad)" rx="8" />
    <circle cx="300" cy="165" r="50" fill="#cbd5e1" fill-opacity="0.5" />
    <!-- Camera / Package icon in slate -->
    <path d="M280 150 L286 142 L314 142 L320 150 L334 150 C338 150 341 153 341 157 L341 187 C341 191 338 194 334 194 L266 194 C262 194 259 191 259 187 L259 157 C259 153 262 150 266 150 Z" fill="none" stroke="#64748b" stroke-width="3" stroke-linejoin="round" />
    <circle cx="300" cy="172" r="14" fill="none" stroke="#64748b" stroke-width="3" />
    <text x="300" y="248" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#334155" text-anchor="middle">${safeLabel}</text>
    <text x="300" y="276" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#64748b" text-anchor="middle">No image provided</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const FALLBACK_IMAGE = getFallbackSvg('ReLife Product');

/**
 * Resolves any image representation (URL, relative path, filename, image object)
 * to a full, loadable image URL.
 */
export const getImageUrl = (imageInput, fallbackLabel = 'ReLife Product') => {
  if (!imageInput) {
    return getFallbackSvg(fallbackLabel);
  }

  let rawPath = '';

  if (typeof imageInput === 'string') {
    rawPath = imageInput;
  } else if (Array.isArray(imageInput) && imageInput.length > 0) {
    const first = imageInput[0];
    rawPath = typeof first === 'string' ? first : first?.url || '';
  } else if (typeof imageInput === 'object' && imageInput !== null) {
    rawPath = imageInput.url || '';
  }

  if (!rawPath || typeof rawPath !== 'string' || rawPath.trim() === '') {
    return getFallbackSvg(fallbackLabel);
  }

  // Normalize Windows backslashes and whitespace
  const clean = rawPath.replace(/\\/g, '/').trim();

  // If already full HTTP/HTTPS or Data URI
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    // Treat dead via.placeholder.com links as empty
    if (clean.includes('via.placeholder.com')) {
      return getFallbackSvg(fallbackLabel);
    }
    return clean;
  }

  // Uploaded files: e.g. /uploads/filename.jpg, uploads/filename.jpg
  if (clean.startsWith('/uploads/')) {
    return `${API_BASE}${clean}`;
  }
  if (clean.startsWith('uploads/')) {
    return `${API_BASE}/${clean}`;
  }

  // Bare uploaded filename: e.g. 1791527367007-219106505.png
  if (/^[0-9]+-[0-9]+\.(png|jpe?g|webp|gif|svg|avif)$/i.test(clean)) {
    return `${API_BASE}/uploads/${clean}`;
  }

  // Any other relative path
  const pathWithSlash = clean.startsWith('/') ? clean : `/${clean}`;
  return `${API_BASE}${pathWithSlash}`;
};

export const handleImageError = (e, fallbackLabel = 'ReLife Product') => {
  e.target.onerror = null;
  e.target.src = getFallbackSvg(fallbackLabel);
};
