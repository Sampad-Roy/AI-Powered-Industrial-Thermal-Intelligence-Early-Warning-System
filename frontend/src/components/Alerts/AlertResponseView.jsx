import React, { useState, useMemo } from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Radio,
  Factory,
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Bell,
  Siren,
  Sliders,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  FileText,
  PhoneCall,
  History,
  CheckSquare,
  Square,
  Compass,
  Zap,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  Info,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASS_COLORS } from '../../utils/constants'
import {
  formatFRP,
  formatPercent,
  formatDistance,
  formatCoords,
  formatTempK,
  formatTimestamp,
} from '../../utils/formatters'

// Severity mapping derived strictly for presentation from existing risk score (0-100)
export function getAlertSeverity(riskScore) {
  const score = Number(riskScore) || 0
  if (score >= 75) {
    return {
      level: 'CRITICAL',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.45)',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-950/80',
      badgeBorder: 'border-rose-500/50',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.25)]',
      desc: 'Immediate Emergency Response Protocol',
      sopTitle: 'GIDC HAZMAT & FIRE RESCUE DISPATCH SOP',
    }
  }
  if (score >= 50) {
    return {
      level: 'HIGH',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.45)',
      text: 'text-orange-400',
      badgeBg: 'bg-orange-950/80',
      badgeBorder: 'border-orange-500/50',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      desc: 'Priority Industrial Inspection & Containment',
      sopTitle: 'REGULATORY EMISSION & SAFETY AUDIT SOP',
    }
  }
  if (score >= 30) {
    return {
      level: 'MODERATE',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.45)',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-500/50',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      desc: 'Routine Industrial Surveillance Watchlist',
      sopTitle: 'PERSISTENCE MONITORING & FACILITY INQUIRY',
    }
  }
  return {
    level: 'LOW',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.45)',
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/50',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    desc: 'Baseline Thermal Observation',
    sopTitle: 'BASELINE MONITORING PROTOCOL',
  }
}

// Human-readable situational explanation for public view
export function getWhatHappenedExplanation(alert) {
  if (!alert) return ''
  const cls = alert.predicted_class
  if (cls === 'Industrial Fire') {
    return 'Satellite Earth Observation sensors detected an acute, high-radiance thermal anomaly adjacent to an industrial installation, indicating an active combustion or structural fire event requiring urgent response.'
  }
  if (cls === 'Gas Flare') {
    return 'Thermal infrared sensors recorded a localized high-temperature point source characteristic of industrial flare stack emissions and continuous or intermittent gas combustion.'
  }
  if (cls === 'Persistent Industrial Heat') {
    return 'Recurrent satellite passes registered steady, elevated thermal signatures consistent with high-temperature industrial operations such as boilers, furnaces, or kilns within registered facility boundaries.'
  }
  return 'A baseline thermal reading was detected during the satellite overpass, corresponding to routine low-risk or non-industrial thermal activity.'
}

// Actionable safety guidance for public and on-ground awareness
export function getSafetyGuidance(alert) {
  if (!alert) return []
  const cls = alert.predicted_class
  if (cls === 'Industrial Fire') {
    return [
      'Maintain a safe buffer distance of at least 500 meters from the identified industrial sector.',
      'Keep windows and ventilation systems closed if downwind to avoid inhaling smoke or particulate fumes.',
      'Yield right of way on industrial access roads for fire rescue and emergency response vehicles.',
    ]
  }
  if (cls === 'Gas Flare') {
    return [
      'Industrial flaring is generally controlled; no immediate evacuation is required.',
      'Facility safety officers should verify combustion efficiency and steam-assist ratios.',
      'Monitor local environmental air quality reports if residing or working in the immediate vicinity.',
    ]
  }
  if (cls === 'Persistent Industrial Heat') {
    return [
      'Standard regulated thermal operations; no protective public evacuation needed.',
      'Ensure registered plant thermal insulation and emission compliance standards are maintained.',
      'Routine environmental monitoring remains active to detect uncharacteristic heat spikes.',
    ]
  }
  return [
    'No emergency action required for baseline thermal observation.',
    'Continuous satellite monitoring remains active over the corridor.',
  ]
}

