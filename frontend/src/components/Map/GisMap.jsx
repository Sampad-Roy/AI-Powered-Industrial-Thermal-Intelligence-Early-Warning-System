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
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASS_COLORS, RISK_LEVELS } from '../../utils/constants'
import { formatFRP, formatTempK, formatDistance, formatPercent, formatCoords } from '../../utils/formatters'
import MapLegend from './MapLegend'

// Helper component to capture map instance & respond to external camera commands
function MapController({ events, selectedEvent, setMapInstance }) {
  const map = useMap()

  useEffect(() => {
    if (map) {
      setMapInstance(map)
    }
  }, [map, setMapInstance])

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
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community | NASA FIRMS',
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
        border: 2px solid ${isSelected ? '#ffffff' : '#060b17'};
        box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${ringColor};
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
          background-color: #060b17;
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
    <div className="relative w-full h-full flex flex-col bg-[#040813] overflow-hidden">
      {/* Tactical Map Header Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-[#081020]/95 backdrop-blur-md p-1.5 rounded-lg border border-[#1a2b48] shadow-2xl">
        {/* Basemap Switcher (100% Free / No API Key required) */}
        <div className="flex items-center rounded-md bg-[#050b17] border border-[#16233b] p-0.5 text-xs font-mono">
          <button
            onClick={() => setTileLayer('osm')}
            title="OpenStreetMap Standard Basemap (Free, No Key)"
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              tileLayer === 'osm'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>OSM (STANDARD)</span>
          </button>
          <button
            onClick={() => setTileLayer('dark')}
            title="Tactical Dark Basemap (Free, No Key)"
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              tileLayer === 'dark'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>DARK GIS</span>
          </button>
          <button
            onClick={() => setTileLayer('satellite')}
            title="High-Resolution Satellite Imagery (Free, No Key)"
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              tileLayer === 'satellite'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
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
            className="btn-tactical text-xs px-2 py-1 bg-[#050b17] hover:bg-[#0e1b32] text-slate-300 hover:text-cyan-300 border-[#16233b] hover:border-cyan-500/50 rounded-md transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="btn-tactical text-xs px-2 py-1 bg-[#050b17] hover:bg-[#0e1b32] text-slate-300 hover:text-cyan-300 border-[#16233b] hover:border-cyan-500/50 rounded-md transition-all shadow-sm"
          >
            <Minus className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={handleFitBounds}
            title="Fit view to all active events"
            className="btn-tactical text-[11px] px-2.5 py-1 bg-[#050b17] hover:bg-[#0e1b32] text-slate-300 hover:text-cyan-300 border-[#16233b] hover:border-cyan-500/50 rounded-md transition-all shadow-sm flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>FIT ALL</span>
          </button>
        </div>
      </div>

      {/* Coordinate & Sensor Banner */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-2.5 bg-[#081020]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1a2b48] text-[11px] font-mono text-slate-300 shadow-xl">
        <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
        <span>CRS: EPSG:4326 (WGS84)</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-300">VIIRS 375m I-Band Thermal Telemetry</span>
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
                offset={[0, -12]}
                opacity={0.98}
                className="custom-leaflet-tooltip"
              >
                <div className="p-2 bg-[#081020] text-slate-100 rounded-md border border-[#1a2b48] font-sans text-xs shadow-xl min-w-[180px]">
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#16233b]">
                    <span className="font-mono font-bold text-[11px] text-cyan-300">
                      {event.event_id}
                    </span>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase"
                      style={{
                        backgroundColor: riskCfg.bg,
                        color: riskCfg.color,
                        border: `1px solid ${riskCfg.border}`,
                      }}
                    >
                      {event.risk_level} • {event.final_risk_score}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="text-slate-200 font-semibold truncate">
                      {event.predicted_class}
                    </div>
                    <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                      <span>FRP: <b className="text-amber-400">{formatFRP(event.frp)}</b></span>
                      <span>Conf: <b className="text-cyan-300">{formatPercent(event.confidence)}</b></span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono pt-0.5 text-center text-cyan-400/80">
                      Click marker to inspect full intelligence
                    </div>
                  </div>
                </div>
              </Tooltip>

              {/* Event Popup with Comprehensive Quick Telemetry */}
              <Popup className="custom-popup" closeButton={false}>
                <div className="p-3 w-72 bg-[#081020] text-slate-100 rounded-lg border border-[#1a2b48] font-sans select-none shadow-2xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#16233b]">
                    <span className="font-mono font-bold text-xs text-cyan-400">
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
                  <div className="p-2 rounded bg-[#050b17] border border-[#16233b] mb-2 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                        LOCATION (OSM)
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
                      <span className="font-semibold text-slate-200">
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
                      <span className="font-mono text-slate-200">
                        {formatTempK(event.bright_ti4)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Distance to Industry:</span>
                      <span className="font-mono text-slate-300">
                        {formatDistance(event.distance_to_industry)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#16233b] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Cluster #{event.cluster_id}
                    </span>
                    <button
                      onClick={() => focusEvent(event)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/50"
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
