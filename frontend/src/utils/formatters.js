export function formatNumber(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return Number(val).toFixed(decimals)
}

export function formatTempK(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return `${Number(val).toFixed(1)} K`
}

export function formatTempC(valK) {
  if (valK === null || valK === undefined || isNaN(valK)) return '—'
  return `${(Number(valK) - 273.15).toFixed(1)} °C`
}

export function formatFRP(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return `${Number(val).toFixed(2)} MW`
}

export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) return '—'
  const m = Number(meters)
  if (m >= 1000) {
    return `${(m / 1000).toFixed(2)} km`
  }
  return `${m.toFixed(0)} m`
}

export function formatCoords(lat, lon) {
  if (lat === undefined || lon === undefined) return '—'
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const lonStr = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`
  return `${latStr}, ${lonStr}`
}

export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const num = Number(val)
  // If already 0-1 range
  if (num <= 1.0) {
    return `${(num * 100).toFixed(1)}%`
  }
  return `${num.toFixed(1)}%`
}

export function formatTimestamp(dtString) {
  if (!dtString) return '—'
  try {
    const d = new Date(dtString)
    if (isNaN(d.getTime())) return dtString
    return d.toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
  } catch {
    return dtString
  }
}
