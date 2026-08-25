/**
 * Safe API request helper with cross-origin & token management
 */

export function getApiUrl(path: string): string {
  const metaEnv = (import.meta as any).env;
  let baseUrl = (metaEnv?.VITE_API_URL || '').replace(/\/$/, '');

  // If running on a dedicated static frontend without built-in API (e.g. Vercel or static preview)
  if (!baseUrl && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('indochinese-frontend.onrender.com') || host.includes('vercel.app')) {
      baseUrl = 'https://indochinese.onrender.com';
    }
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
}

export async function fetchJson<T = any>(
  path: string,
  options?: RequestInit,
  onUnauthorized?: () => void
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const url = getApiUrl(path);
  
  try {
    const res = await fetch(url, options);
    
    // Check if token expired / unauthorized
    if (res.status === 401 || res.status === 403) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        status: res.status,
        data: null,
        error: res.status === 404
          ? 'API endpoint not found (404). Check backend deployment.'
          : `Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`
      };
    }

    const data = await res.json();
    return {
      ok: res.ok,
      status: res.status,
      data: res.ok ? data : null,
      error: res.ok ? undefined : (data?.error || `Request failed with status ${res.status}`)
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || 'Failed to connect to backend server'
    };
  }
}
