let cachedCsrf: string | null = null;
let csrfPromise: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  if (cachedCsrf) return cachedCsrf;
  if (!csrfPromise) {
    csrfPromise = fetch('/api/csrf', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Cannot connect to the server.');
        const data = await res.json();
        cachedCsrf = data.token;
        return data.token;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.method && options.method !== 'GET') {
    try {
      const token = await getCsrfToken();
      headers.set('X-CSRF-TOKEN', token);
    } catch {
      // Continue anyway; server will validate session
    }
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch('/api/' + path, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && path.startsWith('admin/') && typeof window !== 'undefined') {
      window.location.assign('/admin/login');
    }
    if (response.status === 419) {
      cachedCsrf = null; // Invalidate CSRF on token expiry
    }
    const errors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
    throw new Error(errors || data.message || 'Request failed. Please try again.');
  }

  return data as T;
}
