import React, { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  Zap,
  Flame,
  Radio,
  Factory,
  Trees,
  TrendingUp,
  AlertTriangle,
  Send,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Activity,
  Calendar,
  Compass,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { runPredict } from '../../api/client'
import {
  PREDICTION_PRESETS,
  CLASS_COLORS,
  RISK_LEVELS,
  SHAP_FEATURE_DESCRIPTIONS,
} from '../../utils/constants'
import {
  formatPercent,
  formatFRP,
  formatTempK,
  formatDistance,
  formatNumber,
} from '../../utils/formatters'

const LOADING_STAGES = [
  { id: 1, title: 'ACQUIRING FEATURES', desc: 'Validating 15-dimensional satellite telemetry vector' },
  { id: 2, title: 'RUNNING XGBOOST', desc: 'Evaluating gradient-boosted decision forest across 4 classes' },
  { id: 3, title: 'CALCULATING SHAP', desc: 'Deriving TreeSHAP local marginal feature attributions' },
  { id: 4, title: 'COMPUTING RISK', desc: 'Calculating 5-factor weighted risk decomposition (0–100)' },
  { id: 5, title: 'GENERATING ASSESSMENT', desc: 'Synthesizing operational directive and alert matrix' },
]

export default function PredictionModal() {
  const { isPredictModalOpen, setIsPredictModalOpen } = useApp()

  const defaultForm = {
    event_id: 'CUSTOM_INFERENCE_01',
    bright_ti4: 355.2,
    bright_ti5: 302.1,
    frp: 18.5,
    delta_t: 53.1,
    daynight: 0,
    distance_to_industry: 120.0,
    industries_within_500m: 3,
    industries_within_1km: 5,
    industries_within_2km: 14,
    NDVI: 0.12,
    NDBI: 0.22,
    NDWI: -0.31,
    cluster_event_count: 16,
    cluster_unique_dates: 12,
    cluster_span_days: 45,
  }

  const [formData, setFormData] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  if (!isPredictModalOpen) return null

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'bright_ti4' || field === 'bright_ti5') {
        const ti4 = field === 'bright_ti4' ? parseFloat(value) || 0 : parseFloat(prev.bright_ti4) || 0
        const ti5 = field === 'bright_ti5' ? parseFloat(value) || 0 : parseFloat(prev.bright_ti5) || 0
        next.delta_t = Math.max(0, parseFloat((ti4 - ti5).toFixed(2)))
      }
      return next
    })
  }

  const handlePresetSelect = (preset) => {
    setFormData({ ...preset.data })
    setResult(null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLoadingStep(1)
    setError(null)
    setResult(null)

    const payload = {
      event_id: formData.event_id || 'INFERENCE_TEST',
      bright_ti4: parseFloat(formData.bright_ti4),
      bright_ti5: parseFloat(formData.bright_ti5),
      frp: parseFloat(formData.frp),
      delta_t: parseFloat(formData.delta_t),
      daynight: parseInt(formData.daynight),
      distance_to_industry: parseFloat(formData.distance_to_industry),
      industries_within_500m: parseInt(formData.industries_within_500m),
      industries_within_1km: parseInt(formData.industries_within_1km),
      industries_within_2km: parseInt(formData.industries_within_2km),
      NDVI: parseFloat(formData.NDVI),
      NDBI: parseFloat(formData.NDBI),
      NDWI: parseFloat(formData.NDWI),
      cluster_event_count: parseInt(formData.cluster_event_count),
      cluster_unique_dates: parseInt(formData.cluster_unique_dates),
      cluster_span_days: parseInt(formData.cluster_span_days),
    }

    // Smooth multi-stage progression animation
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 5 ? prev + 1 : prev))
    }, 180)

    try {
      const res = await runPredict(payload)
      // Allow user to see stage 5 completion
      await new Promise((r) => setTimeout(r, 400))
      setResult(res)
    } catch (err) {
      setError(err.message || 'Inference execution failed. Ensure API is running.')
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
      setLoadingStep(0)
    }
  }

  const classCfg = result ? CLASS_COLORS[result.predicted_class] || CLASS_COLORS['Other Thermal Source'] : null
  const riskCfg = result ? RISK_LEVELS[result.risk_level] || RISK_LEVELS.LOW : null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto select-none">
      <div className="bg-[#070d1a] border border-[#1a2b48] w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#091222] border-b border-[#16233b] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/90 border border-cyan-600/50 text-cyan-400 shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-slate-100 text-base flex items-center gap-2">
                LIVE AI INFERENCE &amp; SHAP EXPLAINABILITY WORKBENCH
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow-sm">
                  POST /predict
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Direct execution of trained XGBoost multi-class model + TreeSHAP feature attributions + 5-factor risk scoring
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPredictModalOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#121f36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Content Layout */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Form & Presets */}
          <div className="lg:col-span-6 space-y-4">
            {/* Presets */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-bold">
                1-CLICK TEST PRESET SCENARIOS
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PREDICTION_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="p-2.5 text-left rounded-lg bg-[#0a1222] hover:bg-[#101d36] border border-[#1a2b48] text-xs transition-all flex flex-col justify-between shadow-sm hover:border-cyan-500/50"
                  >
                    <span className="font-semibold text-slate-200 truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {p.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Event ID */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1 font-semibold">
                  EVENT IDENTIFIER (Optional)
                </label>
                <input
                  type="text"
                  value={formData.event_id}
                  onChange={(e) => handleInputChange('event_id', e.target.value)}
                  className="input-tactical w-full px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                  placeholder="e.g. INFERENCE_CANDIDATE_01"
                />
              </div>

              {/* Thermal Sensors */}
              <div className="p-3 rounded-lg bg-[#081020] border border-[#1a2b48] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  1. VIIRS THERMAL SENSOR TELEMETRY
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block">bright_ti4 (K)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bright_ti4}
                      onChange={(e) => handleInputChange('bright_ti4', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">bright_ti5 (K)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bright_ti5}
                      onChange={(e) => handleInputChange('bright_ti5', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">frp (MW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.frp}
                      onChange={(e) => handleInputChange('frp', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-amber-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">delta_t (K)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.delta_t}
                      onChange={(e) => handleInputChange('delta_t', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-rose-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Spatial Proximity */}
              <div className="p-3 rounded-lg bg-[#081020] border border-[#1a2b48] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  2. INDUSTRIAL PROXIMITY &amp; SATELLITE OVERPASS
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block">distance (m)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.distance_to_industry}
                      onChange={(e) => handleInputChange('distance_to_industry', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">fac &le; 500m</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.industries_within_500m}
                      onChange={(e) => handleInputChange('industries_within_500m', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">fac &le; 1km</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.industries_within_1km}
                      onChange={(e) => handleInputChange('industries_within_1km', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">daynight</label>
                    <select
                      value={formData.daynight}
                      onChange={(e) => handleInputChange('daynight', e.target.value)}
                      className="select-tactical w-full px-2 py-1 text-slate-200"
                    >
                      <option value={0}>0 (Night)</option>
                      <option value={1}>1 (Day)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spectral & Temporal */}
              <div className="p-3 rounded-lg bg-[#081020] border border-[#1a2b48] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block">
                  3. SENTINEL-2 INDICES &amp; TEMPORAL PERSISTENCE
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block">NDVI (Veg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.NDVI}
                      onChange={(e) => handleInputChange('NDVI', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">NDBI (Built)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.NDBI}
                      onChange={(e) => handleInputChange('NDBI', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">NDWI (Water)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.NDWI}
                      onChange={(e) => handleInputChange('NDWI', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">event_count</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.cluster_event_count}
                      onChange={(e) => handleInputChange('cluster_event_count', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">unique_dates</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.cluster_unique_dates}
                      onChange={(e) => handleInputChange('cluster_unique_dates', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">span_days</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.cluster_span_days}
                      onChange={(e) => handleInputChange('cluster_span_days', e.target.value)}
                      className="input-tactical w-full px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-glow flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'EXECUTING INFERENCE...' : 'RUN XGBOOST + SHAP INFERENCE'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(defaultForm)}
                  className="btn-tactical px-3 py-2.5 text-slate-300 rounded-lg text-xs"
                  title="Reset to default values"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Model Output Console */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            {error && (
              <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-700/80 text-rose-200 text-xs mb-4 flex items-start gap-3 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-heading font-bold text-rose-300 uppercase tracking-wider text-[11px] block">
                    {error.includes('AI ENGINE UNAVAILABLE')
                      ? 'AI ENGINE UNAVAILABLE'
                      : error.includes('Validation Error')
                      ? 'INPUT VALIDATION ERROR'
                      : 'API INFERENCE ERROR'}
                  </span>
                  <p className="font-mono text-rose-200 text-[11px] leading-relaxed break-words">{error}</p>
                </div>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="h-full border border-dashed border-[#1a2b48] rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400 bg-[#060b17]">
                <Sparkles className="w-12 h-12 text-slate-400 mb-3" />
                <h4 className="font-heading font-semibold text-slate-200 text-sm mb-1">
                  Ready for Model Inference
                </h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Click <b>RUN XGBOOST + SHAP INFERENCE</b> or select one of the test presets to execute real-time AI classification, 5-factor risk scoring, and TreeSHAP explainability.
                </p>
              </div>
            )}

            {/* Professional Step-by-Step Loading Sequence */}
            {loading && (
              <div className="h-full border border-[#1a2b48] rounded-xl p-6 flex flex-col justify-center bg-[#081020] shadow-inner space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3 pb-3 border-b border-[#16233b]">
                  <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 animate-spin">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-slate-100 text-sm">
                      EXECUTING REAL-TIME AI INFERENCE PIPELINE
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-400">
                      POST http://127.0.0.1:8000/predict
                    </span>
                  </div>
                </div>

                {/* Step List */}
                <div className="space-y-2.5">
                  {LOADING_STAGES.map((st) => {
                    const isDone = loadingStep > st.id
                    const isCurrent = loadingStep === st.id
                    return (
                      <div
                        key={st.id}
                        className={`p-2.5 rounded-lg border transition-all duration-300 flex items-center justify-between ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                            : isCurrent
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                            : 'bg-[#050b17] border-[#16233b] text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                              isDone
                                ? 'bg-emerald-500 text-slate-950'
                                : isCurrent
                                ? 'bg-cyan-400 text-slate-950 animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isDone ? <Check className="w-3 h-3" /> : st.id}
                          </div>
                          <div>
                            <div className="font-heading font-bold text-xs tracking-wide">
                              {st.title}
                            </div>
                            <div className="text-[10px] font-mono opacity-80 line-clamp-1">
                              {st.desc}
                            </div>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400">
                            COMPLETE
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && !loading && (
              <div className="space-y-3 animate-fadeIn">
                {/* 1. Classification & Probabilities */}
                <div className="p-4 rounded-xl bg-[#09152b] border border-cyan-800/60 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-800/50">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                        AI CLASSIFICATION RESULT
                      </span>
                      <h3 className="font-heading font-extrabold text-lg text-slate-100 flex items-center gap-2 mt-0.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: classCfg?.bg }}
                        />
                        {result.predicted_class}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span
                        className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase"
                        style={{
                          backgroundColor: riskCfg?.bg,
                          color: riskCfg?.color,
                          border: `1px solid ${riskCfg?.border}`,
                        }}
                      >
                        {result.risk_level} • {result.final_risk_score}/100
                      </span>
                      <div className="text-xs font-mono text-cyan-300 font-bold mt-1">
                        {formatPercent(result.confidence)} Conf
                      </div>
                    </div>
                  </div>

                  {/* Class Probabilities */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      CLASS PROBABILITIES
                    </div>
                    {Object.entries(result.class_probabilities).map(([cls, p]) => (
                      <div key={cls} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className={cls === result.predicted_class ? 'text-white font-bold' : 'text-slate-400'}>
                            {cls}
                          </span>
                          <span className={cls === result.predicted_class ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                            {(p * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-[#121e35] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${p * 100}%`,
                              backgroundColor: (CLASS_COLORS[cls] || CLASS_COLORS['Other Thermal Source']).bg,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Top SHAP Explanations */}
                <div className="p-3.5 rounded-xl bg-[#081020] border border-[#1a2b48] space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      TOP-5 SHAP FEATURE CONTRIBUTIONS
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-semibold">TreeSHAP</span>
                  </div>

                  <div className="space-y-1.5">
                    {result.top_shap_explanations.map((shap, idx) => {
                      const desc = SHAP_FEATURE_DESCRIPTIONS[shap.feature]
                      const isPos = shap.shap_value >= 0
                      const barWidth = Math.min(100, (Math.abs(shap.shap_value) / 2.0) * 100)

                      return (
                        <div key={idx} className="p-2.5 rounded-md bg-[#050b17] border border-[#16233b] text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                              {desc ? desc.label : shap.feature}
                            </span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                isPos ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isPos ? `+${shap.shap_value.toFixed(2)}` : shap.shap_value.toFixed(2)}
                            </span>
                          </div>

                          <div className="w-full bg-[#121e35] rounded-full h-1.5 mb-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${
                                isPos
                                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                                  : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
                              }`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>Input: <b className="text-slate-200">{shap.feature_value}</b></span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isPos
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {shap.direction}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Expandable Technical Details */}
                  <details className="mt-1 text-[10px] font-mono bg-[#050b17] border border-[#16233b] rounded-lg p-2 text-slate-400 cursor-pointer">
                    <summary className="text-cyan-400 font-bold hover:text-cyan-300 select-none">
                      ▶ TECHNICAL SHAP METHODOLOGY (TreeSHAP)
                    </summary>
                    <div className="mt-1.5 space-y-1 text-slate-300 leading-relaxed font-sans pt-1 border-t border-[#16233b]">
                      <p>
                        TreeSHAP evaluates exact game-theoretic Shapley values across 100+ XGBoost decision trees.
                      </p>
                      <p>
                        Positive values (&gt;0) provide evidentiary weight steering the classifier toward <b className="text-cyan-300">{result.predicted_class}</b>.
                      </p>
                    </div>
                  </details>
                </div>

                {/* 3. 5-Factor Risk Decomposition */}
                <div className="p-3.5 rounded-xl bg-[#081020] border border-[#1a2b48] text-xs font-mono space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      5-FACTOR RISK SCORING BREAKDOWN
                    </span>
                    <span className="text-[10px] font-bold text-cyan-300">
                      Score: {result.final_risk_score} / 100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-slate-400">Thermal Severity (25%):</span>
                        <span className="text-amber-400 font-bold">{result.thermal_score} / 100</span>
                      </div>
                      <div className="w-full bg-[#121e35] rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${result.thermal_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-slate-400">Industrial Proximity (25%):</span>
                        <span className="text-cyan-300 font-bold">{result.industrial_proximity_score} / 100</span>
                      </div>
                      <div className="w-full bg-[#121e35] rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full"
                          style={{ width: `${result.industrial_proximity_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-slate-400">ML Hazard Multiplier (25%):</span>
                        <span className="text-rose-400 font-bold">{result.ml_confidence_score} / 100</span>
                      </div>
                      <div className="w-full bg-[#121e35] rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-rose-400 h-full rounded-full"
                          style={{ width: `${result.ml_confidence_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-slate-400">Temporal Persistence (15%):</span>
                        <span className="text-blue-300 font-bold">{result.persistence_score} / 100</span>
                      </div>
                      <div className="w-full bg-[#121e35] rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-blue-400 h-full rounded-full"
                          style={{ width: `${result.persistence_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-slate-400">Recurrence Pattern (10%):</span>
                        <span className="text-slate-300 font-bold">{result.recurrence_score} / 100</span>
                      </div>
                      <div className="w-full bg-[#121e35] rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-slate-400 h-full rounded-full"
                          style={{ width: `${result.recurrence_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {result.top_risk_factors && (
                    <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-200 font-mono mt-2">
                      <span className="font-bold text-rose-400">Top Risk Drivers: </span>
                      {result.top_risk_factors}
                    </div>
                  )}

                  {/* Operational Directive */}
                  {riskCfg && (
                    <div
                      className="p-2.5 rounded-lg border text-xs mt-2"
                      style={{
                        backgroundColor: riskCfg.bg,
                        borderColor: riskCfg.border,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" style={{ color: riskCfg.color }} />
                        <span className="font-heading font-bold text-[11px] uppercase" style={{ color: riskCfg.color }}>
                          DIRECTIVE: {riskCfg.label} — {riskCfg.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                        {riskCfg.actionDesc}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
