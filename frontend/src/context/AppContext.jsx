import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { fetchHealth, fetchEvents } from '../api/client'
import { reverseGeocode, getCachedLocation } from '../utils/geocoder'

const AppContext = createContext(null)

const INITIAL_FILTERS = {
  search: '',
  classification: 'ALL',
  riskLevel: 'ALL',
  minConfidence: 0.0,
  daynight: 'ALL', // 'ALL' | 'DAY' | 'NIGHT'
}

export function AppProvider({ children }) {
  const [events, setEvents] = useState([])
  const [locations, setLocations] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiHealth, setApiHealth] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard' | 'analytics' | 'investigation' | 'health'
  const [isPredictModalOpen, setIsPredictModalOpen] = useState(false)
  const [mapRef, setMapRef] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Asynchronous background reverse geocode enrichment
  const enrichLocations = useCallback(async (eventList) => {
    if (!eventList || eventList.length === 0) return

    // Quick initial pass with synchronous cached values
    const initialLocs = {}
    eventList.forEach((ev) => {
      const cached = getCachedLocation(ev.latitude, ev.longitude)
      if (cached) {
        initialLocs[ev.event_id] = cached
      }
    })
    setLocations((prev) => ({ ...prev, ...initialLocs }))

    // Background asynchronous resolution
    eventList.forEach(async (ev) => {
      try {
        const loc = await reverseGeocode(ev.latitude, ev.longitude)
        setLocations((prev) => {
          if (prev[ev.event_id] === loc) return prev
          return { ...prev, [ev.event_id]: loc }
        })
      } catch {
        setLocations((prev) => ({ ...prev, [ev.event_id]: 'Location unavailable' }))
      }
    })
  }, [])

  // Polling health & initial events loading
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const health = await fetchHealth()
      setApiHealth(health)

      const eventData = await fetchEvents()
      setEvents(eventData)
      setLastUpdated(new Date())

      // Auto-select the first high-severity event or first event
      if (eventData && eventData.length > 0) {
        const topEvent =
          eventData.find((e) => e.risk_level === 'CRITICAL' || e.risk_level === 'HIGH') ||
          eventData[0]
        setSelectedEvent(topEvent)
      }

      enrichLocations(eventData)
    } catch (err) {
      console.error('Failed to initialize app state:', err)
      setError(err.message || 'Failed to connect to SUDARSHAN API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(async () => {
      const health = await fetchHealth()
      setApiHealth(health)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  // Filtered events with location search support
  const filteredEvents = useMemo(() => {
    if (!events) return []
    return events.filter((ev) => {
      // Search across ID, cluster, class, and location name
      if (filters.search) {
        const q = filters.search.toLowerCase().trim()
        const matchId = ev.event_id?.toLowerCase().includes(q)
        const matchCluster = `cluster_${ev.cluster_id}`.toLowerCase().includes(q)
        const matchClass = ev.predicted_class?.toLowerCase().includes(q)
        const locName = (locations[ev.event_id] || '').toLowerCase()
        const matchLocation = locName.includes(q)

        if (!matchId && !matchCluster && !matchClass && !matchLocation) return false
      }

      // Classification
      if (filters.classification !== 'ALL') {
        if (ev.predicted_class !== filters.classification) return false
      }

      // Risk Level
      if (filters.riskLevel !== 'ALL') {
        if (ev.risk_level !== filters.riskLevel) return false
      }

      // Confidence
      if (ev.confidence < filters.minConfidence) {
        return false
      }

      // Day / Night
      if (filters.daynight === 'DAY' && ev.daynight !== 1) return false
      if (filters.daynight === 'NIGHT' && ev.daynight !== 0) return false

      return true
    })
  }, [events, filters, locations])

  // Center map on event
  const focusEvent = (event) => {
    setSelectedEvent(event)
    if (mapRef && event && event.latitude && event.longitude) {
      mapRef.flyTo([event.latitude, event.longitude], 14, {
        duration: 1.2,
      })
    }
  }

  const getLocation = (eventOrId) => {
    if (!eventOrId) return 'Location unavailable'
    const id = typeof eventOrId === 'string' ? eventOrId : eventOrId.event_id
    return locations[id] || 'Resolving location...'
  }

  const value = {
    events,
    filteredEvents,
    locations,
    getLocation,
    loading,
    error,
    apiHealth,
    selectedEvent,
    setSelectedEvent,
    focusEvent,
    filters,
    setFilters,
    resetFilters,
    activeView,
    setActiveView,
    isPredictModalOpen,
    setIsPredictModalOpen,
    mapRef,
    setMapRef,
    refreshEvents: loadData,
    lastUpdated,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