export default function AlertResponseView() {
  const { events, locations, getLocation, selectedEvent, setSelectedEvent, focusEvent, setActiveView } = useApp()
  const [filterLevel, setFilterLevel] = useState('ALL') // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  // Category hierarchy mapping for strict sorting requirement
  const CATEGORY_ORDER = {
    'Industrial Fire': 1,
    'Gas Flare': 2,
    'Persistent Industrial Heat': 3,
    'Other Thermal Source': 4,
  }

  // Enriched alert list with derived severity from existing real data
  const enrichedAlerts = useMemo(() => {
    if (!events || events.length === 0) return []
    const mapped = events.map((ev) => {
      const score = ev.final_risk_score !== undefined ? ev.final_risk_score : ev.risk_score || 0
      const severity = getAlertSeverity(score)
      const loc = getLocation(ev.event_id)
      return {
        ...ev,
        derivedScore: score,
        severity,
        displayLocation: loc,
      }
    })

    // 1. Industrial Fire -> 2. Gas Flare -> 3. Persistent Industrial Heat -> 4. Other Thermal Source
    // Within each category, sort by Risk Score descending
    return mapped.sort((a, b) => {
      const catA = CATEGORY_ORDER[a.predicted_class] || 99
      const catB = CATEGORY_ORDER[b.predicted_class] || 99
      if (catA !== catB) {
        return catA - catB
      }
      return (b.derivedScore || 0) - (a.derivedScore || 0)
    })
  }, [events, locations, getLocation])

  // Filtered Alert List (Severity Tab + Search Query)
  const filteredAlerts = useMemo(() => {
    return enrichedAlerts.filter((a) => {
      if (filterLevel !== 'ALL' && a.severity.level !== filterLevel) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchId = a.event_id?.toLowerCase().includes(q)
        const matchClass = a.predicted_class?.toLowerCase().includes(q)
        const matchLoc = a.displayLocation?.toLowerCase().includes(q)
        if (!matchId && !matchClass && !matchLoc) return false
      }
      return true
    })
  }, [enrichedAlerts, filterLevel, searchQuery])

  // Active Alert selection (defaults to selectedEvent, first filtered or first critical)
  const activeAlert = useMemo(() => {
    if (selectedAlertId) {
      const found = enrichedAlerts.find((a) => a.event_id === selectedAlertId)
      if (found) return found
    }
    if (selectedEvent) {
      const match = enrichedAlerts.find((a) => a.event_id === selectedEvent.event_id)
      if (match) return match
    }
    const critical = enrichedAlerts.find((a) => a.severity.level === 'CRITICAL')
    return critical || filteredAlerts[0] || enrichedAlerts[0] || null
  }, [enrichedAlerts, filteredAlerts, selectedAlertId, selectedEvent])

  // Key KPI Statistics
  const counts = useMemo(() => {
    return {
      total: enrichedAlerts.length,
      critical: enrichedAlerts.filter((a) => a.severity.level === 'CRITICAL').length,
      high: enrichedAlerts.filter((a) => a.severity.level === 'HIGH').length,
      moderate: enrichedAlerts.filter((a) => a.severity.level === 'MODERATE').length,
      low: enrichedAlerts.filter((a) => a.severity.level === 'LOW').length,
      peakFRP: Math.max(...enrichedAlerts.map((a) => a.frp || 0), 0),
    }
  }, [enrichedAlerts])


  const handleSelectAlert = (alert) => {
    setSelectedAlertId(alert.event_id)
    setSelectedEvent(alert)
  }

  const handleLocateOnMap = (alert) => {
    focusEvent(alert)
    setActiveView('dashboard')
  }

  const classCfg = activeAlert
    ? CLASS_COLORS[activeAlert.predicted_class] || CLASS_COLORS['Other Thermal Source']
    : null

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 select-none bg-[#030713] text-slate-100 w-full min-w-0">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER & PIPELINE TRACKER */}
      {/* ========================================================================= */}
      <div className="hud-panel p-5 rounded-2xl border border-cyan-500/30 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#061226] via-[#081838] to-[#0c0a1f]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                <Siren className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                DISASTER MANAGEMENT COMMAND
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold tracking-wide">
                AHMEDABAD INDUSTRIAL CORRIDOR
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-xl md:text-2xl text-slate-100 flex items-center gap-3 tracking-wide">
              <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
              SUDARSHAN Alert &amp; Incident Response Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-mono leading-relaxed max-w-3xl">
              Real-time multi-agency incident triaging, automated response SOP execution, and industrial safety compliance tracking.
            </p>
          </div>

          {/* Operational Pipeline Tracker */}
          <div className="flex items-center gap-1.5 md:gap-2 p-2.5 rounded-xl bg-[#030816]/90 border border-slate-800/90 font-mono text-xs overflow-x-auto self-start lg:self-auto shrink-0 shadow-inner">
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-700/60 font-bold">
              1. DETECT
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="px-2.5 py-1 rounded-md bg-indigo-950/90 text-indigo-300 border border-indigo-700/60 font-bold">
              2. ASSESS
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="px-2.5 py-1 rounded-md bg-rose-950/90 text-rose-300 border border-rose-500/60 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]">
              3. ALERT
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="px-2.5 py-1 rounded-md bg-amber-950/90 text-amber-300 border border-amber-700/60 font-bold">
              4. RESPOND
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 font-bold">
              5. RESOLVE
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RESPONSIVE KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Active */}
        <div
          onClick={() => setFilterLevel('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg group ${
            filterLevel === 'ALL'
              ? 'bg-gradient-to-b from-[#081d3d] to-[#040e24] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
              : 'hud-panel hover:border-cyan-500/50 hover:bg-[#061229]'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
            <span>ACTIVE ALERTS</span>
            <Bell className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-slate-100 mt-2">
            {counts.total}
          </div>
          <div className="text-xs font-mono text-cyan-400/90 mt-1">All Satellite Hotspots</div>
        </div>

        {/* Critical Alerts */}
        <div
          onClick={() => setFilterLevel('CRITICAL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg group ${
            filterLevel === 'CRITICAL'
              ? 'bg-gradient-to-b from-rose-950/80 to-[#180814] border-rose-500 shadow-[0_0_24px_rgba(239,68,68,0.35)]'
              : 'hud-panel hover:border-rose-500/50 hover:bg-[#14060e]'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono text-rose-300 uppercase font-bold tracking-wider">
            <span>CRITICAL</span>
            <Siren className="w-4 h-4 text-rose-400 animate-pulse group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-rose-400 mt-2">
            {counts.critical}
          </div>
          <div className="text-xs font-mono text-rose-300/80 mt-1">Score 75–100 (Emergency)</div>
        </div>

        {/* High Severity */}
        <div
          onClick={() => setFilterLevel('HIGH')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg group ${
            filterLevel === 'HIGH'
              ? 'bg-gradient-to-b from-orange-950/80 to-[#180c06] border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
              : 'hud-panel hover:border-orange-500/50 hover:bg-[#140905]'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono text-orange-300 uppercase font-bold tracking-wider">
            <span>HIGH</span>
            <AlertTriangle className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-orange-400 mt-2">
            {counts.high}
          </div>
          <div className="text-xs font-mono text-orange-300/80 mt-1">Score 50–74 (Priority)</div>
        </div>

        {/* Moderate Severity */}
        <div
          onClick={() => setFilterLevel('MODERATE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg group ${
            filterLevel === 'MODERATE'
              ? 'bg-gradient-to-b from-amber-950/80 to-[#181105] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'hud-panel hover:border-amber-500/50 hover:bg-[#140e04]'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono text-amber-300 uppercase font-bold tracking-wider">
            <span>MODERATE</span>
            <Activity className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-amber-400 mt-2">
            {counts.moderate}
          </div>
          <div className="text-xs font-mono text-amber-300/80 mt-1">Score 30–49 (Watchlist)</div>
        </div>

        {/* Low Severity */}
        <div
          onClick={() => setFilterLevel('LOW')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg group ${
            filterLevel === 'LOW'
              ? 'bg-gradient-to-b from-emerald-950/80 to-[#05180f] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'hud-panel hover:border-emerald-500/50 hover:bg-[#04140c]'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono text-emerald-300 uppercase font-bold tracking-wider">
            <span>LOW</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-emerald-400 mt-2">
            {counts.low}
          </div>
          <div className="text-xs font-mono text-emerald-300/80 mt-1">Score 0–29 (Baseline)</div>
        </div>

        {/* Peak Radiative Output */}
        <div className="p-4 rounded-xl hud-panel shadow-lg">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
            <span>PEAK FRP</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-rose-400 mt-2">
            {formatFRP(counts.peakFRP)}
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">Max Radiant Power</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ALERT WORKSPACE (60% ACTIVE ALERTS | 40% ALERT DETAILS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --------------------------------------------------------------------- */}
        {/* LEFT COLUMN: ACTIVE ALERTS (~60% WIDTH) */}
        {/* --------------------------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="p-4 rounded-xl hud-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                TRIAGE TIER:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => {
                const isActive = filterLevel === lvl
                return (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_12px_#06b6d4]'
                        : 'bg-[#061026] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                )
              })}
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, class, location..."
                className="input-tactical w-full pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono rounded-lg"
              />
            </div>
          </div>

          {/* Scrollable Active Alerts List */}
          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-12 rounded-2xl hud-panel text-center text-slate-400 space-y-2">
                <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="font-heading font-semibold text-slate-200 text-sm">No Alerts Found</h4>
                <p className="text-xs font-mono text-slate-400">
                  No thermal events matching the current severity filter "{filterLevel}" and search query.
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = activeAlert?.event_id === alert.event_id
                const sev = alert.severity
                const colorObj = CLASS_COLORS[alert.predicted_class] || CLASS_COLORS['Other Thermal Source']

                return (
                  <div
                    key={alert.event_id}
                    onClick={() => handleSelectAlert(alert)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#081f44] via-[#061733] to-[#040e22] border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.25)]'
                        : 'hud-panel hover:border-slate-700 hover:bg-[#07132c]'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
                    )}

                    {/* Top Row: Event Type, ID & Risk Level Badge with Risk Score /100 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className="w-3 h-3 rounded-full shadow-[0_0_6px_currentColor] shrink-0"
                          style={{ backgroundColor: colorObj.bg, color: colorObj.bg }}
                        />
                        <span className="font-heading font-bold text-sm text-slate-100 tracking-wide">
                          {alert.predicted_class}
                        </span>
                        <span className="text-xs font-mono text-slate-400 font-semibold px-2 py-0.5 rounded bg-black/40 border border-slate-800">
                          {alert.event_id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase ${sev.badgeBg} ${sev.text} border ${sev.badgeBorder} shadow-sm`}
                        >
                          {sev.level} • {alert.derivedScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Location and Date/Time Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="truncate font-sans font-medium">{alert.displayLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end text-slate-300 font-mono text-xs">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{alert.acq_datetime ? formatTimestamp(alert.acq_datetime) : 'Recent Satellite Pass'}</span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-[#030816]/70 border border-slate-800/60">
                        <span className="text-slate-400 text-[11px] block uppercase">FRP Radiance</span>
                        <b className="text-amber-400 text-xs sm:text-sm font-bold">{formatFRP(alert.frp)}</b>
                      </div>
                      <div className="p-2 rounded-lg bg-[#030816]/70 border border-slate-800/60">
                        <span className="text-slate-400 text-[11px] block uppercase">AI Confidence</span>
                        <b className="text-cyan-300 text-xs sm:text-sm font-bold">{formatPercent(alert.confidence)}</b>
                      </div>
                      <div className="p-2 rounded-lg bg-[#030816]/70 border border-slate-800/60">
                        <span className="text-slate-400 text-[11px] block uppercase">Distance to Factory</span>
                        <b className="text-slate-200 text-xs sm:text-sm font-bold">{formatDistance(alert.distance_to_industry)}</b>
                      </div>
                      <div className="p-2 rounded-lg bg-[#030816]/70 border border-slate-800/60">
                        <span className="text-slate-400 text-[11px] block uppercase">Coordinates</span>
                        <b className="text-slate-200 text-xs sm:text-sm font-bold truncate block">{formatCoords(alert.latitude, alert.longitude)}</b>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: SELECTED ALERT / PUBLIC INCIDENT DOSSIER (~40% WIDTH) */}
        {/* --------------------------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {activeAlert ? (
            <div className="p-6 rounded-2xl hud-panel space-y-5 shadow-2xl border border-slate-800/90 bg-gradient-to-b from-[#08152e] via-[#050e21] to-[#030814]">
              {/* 1. Header: Event Type, ID, Risk Level & Score */}
              <div className="space-y-3 pb-4 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor] shrink-0"
                      style={{ backgroundColor: classCfg?.bg, color: classCfg?.bg }}
                    />
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      INCIDENT REPORT #{activeAlert.event_id}
                    </span>
                  </div>

                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold uppercase ${activeAlert.severity.badgeBg} ${activeAlert.severity.text} border ${activeAlert.severity.badgeBorder} ${activeAlert.severity.glow}`}
                  >
                    {activeAlert.severity.level} RISK • {activeAlert.derivedScore}/100
                  </span>
                </div>

                <div>
                  <h2 className="font-heading font-extrabold text-xl md:text-2xl text-slate-100 tracking-wide">
                    {activeAlert.predicted_class}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {activeAlert.severity.desc}
                  </p>
                </div>
              </div>

              {/* 2. Key Incident Details: Location & Detection Date/Time */}
              <div className="space-y-3 p-4 rounded-xl bg-[#030713]/90 border border-slate-800/90 text-xs">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Incident Location
                    </span>
                    <span className="font-sans font-semibold text-slate-200 text-sm block truncate">
                      {activeAlert.displayLocation}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] block">
                      Coordinates: {formatCoords(activeAlert.latitude, activeAlert.longitude)}
                    </span>
                  </div>
                </div>

                {/* Detection Date & Time */}
                <div className="border-t border-slate-800/60 pt-3 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Detection Date &amp; Time
                    </span>
                    <span className="font-mono font-bold text-slate-200 text-xs block">
                      {activeAlert.acq_datetime ? formatTimestamp(activeAlert.acq_datetime) : 'Recent Satellite Pass (VIIRS)'}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] block">
                      Satellite Overpass: {activeAlert.daynight === 1 ? 'Daytime Overpass' : 'Nighttime Overpass'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Risk Assessment Section */}
              <div className="space-y-3.5 p-4 rounded-xl bg-[#040c1e] border border-slate-800/80 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 font-heading font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Risk Assessment</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-slate-400">Score:</span>
                    <span className="font-extrabold text-slate-100">{activeAlert.derivedScore}/100</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeAlert.severity.badgeBg} ${activeAlert.severity.text} border ${activeAlert.severity.badgeBorder}`}
                    >
                      {activeAlert.severity.level}
                    </span>
                  </div>
                </div>

                {/* 5 Compact Progress Bars */}
                <div className="space-y-2.5 font-mono text-xs pt-1">
                  {/* 1. Thermal Severity */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Thermal Severity</span>
                      <span className="text-amber-400 font-bold">{activeAlert.thermal_score ?? 0} / 100</span>
                    </div>
                    <div className="w-full bg-[#0a1428] rounded-full h-1.5 overflow-hidden border border-slate-800/40">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300 shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                        style={{ width: `${Math.min(100, Math.max(0, activeAlert.thermal_score ?? 0))}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. Industrial Proximity */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Industrial Proximity</span>
                      <span className="text-cyan-300 font-bold">{activeAlert.industrial_proximity_score ?? 0} / 100</span>
                    </div>
                    <div className="w-full bg-[#0a1428] rounded-full h-1.5 overflow-hidden border border-slate-800/40">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_4px_rgba(6,182,212,0.5)]"
                        style={{ width: `${Math.min(100, Math.max(0, activeAlert.industrial_proximity_score ?? 0))}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. ML Hazard */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">ML Hazard</span>
                      <span className="text-rose-400 font-bold">{activeAlert.ml_confidence_score ?? 0} / 100</span>
                    </div>
                    <div className="w-full bg-[#0a1428] rounded-full h-1.5 overflow-hidden border border-slate-800/40">
                      <div
                        className="bg-rose-400 h-full rounded-full transition-all duration-300 shadow-[0_0_4px_rgba(244,63,94,0.5)]"
                        style={{ width: `${Math.min(100, Math.max(0, activeAlert.ml_confidence_score ?? 0))}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Temporal Persistence */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Temporal Persistence</span>
                      <span className="text-blue-400 font-bold">{activeAlert.persistence_score ?? 0} / 100</span>
                    </div>
                    <div className="w-full bg-[#0a1428] rounded-full h-1.5 overflow-hidden border border-slate-800/40">
                      <div
                        className="bg-blue-400 h-full rounded-full transition-all duration-300 shadow-[0_0_4px_rgba(96,165,250,0.5)]"
                        style={{ width: `${Math.min(100, Math.max(0, activeAlert.persistence_score ?? 0))}%` }}
                      />
                    </div>
                  </div>

                  {/* 5. Recurrence Pattern */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300">Recurrence Pattern</span>
                      <span className="text-indigo-300 font-bold">{activeAlert.recurrence_score ?? 0} / 100</span>
                    </div>
                    <div className="w-full bg-[#0a1428] rounded-full h-1.5 overflow-hidden border border-slate-800/40">
                      <div
                        className="bg-indigo-400 h-full rounded-full transition-all duration-300 shadow-[0_0_4px_rgba(129,140,248,0.5)]"
                        style={{ width: `${Math.min(100, Math.max(0, activeAlert.recurrence_score ?? 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. "What Happened?" Explanation */}
              <div className="p-4.5 rounded-xl bg-gradient-to-r from-[#061530] via-[#041026] to-[#040c1e] border border-cyan-500/30 shadow-lg space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-300 font-heading font-extrabold text-xs md:text-sm uppercase tracking-wider">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>WHAT HAPPENED?</span>
                </div>
                <p className="text-sm md:text-[14.5px] text-slate-200 font-sans leading-relaxed font-normal">
                  {getWhatHappenedExplanation(activeAlert)}
                </p>
              </div>

              {/* 5. "What You Should Do" Safety Guidance */}
              <div className="p-4.5 rounded-xl bg-gradient-to-r from-[#190e06] via-[#120a05] to-[#040c1e] border border-amber-500/30 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-heading font-extrabold text-xs md:text-sm uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>WHAT YOU SHOULD DO</span>
                </div>
                <ul className="space-y-2.5 text-sm md:text-[14px] text-slate-200 font-sans">
                  {getSafetyGuidance(activeAlert).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-[0_0_6px_#f59e0b]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Primary Action: "Explore Technical Reason" & GIS Map */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSelectedEvent(activeAlert)
                    setActiveView('investigation')
                  }}
                  className="flex-1 btn-primary-glow py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg tracking-wide"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Technical Reason</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => handleLocateOnMap(activeAlert)}
                  className="px-4 py-3 rounded-xl bg-[#071329] hover:bg-[#0c1f44] border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="View position on interactive GIS map"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>GIS Map</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl hud-panel text-center text-slate-400 space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="font-heading font-semibold text-slate-200 text-sm">Select an Alert</h4>
              <p className="text-xs font-mono text-slate-400">
                Choose an incident from the Active Alerts list to view incident details, situational explanation, and safety guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
