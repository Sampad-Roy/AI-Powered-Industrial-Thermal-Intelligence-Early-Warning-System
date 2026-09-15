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
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASS_COLORS } from '../../utils/constants'
import {
  formatFRP,
  formatPercent,
  formatDistance,
  formatCoords,
  formatTempK,
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

export default function AlertResponseView() {
  const { events, locations, getLocation, selectedEvent, setSelectedEvent, focusEvent, setActiveView } = useApp()
  const [filterLevel, setFilterLevel] = useState('ALL') // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlertId, setSelectedAlertId] = useState(null)
  const [checklist, setChecklist] = useState({
    verifySatellitePass: true,
    notifyDisasterCell: false,
    dispatchGroundRecon: false,
    isolateHazardZone: false,
    logInStateRegistry: false,
  })

  // Enriched alert list with derived severity from existing real data
  const enrichedAlerts = useMemo(() => {
    if (!events || events.length === 0) return []
    return events.map((ev) => {
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

  const toggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

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
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 select-none bg-[#030713] text-slate-100">
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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
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

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase self-start sm:self-auto ${sev.badgeBg} ${sev.text} border ${sev.badgeBorder} shadow-sm`}
                      >
                        {sev.level} • {alert.derivedScore}/100
                      </span>
                    </div>

                    {/* Location */}
                    <div className="text-xs md:text-sm text-slate-300 font-sans flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate">{alert.displayLocation}</span>
                      <span className="text-slate-400 font-mono text-xs hidden sm:inline ml-auto">
                        {formatCoords(alert.latitude, alert.longitude)}
                      </span>
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
                        <span className="text-slate-400 text-[11px] block uppercase">Satellite Pass</span>
                        <b className="text-slate-200 text-xs sm:text-sm font-bold">{alert.daynight === 1 ? 'Day (1)' : 'Night (0)'}</b>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: ALERT DETAILS & RESPONSE SOPs (~40% WIDTH) */}
        {/* --------------------------------------------------------------------- */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {activeAlert ? (
            <>
              {/* SECTION 4: ALERT DETAILS DOSSIER */}
              <div className="p-5 rounded-2xl hud-panel space-y-4 shadow-2xl">
                {/* Header with Title & Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/90">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${activeAlert.severity.badgeBg} ${activeAlert.severity.text} border ${activeAlert.severity.badgeBorder} ${activeAlert.severity.glow}`}
                      >
                        SEVERITY: {activeAlert.severity.level} ({activeAlert.derivedScore}/100)
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {activeAlert.event_id}
                      </span>
                    </div>
                    <h3 className="font-heading font-extrabold text-lg md:text-xl text-slate-100 flex items-center gap-2.5 mt-1.5 tracking-wide">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: classCfg?.bg, color: classCfg?.bg }}
                      />
                      {activeAlert.predicted_class}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleLocateOnMap(activeAlert)}
                    className="btn-primary-glow px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>LOCATE ON GIS MAP</span>
                  </button>
                </div>

                {/* Location Banner */}
                <div className="p-3 rounded-xl bg-[#040916] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono shadow-inner">
                  <div className="flex items-center gap-2 text-slate-200">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-sans font-medium">{activeAlert.displayLocation}</span>
                  </div>
                  <span className="text-cyan-400/90 text-xs font-semibold">
                    {formatCoords(activeAlert.latitude, activeAlert.longitude)}
                  </span>
                </div>

                {/* 6 Real Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block uppercase">Fire Radiative Power</span>
                    <b className="text-amber-400 text-sm md:text-base font-bold">{formatFRP(activeAlert.frp)}</b>
                  </div>
                  <div className="p-3 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block uppercase">AI Model Confidence</span>
                    <b className="text-cyan-300 text-sm md:text-base font-bold">{formatPercent(activeAlert.confidence)}</b>
                  </div>
                  <div className="p-3 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block uppercase">Distance to Factory</span>
                    <b className="text-slate-200 text-sm md:text-base font-bold">{formatDistance(activeAlert.distance_to_industry)}</b>
                  </div>
                  <div className="p-3 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block uppercase">TI4 MWIR Temperature</span>
                    <b className="text-rose-400 text-sm md:text-base font-bold">{formatTempK(activeAlert.bright_ti4)}</b>
                  </div>
                  <div className="p-3 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block uppercase">Combustion ΔT</span>
                    <b className="text-orange-400 text-sm md:text-base font-bold">{activeAlert.delta_t ? `${Number(activeAlert.delta_t).toFixed(1)} K` : '—'}</b>
                  </div>
                  <div className="p-3 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block uppercase">Cluster Persistence</span>
                    <b className="text-blue-300 text-sm md:text-base font-bold">{activeAlert.cluster_event_count || 1} hits ({activeAlert.cluster_span_days || 0}d)</b>
                  </div>
                </div>

                {/* 5-Factor Risk Decomposition Progress Meters */}
                <div className="p-3.5 rounded-xl bg-[#040916]/90 border border-slate-800/80 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold tracking-wider">
                    <span>5-FACTOR WEIGHTED RISK BREAKDOWN</span>
                    <span className="text-cyan-300 font-bold">{activeAlert.derivedScore} / 100</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Thermal Severity (25%):</span>
                        <b className="text-amber-400">{activeAlert.thermal_score || 0}</b>
                      </div>
                      <div className="w-full bg-[#0a1428] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${activeAlert.thermal_score || 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Industrial Proximity (25%):</span>
                        <b className="text-cyan-300">{activeAlert.industrial_proximity_score || 0}</b>
                      </div>
                      <div className="w-full bg-[#0a1428] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${activeAlert.industrial_proximity_score || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: RECOMMENDED RESPONSE (TACTICAL DISASTER MANAGEMENT SOPs) */}
              <div className="p-5 rounded-2xl hud-panel space-y-3.5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/90">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider">
                      RECOMMENDED RESPONSE PROTOCOL &amp; ACTION DIRECTIVES
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-800 font-bold">
                    DISASTER SOP ENGINE
                  </span>
                </div>

                {/* SOP Strategy Directive Card */}
                <div
                  className="p-4 rounded-xl border text-xs space-y-2 shadow-inner"
                  style={{
                    backgroundColor: activeAlert.severity.bg,
                    borderColor: activeAlert.severity.border,
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-heading font-extrabold text-xs md:text-sm uppercase" style={{ color: activeAlert.severity.color }}>
                      {activeAlert.severity.sopTitle}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/60 text-slate-200 border border-slate-700 font-bold">
                      PRIORITY {activeAlert.severity.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {activeAlert.predicted_class === 'Industrial Fire' &&
                      'Immediate Level-1 GIDC Industrial Fire & Hazmat dispatch recommended. Activate thermal isolation perimeter (300m radius), alert nearby chemical storage facilities, and establish real-time air-quality monitoring.'}
                    {activeAlert.predicted_class === 'Gas Flare' &&
                      'Continuous flaring signature verified. Trigger automatic Gujarat Pollution Control Board (GPCB) emission volumetric audit. Verify flare tip steam-assist ratio and hydrocarbon combustion efficiency.'}
                    {activeAlert.predicted_class === 'Persistent Industrial Heat' &&
                      'Chronic industrial thermal signature (boiler/smelter). Initiate energy efficiency compliance inspection and cross-reference registered plant thermal emission limits.'}
                    {activeAlert.predicted_class === 'Other Thermal Source' &&
                      'Non-industrial baseline thermal anomaly. Log satellite pass coordinates into rural monitoring registry; no emergency team deployment required.'}
                  </p>
                </div>

                {/* Interactive Tactical Checklist */}
                <div className="p-3.5 rounded-xl bg-[#040916]/95 border border-slate-800/90 space-y-2.5 text-xs font-mono">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>DISASTER DISPATCH READINESS CHECKLIST</span>
                    <span className="text-cyan-400 font-bold">[OPERATIONAL READY]</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div
                      onClick={() => toggleChecklist('verifySatellitePass')}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-[#071126] hover:bg-[#0b1b3d] cursor-pointer transition-colors"
                    >
                      {checklist.verifySatellitePass ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={checklist.verifySatellitePass ? 'text-slate-200 line-through opacity-75' : 'text-slate-200'}>
                        1. Verify VIIRS Night/Day Satellite Overpass Telemetry (ΔT confirmed)
                      </span>
                    </div>

                    <div
                      onClick={() => toggleChecklist('notifyDisasterCell')}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-[#071126] hover:bg-[#0b1b3d] cursor-pointer transition-colors"
                    >
                      {checklist.notifyDisasterCell ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={checklist.notifyDisasterCell ? 'text-slate-200 line-through opacity-75' : 'text-slate-200'}>
                        2. Transmit Alert Dossier to GIDC Incident Management Cell
                      </span>
                    </div>

                    <div
                      onClick={() => toggleChecklist('dispatchGroundRecon')}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-[#071126] hover:bg-[#0b1b3d] cursor-pointer transition-colors"
                    >
                      {checklist.dispatchGroundRecon ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={checklist.dispatchGroundRecon ? 'text-slate-200 line-through opacity-75' : 'text-slate-200'}>
                        3. Issue Quick Response Vehicle (QRV) Reconnaissance Directive
                      </span>
                    </div>

                    <div
                      onClick={() => toggleChecklist('isolateHazardZone')}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-[#071126] hover:bg-[#0b1b3d] cursor-pointer transition-colors"
                    >
                      {checklist.isolateHazardZone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={checklist.isolateHazardZone ? 'text-slate-200 line-through opacity-75' : 'text-slate-200'}>
                        4. Notify Industrial Safety Officer (ISO) of Registered Polygon Boundary
                      </span>
                    </div>

                    <div
                      onClick={() => toggleChecklist('logInStateRegistry')}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-[#071126] hover:bg-[#0b1b3d] cursor-pointer transition-colors"
                    >
                      {checklist.logInStateRegistry ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={checklist.logInStateRegistry ? 'text-slate-200 line-through opacity-75' : 'text-slate-200'}>
                        5. Complete Incident Audit Registry Entry
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: ALERT HISTORY & AUDIT TRAIL */}
              <div className="p-5 rounded-2xl hud-panel space-y-3.5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/90">
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider">
                      INCIDENT AUDIT LOG &amp; ALERT TIMELINE
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    EVENT LIFECYCLE
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-xs shrink-0">
                      T-00:00
                    </span>
                    <div>
                      <b className="text-slate-200 text-xs">VIIRS Thermal Anomaly Registered</b>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Latitude {activeAlert.latitude?.toFixed(4)}, Longitude {activeAlert.longitude?.toFixed(4)} • FRP {formatFRP(activeAlert.frp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold text-xs border border-indigo-800 shrink-0">
                      T+00:02
                    </span>
                    <div>
                      <b className="text-slate-200 text-xs">XGBoost Multiclass ML &amp; TreeSHAP Analysis</b>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Classified as <span className="text-cyan-300 font-bold">{activeAlert.predicted_class}</span> with {formatPercent(activeAlert.confidence)} confidence
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold text-xs border border-rose-800 shrink-0">
                      T+00:05
                    </span>
                    <div>
                      <b className="text-slate-200 text-xs">5-Factor Risk Engine Scored &amp; Severity Evaluated</b>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Assigned risk score <span className="text-rose-400 font-bold">{activeAlert.derivedScore}/100</span> ({activeAlert.severity.level} Priority)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#040916]/90 border border-slate-800/80">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold text-xs border border-amber-800 shrink-0">
                      T+00:08
                    </span>
                    <div>
                      <b className="text-slate-200 text-xs">Disaster Management Action Plan Generated</b>
                      <p className="text-xs text-slate-400 mt-0.5">
                        SOP protocol <span className="text-amber-300 font-bold">{activeAlert.severity.sopTitle}</span> queued in Command Center
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl hud-panel text-center text-slate-400 space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="font-heading font-semibold text-slate-200 text-sm">Select an Alert</h4>
              <p className="text-xs font-mono text-slate-400">
                Choose an incident from the Active Alerts list to inspect telemetry and recommended response SOPs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
