const API_URL = ""; // Empty string because vite proxy handles /api

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

  return data;
}
