import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  Layers,
  Maximize2,
  Plus,
  Minus,
  Crosshair,
  Flame,
  Radio,
  Factory,
  Trees,
  AlertTriangle,
  Compass,
  Sparkles,
  Info,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASS_COLORS, RISK_LEVELS } from '../../utils/constants'
import { formatFRP, formatTempK, formatDistance, formatPercent, formatCoords } from '../../utils/formatters'
import MapLegend from './MapLegend'

// Helper component to capture map instance & respond to external camera commands
function MapController({ events, selectedEvent, setMapInstance, markerRefs }) {
  const map = useMap()

  useEffect(() => {
    if (map) {
      setMapInstance(map)
      const t = setTimeout(() => {
        map.invalidateSize()
      }, 150)
      return () => clearTimeout(t)
    }
  }, [map, setMapInstance])

  // Automatically fly to & focus selectedEvent when selectedEvent or map changes
  useEffect(() => {
    if (!map || !selectedEvent) return
    const lat = Number(selectedEvent.latitude)
    const lng = Number(selectedEvent.longitude)
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      try {
        map.flyTo([lat, lng], 14, {
          duration: 1.2,
        })
        const timer = setTimeout(() => {
          if (markerRefs?.current && markerRefs.current[selectedEvent.event_id]) {
            markerRefs.current[selectedEvent.event_id].openPopup()
          }
        }, 650)
        return () => clearTimeout(timer)
      } catch (err) {
        console.warn('GisMap flyTo warning:', err)
      }
    }
  }, [map, selectedEvent?.event_id, selectedEvent?.latitude, selectedEvent?.longitude, markerRefs])

  return null
}

