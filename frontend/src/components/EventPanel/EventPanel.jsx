import React, { useState } from 'react'
import {
  Flame,
  Radio,
  Factory,
  Trees,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Compass,
  Calendar,
  Layers,
  Thermometer,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  CLASS_COLORS,
  RISK_LEVELS,
  SHAP_FEATURE_DESCRIPTIONS,
} from '../../utils/constants'
import {
  formatFRP,
  formatTempK,
  formatTempC,
  formatDistance,
  formatPercent,
  formatNumber,
  formatCoords,
  formatTimestamp,
} from '../../utils/formatters'

export default function EventPanel() {
  const { selectedEvent, getLocation } = useApp()

  // Accordion state for collapsible sections
  const [openSections, setOpenSections] = useState({
    classification: true,
    thermal: true,
    spatial: true,
    temporal: false,
    shap: true,
    risk: true,
    directive: true,
  })

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }))
  }

  if (!selectedEvent) {
    return (
      <aside className="w-80 md:w-96 bg-[#060b17] border-l border-[#16233b] p-6 flex flex-col items-center justify-center text-center select-none text-slate-400 shadow-2xl">
        <div className="p-4 rounded-full bg-[#0a1222] border border-[#1c2e4d] mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <Compass className="w-10 h-10 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
        </div>
        <h4 className="font-heading font-bold text-slate-200 text-sm mb-1.5 uppercase tracking-wide">
          No Event Selected
        </h4>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-sans">
          Select any thermal anomaly marker on the GIS map or from the catalog table to inspect comprehensive AI telemetry, SHAP attributions, and risk drivers.
        </p>
      </aside>
    )
  }

  const ev = selectedEvent
  const classCfg = CLASS_COLORS[ev.predicted_class] || CLASS_COLORS['Other Thermal Source']
  const riskCfg = RISK_LEVELS[ev.risk_level] || RISK_LEVELS.LOW

  return (
    <aside className="w-80 md:w-96 bg-[#060b17] border-l border-[#16233b] flex flex-col h-full overflow-hidden select-none z-10 shrink-0 shadow-2xl">
      {/* Panel Top Header */}
      <div className="p-3.5 bg-[#091222] border-b border-[#16233b] flex items-center justify-between shadow-md shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              EVENT INTELLIGENCE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/90 text-cyan-300 border border-slate-700 font-bold shadow-sm">
              Cluster #{ev.cluster_id}
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-lg text-slate-100 mt-0.5 tracking-tight">
            {ev.event_id}
          </h3>
        </div>

        {/* Severity Badge */}
        <div className="text-right">
          <span
            className="inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm"
            style={{
              backgroundColor: riskCfg.bg,
              color: riskCfg.color,
              border: `1px solid ${riskCfg.border}`,
            }}
          >
            {ev.risk_level} • {ev.final_risk_score}
          </span>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5 font-semibold">
            Risk Score / 100
          </div>
        </div>
      </div>

      {/* Scrollable Content Body with Collapsible Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* Real Geocoded Location Banner */}
        <div className="p-3 rounded-lg bg-[#0a1428] border border-[#1b2f52] shadow-sm flex items-start gap-2.5 animate-fadeIn">
          <div className="p-1.5 rounded bg-cyan-950/90 border border-cyan-700/60 text-cyan-400 shrink-0 mt-0.5 shadow-inner">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                REVERSE GEOCODED LOCATION
              </span>
              <span className="text-[9px] font-mono text-slate-400 font-medium">OSM / Nominatim</span>
            </div>
            <p className="text-xs font-heading font-bold text-slate-100 mt-0.5 leading-snug break-words">
              {getLocation(ev)}
            </p>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              Coordinates: <b className="text-slate-300 font-semibold">{formatCoords(ev.latitude, ev.longitude)}</b>
            </span>
          </div>
        </div>

        {/* 1. CLASSIFICATION & PROBABILITIES */}
        <div className="rounded-lg bg-[#091222] border border-[#1a2b48] overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('classification')}
            className="w-full px-3 py-2 bg-[#0c162a] border-b border-[#16233b] flex items-center justify-between hover:bg-[#101d36] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: classCfg.bg }}
              />
              <span className="font-heading font-bold text-xs text-slate-200 uppercase tracking-wide">
                1. AI CLASSIFICATION &amp; CONFIDENCE
              </span>
            </div>
            {openSections.classification ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.classification && (
            <div className="p-3 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#142036]">
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-heading">
                    {ev.predicted_class}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Hazard Priority: <span className="text-slate-200 font-semibold">{classCfg.tag}</span>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-base font-mono font-bold text-cyan-300">
                    {formatPercent(ev.confidence)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono font-medium">Confidence</div>
                </div>
              </div>

              {/* Probability Distribution Bars */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  CLASS PROBABILITY DISTRIBUTION
                </div>
                {ev.class_probabilities &&
                  Object.entries(ev.class_probabilities).map(([clsName, prob]) => {
                    const isWinner = clsName === ev.predicted_class
                    const pPercent = (prob * 100).toFixed(1)
                    const cfg = CLASS_COLORS[clsName] || CLASS_COLORS['Other Thermal Source']

                    return (
                      <div key={clsName} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className={isWinner ? 'text-slate-100 font-bold' : 'text-slate-400'}>
                            {clsName}
                          </span>
                          <span className={isWinner ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                            {pPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-[#121e35] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pPercent}%`,
                              backgroundColor: cfg.bg,
                              boxShadow: isWinner ? `0 0 8px ${cfg.bg}` : 'none',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        {/* 2. THERMAL TELEMETRY */}
        <div className="rounded-lg bg-[#091222] border border-[#1a2b48] overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('thermal')}
            className="w-full px-3 py-2 bg-[#0c162a] border-b border-[#16233b] flex items-center justify-between hover:bg-[#101d36] transition-colors"
          >
            <span className="font-heading font-bold text-xs text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              2. THERMAL SENSOR TELEMETRY (VIIRS)
            </span>
            {openSections.thermal ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.thermal && (
            <div className="p-3 space-y-2.5 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-md bg-[#050b17] border border-[#16233b] shadow-inner">
                  <span className="text-[10px] text-slate-400 block font-semibold">Fire Radiative Power</span>
                  <span className="text-base font-bold text-amber-400">{formatFRP(ev.frp)}</span>
                </div>

                <div className="p-2.5 rounded-md bg-[#050b17] border border-[#16233b] shadow-inner">
                  <span className="text-[10px] text-slate-400 block font-semibold">Combustion Contrast (ΔT)</span>
                  <span className="text-base font-bold text-rose-400">
                    {formatNumber(ev.delta_t, 1)} K
                  </span>
                </div>

                <div className="p-2.5 rounded-md bg-[#050b17] border border-[#16233b]">
                  <span className="text-[10px] text-slate-400 block font-semibold">TI4 (MWIR)</span>
                  <span className="text-xs font-bold text-slate-200">
                    {formatTempK(ev.bright_ti4)}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-medium">
                    ({formatTempC(ev.bright_ti4)})
                  </span>
                </div>

                <div className="p-2.5 rounded-md bg-[#050b17] border border-[#16233b]">
                  <span className="text-[10px] text-slate-400 block font-semibold">TI5 (LWIR)</span>
                  <span className="text-xs font-bold text-slate-200">
                    {formatTempK(ev.bright_ti5)}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-medium">
                    ({formatTempC(ev.bright_ti5)})
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-[#142036]">
                <span>Overpass Type:</span>
                <span className="text-slate-200 font-semibold">
                  {ev.daynight === 1 ? '☀️ Daytime Pass' : '🌙 Night Pass (No solar glint)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. SPATIAL CONTEXT & SATELLITE INDICES */}
        <div className="rounded-lg bg-[#091222] border border-[#1a2b48] overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('spatial')}
            className="w-full px-3 py-2 bg-[#0c162a] border-b border-[#16233b] flex items-center justify-between hover:bg-[#101d36] transition-colors"
          >
            <span className="font-heading font-bold text-xs text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Factory className="w-3.5 h-3.5 text-cyan-400" />
              3. SPATIAL &amp; SPECTRAL CONTEXT
            </span>
            {openSections.spatial ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.spatial && (
            <div className="p-3 space-y-1.5 text-[11px] animate-fadeIn">
              <div className="flex justify-between py-1 border-b border-[#142036]">
                <span className="text-slate-400">Nearest Industrial Boundary:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatDistance(ev.distance_to_industry)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#142036]">
                <span className="text-slate-400">Facilities (500m / 1km / 2km):</span>
                <span className="font-mono font-bold text-cyan-300">
                  {ev.industries_within_500m} / {ev.industries_within_1km} / {ev.industries_within_2km}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#142036]">
                <span className="text-slate-400">Built-Up Index (NDBI):</span>
                <span className="font-mono font-bold text-amber-300">
                  {formatNumber(ev.NDBI, 3)}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Vegetation / Water Index:</span>
                <span className="font-mono text-slate-300">
                  NDVI: {formatNumber(ev.NDVI, 2)} | NDWI: {formatNumber(ev.NDWI, 2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. TEMPORAL & PERSISTENCE */}
        <div className="rounded-lg bg-[#091222] border border-[#1a2b48] overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('temporal')}
            className="w-full px-3 py-2 bg-[#0c162a] border-b border-[#16233b] flex items-center justify-between hover:bg-[#101d36] transition-colors"
          >
            <span className="font-heading font-bold text-xs text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              4. TEMPORAL &amp; PERSISTENCE PROFILE
            </span>
            {openSections.temporal ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.temporal && (
            <div className="p-3 space-y-2.5 animate-fadeIn">
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                <div className="p-2 rounded bg-[#050b17] border border-[#16233b]">
                  <span className="text-[9px] text-slate-400 block font-semibold">TOTAL DETECTIONS</span>
                  <span className="text-xs font-bold text-slate-200">{ev.cluster_event_count}</span>
                </div>

                <div className="p-2 rounded bg-[#050b17] border border-[#16233b]">
                  <span className="text-[9px] text-slate-400 block font-semibold">UNIQUE DATES</span>
                  <span className="text-xs font-bold text-slate-200">{ev.cluster_unique_dates}</span>
                </div>

                <div className="p-2 rounded bg-[#050b17] border border-[#16233b]">
                  <span className="text-[9px] text-slate-400 block font-semibold">CLUSTER SPAN</span>
                  <span className="text-xs font-bold text-cyan-300">{ev.cluster_span_days} days</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-slate-300 p-2 rounded bg-[#050b17] border border-[#16233b]">
                <span className="text-slate-400">Recurrence Metric:</span>
                <span className="font-bold text-indigo-300">
                  {ev.cluster_span_days > 30 ? 'Persistent Chronic Thermal Source' : ev.cluster_unique_dates > 1 ? 'Multi-Day Recurring Event' : 'Episodic Single-Pass Event'} ({ev.recurrence_score}/100)
                </span>
              </div>

              <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1 border-t border-[#142036]">
                <span>Acquisition:</span>
                <span className="text-slate-200 font-medium">{formatTimestamp(ev.acq_datetime)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. AI EXPLANATION (SHAP XAI) */}
        <div className="rounded-lg bg-[#09152b] border border-cyan-800/60 overflow-hidden shadow-md">
          <button
            onClick={() => toggleSection('shap')}
            className="w-full px-3 py-2 bg-[#0c1a35] border-b border-cyan-800/50 flex items-center justify-between hover:bg-[#102246] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-heading font-bold text-xs text-cyan-200 uppercase tracking-wide">
                5. SHAP XAI (WHY DID AI CLASSIFY THIS?)
              </span>
            </div>
            {openSections.shap ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.shap && (
            <div className="p-3 space-y-2.5 animate-fadeIn">
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Top feature contribution vectors steering the XGBoost decision forest for <span className="font-semibold text-cyan-300">{ev.predicted_class}</span>:
              </p>

              <div className="space-y-2">
                {ev.top_shap_explanations &&
                  ev.top_shap_explanations.map((shap, idx) => {
                    const desc = SHAP_FEATURE_DESCRIPTIONS[shap.feature]
                    const isPositive = shap.shap_value >= 0
                    const absVal = Math.abs(shap.shap_value)
                    const barWidth = Math.min(100, (absVal / 2.0) * 100)

                    return (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#050b17] border border-[#16233b] shadow-sm">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                            {desc ? desc.label : shap.feature}
                          </span>
                          <span
                            className={`font-mono font-bold text-xs ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? `+${shap.shap_value.toFixed(2)}` : shap.shap_value.toFixed(2)}
                          </span>
                        </div>

                        {/* Animated Visual Contribution Bar */}
                        <div className="w-full bg-[#121e35] rounded-full h-1.5 mb-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              isPositive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Observed Value: <b className="text-slate-200">{shap.feature_value}</b></span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isPositive
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          }`}>
                            {isPositive ? '▲ PUSHES TOWARD CLASS' : '▼ PUSHES AWAY'}
                          </span>
                        </div>

                        {desc && (
                          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-sans border-t border-[#142036] pt-1">
                            {desc.judgeExplanation}
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>

              {/* Expandable Technical Details */}
              <details className="mt-2 text-[10px] font-mono bg-[#050b17] border border-[#16233b] rounded-lg p-2.5 text-slate-400 cursor-pointer">
                <summary className="text-cyan-400 font-bold hover:text-cyan-300 select-none">
                  ▶ TECHNICAL SHAP METHODOLOGY (TreeSHAP)
                </summary>
                <div className="mt-2 space-y-1.5 text-slate-300 leading-relaxed font-sans pt-1 border-t border-[#16233b]">
                  <p>
                    <b>Algorithm:</b> Lundberg et al. (2020) TreeSHAP exact polynomial-time algorithm for tree ensembles.
                  </p>
                  <p>
                    <b>Attribution Formula:</b> <span className="font-mono text-cyan-300">f(x) = E[f(X)] + &sum; &phi;<sub>i</sub>(x)</span>, where each &phi;<sub>i</sub> represents the marginal log-odds contribution of feature <i>i</i> to the predicted class.
                  </p>
                  <p>
                    Positive SHAP values (&gt;0) provide evidentiary support for the selected classification, while negative values (&lt;0) indicate counter-evidence.
                  </p>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* 6. RISK FACTORS & 5-FACTOR DECOMPOSITION */}
        <div className="rounded-lg bg-[#091222] border border-[#1a2b48] overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('risk')}
            className="w-full px-3 py-2 bg-[#0c162a] border-b border-[#16233b] flex items-center justify-between hover:bg-[#101d36] transition-colors"
          >
            <span className="font-heading font-bold text-xs text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              6. 5-FACTOR RISK DECOMPOSITION
            </span>
            {openSections.risk ? (
              <ChevronUp className="w-4 h-4 text-cyan-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.risk && (
            <div className="p-3 space-y-2.5 animate-fadeIn">
              {ev.top_risk_factors && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-200 text-xs space-y-1">
                  {ev.top_risk_factors.split(';').map((factor, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">⚠</span>
                      <span className="text-xs font-mono leading-tight">{factor.trim()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 5-Component Breakdown with Visual Progress Bars */}
              <div className="space-y-2 font-mono text-[11px]">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400">Thermal Severity (25%):</span>
                    <span className="text-amber-400 font-bold">{ev.thermal_score} / 100</span>
                  </div>
                  <div className="w-full bg-[#121e35] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full shadow-[0_0_5px_#f59e0b]"
                      style={{ width: `${ev.thermal_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400">Industrial Proximity (25%):</span>
                    <span className="text-cyan-300 font-bold">{ev.industrial_proximity_score} / 100</span>
                  </div>
                  <div className="w-full bg-[#121e35] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full shadow-[0_0_5px_#06b6d4]"
                      style={{ width: `${ev.industrial_proximity_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400">ML Hazard Multiplier (25%):</span>
                    <span className="text-rose-400 font-bold">{ev.ml_confidence_score} / 100</span>
                  </div>
                  <div className="w-full bg-[#121e35] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-400 h-full rounded-full shadow-[0_0_5px_#ef4444]"
                      style={{ width: `${ev.ml_confidence_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400">Temporal Persistence (15%):</span>
                    <span className="text-blue-300 font-bold">{ev.persistence_score} / 100</span>
                  </div>
                  <div className="w-full bg-[#121e35] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full shadow-[0_0_5px_#3b82f6]"
                      style={{ width: `${ev.persistence_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-slate-400">Recurrence Pattern (10%):</span>
                    <span className="text-slate-300 font-bold">{ev.recurrence_score} / 100</span>
                  </div>
                  <div className="w-full bg-[#121e35] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-400 h-full rounded-full"
                      style={{ width: `${ev.recurrence_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7. RECOMMENDED OPERATIONAL DIRECTIVE */}
        <div
          className="p-3.5 rounded-lg border shadow-lg animate-fadeIn"
          style={{
            backgroundColor: riskCfg.bg,
            borderColor: riskCfg.border,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: riskCfg.color }} />
            <span className="font-heading font-bold text-xs uppercase" style={{ color: riskCfg.color }}>
              RECOMMENDED DISPATCH DIRECTIVE: {riskCfg.label}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-100 mb-1 font-bold">
            {riskCfg.priority}
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {riskCfg.actionDesc}
          </p>
        </div>
      </div>
    </aside>
  )
}
