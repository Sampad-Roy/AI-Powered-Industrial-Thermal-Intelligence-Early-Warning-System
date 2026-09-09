/**
 * SUDARSHAN API Client
 * Connects directly to the SIH26162 FastAPI Backend (/health, /events, /predict).
 */

const API_BASE = '' // Uses Vite proxy in development; relative in production

export async function fetchHealth() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      throw new Error(`Health check failed: HTTP ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    return {
      status: 'error',
      model_loaded: false,
      error: err.message,
    }
  }
}

export async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`)
    if (!res.ok) {
      throw new Error(`Failed to load thermal events catalog: HTTP ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    console.error('API fetchEvents error:', err)
    throw err
  }
}

export async function runPredict(payload) {
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      let errDetail = `HTTP ${res.status}`
      try {
        const errorJson = await res.json()
        if (Array.isArray(errorJson.detail)) {
          // Format FastAPI 422 validation errors
          errDetail = errorJson.detail
            .map((e) => {
              const field = Array.isArray(e.loc) ? e.loc.slice(1).join('.') || e.loc.join('.') : ''
              return field ? `${field}: ${e.msg}` : e.msg
            })
            .join(' | ')
        } else if (typeof errorJson.detail === 'string') {
          errDetail = errorJson.detail
        } else if (errorJson.message) {
          errDetail = errorJson.message
        } else {
          errDetail = JSON.stringify(errorJson)
        }
      } catch {
        // fallback to status code
      }

      if (res.status === 422) {
        throw new Error(`Validation Error (422): ${errDetail}`)
      }
      throw new Error(`Inference request failed (${res.status}): ${errDetail}`)
    }

    return await res.json()
  } catch (err) {
    if (err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('failed to fetch'))) {
      throw new Error('AI ENGINE UNAVAILABLE: Unable to reach inference gateway. Ensure FastAPI server is running on http://127.0.0.1:8000.')
    }
    console.error('API runPredict error:', err)
    throw err
  }
}
