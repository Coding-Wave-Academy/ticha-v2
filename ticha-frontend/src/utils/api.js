const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Enhanced fetch with offline support
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("ticha_token");
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const cacheKey = `ticha_cache_${endpoint}`;

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";

    if (response.status === 204) {
      return null;
    }

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(text || "Unexpected non-JSON response from server");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `API Error: ${response.status}`
      );
    }

    // Cache successful GET requests
    if (isGet) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    // If we're offline and it was a GET request, check cache
    if (isGet && (!navigator.onLine || err.message === "Failed to fetch")) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.warn(`[Offline] Using cached data for ${endpoint}`);
        return JSON.parse(cached);
      }
    }

    throw err;
  }
}
