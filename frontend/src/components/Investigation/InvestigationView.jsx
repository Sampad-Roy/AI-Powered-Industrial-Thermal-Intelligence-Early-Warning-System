import React from 'react'
import {
  Search,
  Crosshair,
  Flame,
  Radio,
  Factory,
  Trees,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Compass,
  Zap,
  Calendar,
  Layers,
  MapPin,
  ArrowRight,
  Activity,
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
  formatCoords,
  formatTimestamp,
  formatNumber,
} from '../../utils/formatters'

export default function InvestigationView() {
  const { events, selectedEvent, setSelectedEvent, setActiveView, focusEvent, getLocation } = useApp()

  const currentEvent = selectedEvent || (events.length > 0 ? events[0] : null)

  if (!currentEvent) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        No event data available to investigate.
      </div>
    )
  }

  const ev = currentEvent
  const classCfg = CLASS_COLORS[ev.predicted_class] || CLASS_COLORS['Other Thermal Source']
  const riskCfg = RISK_LEVELS[ev.risk_level] || RISK_LEVELS.LOW

  const handleLocateOnMap = () => {
    setActiveView('dashboard')
    focusEvent(ev)
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto bg-[#020611] space-y-4 select-none">
      {/* Top Banner with Event Selector */}
      <div className="p-4 rounded-xl bg-[#060c1c] border border-[#172a4c] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              DEEP-DIVE SATELLITE ANOMALY INVESTIGATION WORKBENCH
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b1730] text-cyan-300 border border-cyan-800 font-bold shadow-sm">
              CLUSTER #{ev.cluster_id}
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-slate-100 mt-1 flex items-center gap-3">
            {ev.event_id}
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: riskCfg.bg,
                color: riskCfg.color,
                border: `1px solid ${riskCfg.border}`,
              }}
            >
              {ev.risk_level} • RISK SCORE {ev.final_risk_score} / 100
            </span>
          </h2>
        </div>

        {/* Quick Dropdown & Locate Button */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-slate-400 font-semibold">SELECT ANOMALY:</span>
          <select
            value={ev.event_id}
            onChange={(e) => {
              const found = events.find((item) => item.event_id === e.target.value)
              if (found) setSelectedEvent(found)
            }}
            className="select-tactical text-xs py-1.5 px-3 bg-[#081124] border border-[#172a4c] text-slate-200 cursor-pointer max-w-xs"
          >
            {events.map((item) => (
              <option key={item.event_id} value={item.event_id}>
                {item.event_id} — {item.predicted_class} ({item.risk_level} - {item.final_risk_score})
              </option>
            ))}
          </select>

          <button
            onClick={handleLocateOnMap}
            className="btn-tactical text-xs px-3.5 py-1.5 bg-[#0b1730] hover:bg-cyan-950 text-cyan-300 border-cyan-800 hover:border-cyan-400 shadow-sm cursor-pointer"
          >
            <span>Locate on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real Geocoded Location Banner in Investigation View */}
      <div className="p-3.5 rounded-xl bg-[#060c1c] border border-[#172a4c] shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              GEOGRAPHICAL ANOMALY LOCATION (OSM / NOMINATIM)
            </span>
            <p className="text-sm font-heading font-bold text-slate-100 mt-0.5">
              {getLocation(ev)}
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] font-mono text-slate-400">
          <div>GPS: <b className="text-slate-200">{formatCoords(ev.latitude, ev.longitude)}</b></div>
          <span className="text-[10px] text-cyan-400 font-semibold">CRS: EPSG:4326 (WGS84)</span>
        </div>
      </div>

      {/* Grid of Investigation Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Classification & Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* AI Multiclass Inference Result */}
          <div className="p-4 rounded-xl bg-[#060c1c] border border-[#172a4c] space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-[#12203a]">
              <span className="text-xs font-mono font-bold uppercase text-slate-200">
                1. AI MULTICLASS CLASSIFICATION
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                {formatPercent(ev.confidence)} Model Confidence
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                style={{ backgroundColor: classCfg.bg }}
              />
              <div>
                <h3 className="text-base font-bold text-slate-100 font-heading">{ev.predicted_class}</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Target Hazard Tier: <span className="text-slate-200 font-semibold">{classCfg.tag}</span>
                </span>
              </div>
            </div>

            {/* Probabilities */}
            <div className="space-y-2 pt-2 border-t border-[#12203a]">
              {ev.class_probabilities &&
                Object.entries(ev.class_probabilities).map(([cls, prob]) => {
                  const isTop = cls === ev.predicted_class
                  const pVal = (prob * 100).toFixed(1)
                  const cfg = CLASS_COLORS[cls] || CLASS_COLORS['Other Thermal Source']

                  return (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={isTop ? 'text-white font-bold' : 'text-slate-400'}>
                          {cls}
                        </span>
                        <span className={isTop ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                          {pVal}%
                        </span>
                      </div>
                      <div className="w-full bg-[#0e1930] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pVal}%`,
                            backgroundColor: cfg.bg,
                            boxShadow: isTop ? `0 0 8px ${cfg.bg}` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Physical Sensor Telemetry */}
          <div className="p-4 rounded-xl bg-[#060c1c] border border-[#172a4c] space-y-3 shadow-lg">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              2. SATELLITE SENSOR TELEMETRY (VIIRS 375m)
            </span>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#040916] border border-[#12203a] shadow-inner">
                <span className="text-slate-400 block text-[10px] font-semibold">FIRE RADIATIVE POWER</span>
                <span className="text-base font-bold text-amber-400">{formatFRP(ev.frp)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Instantaneous thermal output</span>
              </div>

              <div className="p-3 rounded-lg bg-[#040916] border border-[#12203a] shadow-inner">
                <span className="text-slate-400 block text-[10px] font-semibold">COMBUSTION CONTRAST (ΔT)</span>
                <span className="text-base font-bold text-rose-400">{formatNumber(ev.delta_t, 1)} K</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Sub-pixel combustion intensity</span>
              </div>

              <div className="p-3 rounded-lg bg-[#040916] border border-[#12203a]">
                <span className="text-slate-400 block text-[10px] font-semibold">TI4 (MWIR)</span>
                <span className="text-sm font-bold text-slate-200">{formatTempK(ev.bright_ti4)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">({formatTempC(ev.bright_ti4)})</span>
              </div>

              <div className="p-3 rounded-lg bg-[#040916] border border-[#12203a]">
                <span className="text-slate-400 block text-[10px] font-semibold">TI5 (LWIR)</span>
                <span className="text-sm font-bold text-slate-200">{formatTempK(ev.bright_ti5)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">({formatTempC(ev.bright_ti5)})</span>
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono text-slate-400 pt-2 border-t border-[#12203a]">
              <span>Acquisition UTC: <b className="text-slate-200">{formatTimestamp(ev.acq_datetime)}</b></span>
              <span>Pass: <b className="text-slate-200">{ev.daynight === 1 ? '☀️ Day' : '🌙 Night'}</b></span>
            </div>
          </div>

          {/* Spatial & Multispectral Context */}
          <div className="p-4 rounded-xl bg-[#060c1c] border border-[#172a4c] space-y-2.5 shadow-lg">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-cyan-400" />
              3. INDUSTRIAL GIS &amp; MULTISPECTRAL INDICES
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#12203a]">
                <span className="text-slate-400">Nearest Industrial Boundary:</span>
                <span className="text-slate-200 font-bold">{formatDistance(ev.distance_to_industry)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#12203a]">
                <span className="text-slate-400">Industrial Facilities (500m / 1km / 2km):</span>
                <span className="text-cyan-300 font-bold">
                  {ev.industries_within_500m} / {ev.industries_within_1km} / {ev.industries_within_2km}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#12203a]">
                <span className="text-slate-400">Built-Up Index (NDBI):</span>
                <span className="text-amber-300 font-bold">{formatNumber(ev.NDBI, 3)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-slate-300 font-bold">{formatCoords(ev.latitude, ev.longitude)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SHAP & Risk Engine (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* TreeSHAP Explainability Vectors */}
          <div className="p-4 rounded-xl bg-[#071328] border border-cyan-800/60 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-800/50">
              <span className="text-xs font-mono font-bold uppercase text-cyan-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                4. SHAP EXPLAINABILITY (WHY DID AI CLASSIFY THIS?)
              </span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700">TreeSHAP</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Mathematical feature contribution vectors derived from the trained XGBoost decision forest:
            </p>

            <div className="space-y-2.5">
              {ev.top_shap_explanations &&
                ev.top_shap_explanations.map((shap, idx) => {
                  const desc = SHAP_FEATURE_DESCRIPTIONS[shap.feature]
                  const isPos = shap.shap_value >= 0
                  const barWidth = Math.min(100, (Math.abs(shap.shap_value) / 2.0) * 100)

                  return (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#040916] border border-[#14223d] space-y-1 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200 font-sans">
                          {desc ? desc.label : shap.feature}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isPos ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPos ? `+${shap.shap_value.toFixed(2)}` : shap.shap_value.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-full bg-[#0e1930] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isPos ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-rose-500 shadow-[0_0_6px_#ef4444]'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Observed Feature Value: <b className="text-slate-200">{shap.feature_value}</b></span>
                        <span className={isPos ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                          {isPos ? '▲ SUPPORTS CLASS' : '▼ OPPOSES'}
                        </span>
                      </div>

                      {desc && (
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight font-sans">
                          {desc.judgeExplanation}
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          {/* 5-Factor Risk Scoring Decomposition */}
          <div className="p-4 rounded-xl bg-[#060c1c] border border-[#172a4c] space-y-3 shadow-lg">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              5. TRANSPARENT 5-FACTOR RISK ENGINE SCORE
            </span>

            {ev.top_risk_factors && (
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-200 text-xs space-y-1">
                {ev.top_risk_factors.split(';').map((factor, i) => (
                  <div key={i} className="flex items-start gap-1.5 font-mono">
                    <span className="text-rose-400 font-bold">⚠</span>
                    <span>{factor.trim()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-400">Thermal Severity (25% Weight):</span>
                  <span className="text-amber-400 font-bold">{ev.thermal_score} / 100</span>
                </div>
                <div className="w-full bg-[#0e1930] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full shadow-[0_0_5px_#f59e0b]" style={{ width: `${ev.thermal_score}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-400">Industrial Proximity (25% Weight):</span>
                  <span className="text-cyan-300 font-bold">{ev.industrial_proximity_score} / 100</span>
                </div>
                <div className="w-full bg-[#0e1930] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full shadow-[0_0_5px_#06b6d4]" style={{ width: `${ev.industrial_proximity_score}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-400">ML Hazard Multiplier (25% Weight):</span>
                  <span className="text-rose-400 font-bold">{ev.ml_confidence_score} / 100</span>
                </div>
                <div className="w-full bg-[#0e1930] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full shadow-[0_0_5px_#ef4444]" style={{ width: `${ev.ml_confidence_score}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-400">Temporal Persistence (15% Weight):</span>
                  <span className="text-blue-300 font-bold">{ev.persistence_score} / 100</span>
                </div>
                <div className="w-full bg-[#0e1930] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full shadow-[0_0_5px_#3b82f6]" style={{ width: `${ev.persistence_score}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="text-slate-400">Recurrence Pattern (10% Weight):</span>
                  <span className="text-slate-300 font-bold">{ev.recurrence_score} / 100</span>
                </div>
                <div className="w-full bg-[#0e1930] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: `${ev.recurrence_score}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Dispatch Directive */}
          <div
            className="p-4 rounded-xl border shadow-xl"
            style={{
              backgroundColor: riskCfg.bg,
              borderColor: riskCfg.border,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: riskCfg.color }} />
              <span className="font-heading font-bold text-sm uppercase" style={{ color: riskCfg.color }}>
                OPERATIONAL DISPATCH DIRECTIVE: {riskCfg.label}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-100 font-bold mb-1">
              {riskCfg.priority}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {riskCfg.actionDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
