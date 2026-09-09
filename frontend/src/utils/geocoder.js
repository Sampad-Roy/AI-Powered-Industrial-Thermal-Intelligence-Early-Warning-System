/**
 * SUDARSHAN OpenStreetMap / Nominatim Reverse Geocoding Service
 * Enriches satellite coordinate detections (lat/lon) with real-world geographical names.
 * Features persistent localStorage caching, in-memory memoization, and request throttling.
 */

const CACHE_KEY = 'sudarshan_geo_cache_v1'
const memoryCache = new Map()

// Load persistent cache from localStorage
function initCache() {
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      Object.entries(parsed).forEach(([k, v]) => memoryCache.set(k, v))
    }
  } catch (e) {
    console.warn('Unable to load geocode cache from localStorage:', e)
  }
}

initCache()

function saveCache() {
  try {
    const obj = {}
    memoryCache.forEach((v, k) => {
      obj[k] = v
    })
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch (e) {
    // Ignore storage quota limits
  }
}

export function getCoordKey(lat, lon) {
  if (lat === undefined || lon === undefined || lat === null || lon === null) return ''
  return `${parseFloat(lat).toFixed(4)},${parseFloat(lon).toFixed(4)}`
}

/**
 * Format Nominatim response into a clean, concise location string
 */
function formatNominatimAddress(data) {
  if (!data) return 'Location unavailable'
  
  if (data.address) {
    const addr = data.address
    const parts = []

    // Primary place / locality
    const primary =
      addr.industrial ||
      addr.commercial ||
      addr.neighbourhood ||
      addr.suburb ||
      addr.village ||
      addr.town ||
      addr.city ||
      addr.hamlet

    if (primary) parts.push(primary)

    // District / County / Taluka
    const district = addr.county || addr.state_district || addr.district
    if (district && district !== primary) parts.push(district)

    // State / Region
    const state = addr.state
    if (state && !parts.includes(state)) parts.push(state)

    if (parts.length > 0) {
      return parts.join(', ')
    }
  }

  if (data.display_name) {
    // Take first 3 comma-separated components from display_name
    return data.display_name
      .split(',')
      .slice(0, 3)
      .map((s) => s.trim())
      .join(', ')
  }

  return 'Location unavailable'
}

// Throttled request queue to strictly adhere to OSM Nominatim policy
let lastRequestTime = 0
const requestQueue = []
let isProcessingQueue = false

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return
  isProcessingQueue = true

  while (requestQueue.length > 0) {
    const { lat, lon, key, resolve } = requestQueue.shift()

    // Check memory cache again
    if (memoryCache.has(key)) {
      resolve(memoryCache.get(key))
      continue
    }

    // Rate limit: 800ms minimum between network requests
    const now = Date.now()
    const timeSinceLast = now - lastRequestTime
    if (timeSinceLast < 800) {
      await new Promise((r) => setTimeout(r, 800 - timeSinceLast))
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14`
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      })

      lastRequestTime = Date.now()

      if (!res.ok) {
        throw new Error(`Nominatim HTTP ${res.status}`)
      }

      const data = await res.json()
      const formatted = formatNominatimAddress(data)
      memoryCache.set(key, formatted)
      saveCache()
      resolve(formatted)
    } catch (err) {
      console.warn(`Geocoding error for [${lat}, ${lon}]:`, err.message)
      const fallback = 'Location unavailable'
      memoryCache.set(key, fallback)
      resolve(fallback)
    }
  }

  isProcessingQueue = false
}

/**
 * Reverse geocode a single coordinate pair (lat, lon)
 */
export function reverseGeocode(lat, lon) {
  const key = getCoordKey(lat, lon)
  if (!key) return Promise.resolve('Location unavailable')

  if (memoryCache.has(key)) {
    return Promise.resolve(memoryCache.get(key))
  }

  return new Promise((resolve) => {
    requestQueue.push({ lat, lon, key, resolve })
    processQueue()
  })
}

/**
 * Get synchronously from cache if available, otherwise null
 */
export function getCachedLocation(lat, lon) {
  const key = getCoordKey(lat, lon)
  return memoryCache.get(key) || null
}
