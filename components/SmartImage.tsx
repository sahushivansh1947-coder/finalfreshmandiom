
import React, { useState, useEffect, useRef } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  /** Target display width in px — controls compression. Default: 400 */
  width?: number;
  /** Quality 1-100. Default: 75 (keeps imgs under 100KB for most sizes) */
  quality?: number;
  /** Load eagerly (no lazy). Use for above-the-fold images only. */
  priority?: boolean;
  /** aspect-ratio string e.g. '1/1', '4/3', '16/9'. Default: '1/1' */
  aspectRatio?: string;
  className?: string;
  wrapperClassName?: string;
  sizes?: string;
}

const CACHE_NAME = 'galimandi-img-cache-v1';
const FALLBACK = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=60&w=300';

// ─── URL helpers ─────────────────────────────────────────────────────────────

/** Returns a fully optimized URL for the given source. */
const toOptimizedUrl = (src: string, width: number, quality: number): string => {
  if (!src) return FALLBACK;
  if (src.includes('unsplash.com')) {
    const base = src.split('?')[0];
    return `${base}?auto=format&fit=crop&q=${quality}&w=${width}`;
  }
  // All other URLs (InsForge storage, your own CDN, etc.) are returned as-is.
  return src;
};

/** Returns a tiny 20px blur-placeholder URL (Unsplash only). */
const toPlaceholderUrl = (src: string): string | null => {
  if (!src || !src.includes('unsplash.com')) return null;
  const base = src.split('?')[0];
  return `${base}?auto=format&fit=crop&q=10&w=20`;
};

/** Builds srcset for responsive delivery (Unsplash only). */
const toSrcSet = (src: string, quality: number): string | undefined => {
  if (!src || !src.includes('unsplash.com')) return undefined;
  const base = src.split('?')[0];
  return [200, 400, 600, 800]
    .map(w => `${base}?auto=format&fit=crop&q=${quality}&w=${w} ${w}w`)
    .join(', ');
};

// ─── Cache helpers (Browser Cache API — no SW needed) ────────────────────────

async function getCachedObjectUrl(url: string): Promise<string | null> {
  if (!('caches' in window)) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const resp = await cache.match(url);
    if (resp) {
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch {
    return null;
  }
}

async function cacheAndGetObjectUrl(url: string): Promise<string> {
  if (!('caches' in window)) return url;
  try {
    const cache = await caches.open(CACHE_NAME);
    // Fetch with no-cors for cross-origin images isn't ideal,
    // but for same-origin / CDN images it works fine.
    const response = await fetch(url);
    if (!response.ok) return url;
    await cache.put(url, response.clone());
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return url; // On failure, fall back to direct URL
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  width = 400,
  quality = 75,
  priority = false,
  aspectRatio, // Remove default 1/1
  className = '',
  wrapperClassName = '',
  sizes,
}) => {
  const [displaySrc, setDisplaySrc] = useState<string>('');
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const optimizedUrl = toOptimizedUrl(errored ? FALLBACK : src, width, quality);

  useEffect(() => {
    let cancelled = false;

    // Set blur placeholder immediately (no network wait)
    const placeholder = toPlaceholderUrl(src);
    if (placeholder) setPlaceholderSrc(placeholder);

    const resolve = async () => {
      // 1. Check browser cache first (instant — no TTFB)
      const cached = await getCachedObjectUrl(optimizedUrl);
      if (cached && !cancelled) {
        objectUrlRef.current = cached;
        setDisplaySrc(cached);
        return;
      }
      // 2. Not cached — use direct URL immediately so img loads while we cache
      if (!cancelled) setDisplaySrc(optimizedUrl);

      // 3. Cache in background for next visit (only for external URLs)
      if (src.includes('unsplash.com') || src.startsWith('http')) {
        cacheAndGetObjectUrl(optimizedUrl).then(objUrl => {
          if (!cancelled && objUrl !== optimizedUrl) {
            // Swap to object URL (fully local) after caching
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = objUrl;
            setDisplaySrc(objUrl);
          }
        });
      }
    };

    resolve();

    return () => {
      cancelled = true;
      // Object URLs are revoked on component unmount to prevent memory leaks
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src, optimizedUrl]);

  const srcSet = !errored ? toSrcSet(src, quality) : undefined;
  const defaultSizes = sizes || `(max-width: 640px) ${Math.round(width * 0.6)}px, ${width}px`;

  // Determine object-fit: if user provided one in className, use it; otherwise use cover for fixed ratios and auto for natural.
  const hasObjectFit = className.includes('object-');
  const finalObjectFit = hasObjectFit ? undefined : (aspectRatio ? 'cover' : 'initial');

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{ aspectRatio: aspectRatio || 'auto', background: '#f3f4f6' }}
    >
      {/* ── Blur placeholder (shown while main image loads) ── */}
      {placeholderSrc && !loaded && (
        <img
          src={placeholderSrc}
          aria-hidden="true"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: aspectRatio ? 'cover' : 'initial',
            filter: 'blur(12px)',
            transform: 'scale(1.1)', // hides blur edges
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* ── Shimmer skeleton (when no placeholder is available) ── */}
      {!placeholderSrc && !loaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'smartimg-shimmer 1.5s infinite',
          }}
        />
      )}

      {/* ── Main image ── */}
      {displaySrc && (
        <img
          src={displaySrc}
          srcSet={srcSet}
          sizes={defaultSizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
            setDisplaySrc(FALLBACK);
          }}
          className={className}
          style={{
            position: aspectRatio ? 'absolute' : 'relative',
            inset: aspectRatio ? 0 : undefined,
            width: '100%',
            height: aspectRatio ? '100%' : 'auto',
            objectFit: finalObjectFit as any,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            display: 'block',
          }}
        />
      )}

      {/* ── Global keyframes (injected once) ── */}
      <style>{`
        @keyframes smartimg-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SmartImage;
