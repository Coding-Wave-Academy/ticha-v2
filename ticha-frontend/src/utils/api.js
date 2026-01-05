const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Enhanced fetch with offline support
 */
export async function apiFetch(endpoint, options = {}) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:7',message:'apiFetch entry',data:{endpoint,method:options.method||'GET',apiUrl:API_URL,hasToken:!!localStorage.getItem("ticha_token")},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
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
  const fullUrl = `${API_URL}${endpoint}`;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:24',message:'Before fetch',data:{fullUrl,hasToken:!!token,isGet,headers:Object.keys(headers)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:30',message:'After fetch',data:{status:response.status,statusText:response.statusText,contentType:response.headers.get("content-type"),ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const contentType = response.headers.get("content-type") || "";

    if (response.status === 204) {
      return null;
    }

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:37',message:'Non-JSON response',data:{status:response.status,contentType,textPreview:text.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      throw new Error(text || "Unexpected non-JSON response from server");
    }

    const data = await response.json();

    if (!response.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:43',message:'API error response',data:{status:response.status,error:data.error,message:data.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw new Error(
        data.error || data.message || `API Error: ${response.status}`
      );
    }

    // Cache successful GET requests
    if (isGet) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:53',message:'apiFetch success',data:{endpoint,status:response.status,dataKeys:Object.keys(data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return data;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:55',message:'apiFetch error',data:{endpoint,errorMessage:err.message,errorName:err.name,isOffline:!navigator.onLine,isGet},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // If we're offline and it was a GET request, check cache
    if (isGet && (!navigator.onLine || err.message === "Failed to fetch")) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.warn(`[Offline] Using cached data for ${endpoint}`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:60',message:'Using cached data',data:{endpoint,hasCache:!!cached},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return JSON.parse(cached);
      }
    }

    throw err;
  }
}