export default function GisMap() {
  const {
    filteredEvents,
    selectedEvent,
    focusEvent,
    setMapRef,
    mapRef,
    getLocation,
  } = useApp()

  const [tileLayer, setTileLayer] = useState('osm') // 'osm' | 'dark' | 'satellite'
  const markerRefs = useRef({})

  // Default focus: Gujarat Industrial Belt (Sanand, Vatva, Ahmedabad, Dahej)
  const defaultCenter = [22.98, 72.48]
  const defaultZoom = 11

  // Free basemaps (Zero API keys required - completely open & reliable)
  const tileProviders = {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | NASA FIRMS',
      maxZoom: 19,
      className: '',
    },
    dark: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | NASA FIRMS',
      maxZoom: 19,
      className: 'map-tiles-dark',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; NASA FIRMS',
      maxZoom: 19,
      className: '',
    },
  }

  // Create custom marker icons styled by hazard classification and risk tier
  const createMarkerIcon = (event, isSelected) => {
    const riskLevel = event.risk_level || 'LOW'
    const riskCfg = RISK_LEVELS[riskLevel] || RISK_LEVELS.LOW
    const isCritical = riskLevel === 'CRITICAL'
    const isHigh = riskLevel === 'HIGH'

    let pulseClass = ''
    if (isCritical) pulseClass = 'animate-pulse-critical'
    else if (isHigh) pulseClass = 'animate-pulse-high'

    const size = isSelected ? 32 : isCritical ? 28 : isHigh ? 24 : 20
    const ringColor = riskCfg.color || '#10b981'

    const html = `
      <div class="custom-map-marker ${isSelected ? 'selected' : ''} ${pulseClass}" style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${ringColor};
        border: 2px solid ${isSelected ? '#ffffff' : '#040916'};
        box-shadow: 0 0 ${isSelected ? '18px' : '10px'} ${ringColor};
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
      ">
        <div style="
          width: ${size - 8}px;
          height: ${size - 8}px;
          border-radius: 50%;
          background-color: #040916;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: ${size - 14}px;
            height: ${size - 14}px;
            border-radius: 50%;
            background-color: ${ringColor};
          "></div>
        </div>
      </div>
    `

    return L.divIcon({
      html,
      className: 'leaflet-custom-marker-wrapper',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
      tooltipAnchor: [0, -size / 2],
    })
  }

  const handleFitBounds = () => {
    if (mapRef && filteredEvents.length > 0) {
      const bounds = L.latLngBounds(
        filteredEvents.map((e) => [e.latitude, e.longitude])
      )
      mapRef.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 })
    }
  }

  const handleZoomIn = () => {
    if (mapRef) {
      mapRef.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapRef) {
      mapRef.zoomOut()
    }
  }

  return (
    <div className="relative w-full h-[520px] md:h-[580px] lg:h-[620px] flex flex-col bg-[#020611] overflow-hidden rounded-xl border border-[#172a4c] shadow-2xl">
      {/* Tactical Map Header Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-[#060c1c]/95 backdrop-blur-md p-1.5 rounded-lg border border-[#172a4c] shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        {/* Basemap Switcher */}
        <div className="flex items-center rounded-md bg-[#040916] border border-[#14223d] p-0.5 text-xs font-mono">
          <button
            onClick={() => setTileLayer('osm')}
            title="OpenStreetMap Standard Basemap (Free, No Key)"
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tileLayer === 'osm'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>OSM (STANDARD)</span>
          </button>
          <button
            onClick={() => setTileLayer('dark')}
            title="Tactical Dark Basemap (Free, No Key)"
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tileLayer === 'dark'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>DARK GIS</span>
          </button>
          <button
            onClick={() => setTileLayer('satellite')}
            title="High-Resolution Satellite Imagery (Free, No Key)"
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tileLayer === 'satellite'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>SATELLITE</span>
          </button>
        </div>

        {/* Tactical Zoom & Navigation Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="btn-tactical text-xs px-2 py-1 bg-[#040916] hover:bg-[#0c1830] text-slate-300 hover:text-cyan-300 border-[#14223d] hover:border-cyan-500/50 rounded-md transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="btn-tactical text-xs px-2 py-1 bg-[#040916] hover:bg-[#0c1830] text-slate-300 hover:text-cyan-300 border-[#14223d] hover:border-cyan-500/50 rounded-md transition-all shadow-sm cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={handleFitBounds}
            title="Fit view to all active events"
            className="btn-tactical text-[11px] px-2.5 py-1 bg-[#040916] hover:bg-[#0c1830] text-slate-300 hover:text-cyan-300 border-[#14223d] hover:border-cyan-500/50 rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>FIT ALL</span>
          </button>
        </div>
      </div>

      {/* Coordinate & Sensor Banner */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-2.5 bg-[#060c1c]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#172a4c] text-[11px] font-mono text-slate-300 shadow-xl">
        <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-300 font-bold">CRS: EPSG:4326 (WGS84)</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-300 font-semibold">VIIRS 375m I-Band Telemetry</span>
        {selectedEvent && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-bold">{selectedEvent.event_id}</span>
            <span className="text-slate-400">({formatCoords(selectedEvent.latitude, selectedEvent.longitude)})</span>
          </>
        )}
      </div>

      {/* Tactical Map Legend */}
      <MapLegend />

      {/* Main Professional Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false}
        className="w-full h-full"
        style={{ width: '100%', height: '100%', minHeight: '320px' }}
      >
        <MapController
          events={filteredEvents}
          selectedEvent={selectedEvent}
          setMapInstance={setMapRef}
          markerRefs={markerRefs}
        />

        {/* Selected Tile Layer Provider */}
        <TileLayer
          key={tileLayer}
          url={tileProviders[tileLayer].url}
          attribution={tileProviders[tileLayer].attribution}
          maxZoom={tileProviders[tileLayer].maxZoom}
          className={tileProviders[tileLayer].className}
        />

        {/* Dynamic Event Markers with Hover Tooltips and Click Popups */}
        {filteredEvents.map((event) => {
          const isSelected = selectedEvent?.event_id === event.event_id
          const icon = createMarkerIcon(event, isSelected)
          const classCfg = CLASS_COLORS[event.predicted_class] || CLASS_COLORS['Other Thermal Source']
          const riskCfg = RISK_LEVELS[event.risk_level] || RISK_LEVELS.LOW

          return (
            <Marker
              key={event.event_id}
              position={[event.latitude, event.longitude]}
              icon={icon}
              ref={(ref) => {
                if (ref) markerRefs.current[event.event_id] = ref
              }}
              eventHandlers={{
                click: () => focusEvent(event),
              }}
            >
              {/* Event Hover Tooltip */}
              <Tooltip
                direction="top"
                offset={[0, -14]}
                opacity={0.98}
                className="custom-leaflet-tooltip"
              >
                <div className="p-2.5 bg-[#060c1c] text-slate-100 rounded-lg border border-[#172a4c] font-sans text-xs shadow-2xl min-w-[200px]">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#12203a]">
                    <span className="font-mono font-bold text-[11px] text-cyan-300">
                      {event.event_id}
                    </span>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase"
                      style={{
                        backgroundColor: riskCfg.bg,
                        color: riskCfg.color,
                        border: `1px solid ${riskCfg.border}`,
                      }}
                    >
                      {event.risk_level} • {event.final_risk_score}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-200 font-bold truncate flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: classCfg.bg }}></span>
                      {event.predicted_class}
                    </div>
                    <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                      <span>FRP: <b className="text-amber-400 font-bold">{formatFRP(event.frp)}</b></span>
                      <span>Conf: <b className="text-cyan-300 font-bold">{formatPercent(event.confidence)}</b></span>
                    </div>
                    <div className="text-[9px] text-cyan-400 font-mono pt-1 text-center border-t border-[#12203a]">
                      Click to open full satellite intelligence
                    </div>
                  </div>
                </div>
              </Tooltip>

              {/* Event Popup with Comprehensive Quick Telemetry */}
              <Popup className="custom-popup" closeButton={false}>
                <div className="p-3.5 w-76 bg-[#060c1c] text-slate-100 rounded-lg border border-[#172a4c] font-sans select-none shadow-2xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#12203a]">
                    <span className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      {event.event_id}
                    </span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: riskCfg.bg,
                        color: riskCfg.color,
                        border: `1px solid ${riskCfg.border}`,
                      }}
                    >
                      {event.risk_level} • {event.final_risk_score}
                    </span>
                  </div>

                  {/* Geocoded Location in Popup */}
                  <div className="p-2.5 rounded bg-[#030712] border border-[#12203a] mb-2.5 flex items-start gap-2 shadow-inner">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                        LOCATION (OSM / NOMINATIM)
                      </span>
                      <p className="text-[11px] font-semibold text-slate-200 leading-snug break-words">
                        {getLocation(event)}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                        {formatCoords(event.latitude, event.longitude)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Classification:</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: classCfg.bg }}></span>
                        {event.predicted_class}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">AI Confidence:</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {formatPercent(event.confidence)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Radiative Power:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {formatFRP(event.frp)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">TI4 Brightness:</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {formatTempK(event.bright_ti4)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Distance to Industry:</span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {formatDistance(event.distance_to_industry)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#12203a] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Cluster #{event.cluster_id}
                    </span>
                    <button
                      onClick={() => focusEvent(event)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/50 cursor-pointer"
                    >
                      Inspect Intelligence &rarr;
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
