import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  CLASS_COLORS,
  RISK_LEVELS,
  SHAP_FEATURE_DESCRIPTIONS,
} from '../../utils/constants'
import {
  formatPercent,
  formatFRP,
  formatDistance,
  formatNumber,
} from '../../utils/formatters'

export default function PredictionModal() {
  const { isPredictModalOpen, setIsPredictModalOpen, predictCustom } = useApp()

  // Input form state (defaults based on realistic Sanand GIDC industrial scenario)
  const [formData, setFormData] = useState({
    bright_ti4: 345.2,
    bright_ti5: 298.5,
    frp: 18.5,
    confidence: 85,
    daynight: 1, // 1 = Day, 0 = Night
    distance_to_industry: 45.0,
    industries_within_500m: 4,
    industries_within_1km: 9,
    industries_within_2km: 22,
    cluster_event_count: 8,
    cluster_unique_dates: 4,
    cluster_span_days: 12,
    NDVI: 0.12,
    NDBI: 0.48,
    NDWI: -0.22,
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  if (!isPredictModalOpen) return null

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: parseFloat(val) || 0 }))
  }

  const handlePresetSelect = (presetType) => {
    if (presetType === 'industrial_fire') {
      setFormData({
        bright_ti4: 362.8,
        bright_ti5: 294.2,
        frp: 48.6,
        confidence: 95,
        daynight: 0,
        distance_to_industry: 25.0,
        industries_within_500m: 6,
        industries_within_1km: 14,
        industries_within_2km: 30,
        cluster_event_count: 2,
        cluster_unique_dates: 1,
        cluster_span_days: 0,
        NDVI: 0.08,
        NDBI: 0.55,
        NDWI: -0.25,
      })
    } else if (presetType === 'gas_flare') {
      setFormData({
        bright_ti4: 355.0,
        bright_ti5: 296.0,
        frp: 22.0,
        confidence: 90,
        daynight: 0,
        distance_to_industry: 120.0,
        industries_within_500m: 3,
        industries_within_1km: 8,
        industries_within_2km: 18,
        cluster_event_count: 35,
        cluster_unique_dates: 18,
        cluster_span_days: 75,
        NDVI: 0.10,
        NDBI: 0.45,
        NDWI: -0.18,
      })
    } else if (presetType === 'persistent_heat') {
      setFormData({
        bright_ti4: 328.5,
        bright_ti5: 302.1,
        frp: 6.5,
        confidence: 80,
        daynight: 1,
        distance_to_industry: 80.0,
        industries_within_500m: 5,
        industries_within_1km: 11,
        industries_within_2km: 24,
        cluster_event_count: 42,
        cluster_unique_dates: 22,
        cluster_span_days: 90,
        NDVI: 0.14,
        NDBI: 0.42,
        NDWI: -0.15,
      })
    } else if (presetType === 'other_thermal') {
      setFormData({
        bright_ti4: 312.0,
        bright_ti5: 300.5,
        frp: 2.8,
        confidence: 65,
        daynight: 1,
        distance_to_industry: 3800.0,
        industries_within_500m: 0,
        industries_within_1km: 0,
        industries_within_2km: 1,
        cluster_event_count: 1,
        cluster_unique_dates: 1,
        cluster_span_days: 0,
        NDVI: 0.45,
        NDBI: -0.08,
        NDWI: 0.12,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await predictCustom(formData)
      if (res.success) {
        setResult(res.data)
      } else {
        setError(res.error || 'Inference failed.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during prediction.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#070d1a] border border-[#1a2b48] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#091222] border-b border-[#16233b] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-cyan-950/80 border border-cyan-700 shadow-sm">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-slate-100 flex items-center gap-2">
                SUDARSHAN AI LIVE INFERENCE &amp; SHAP EXPLAINABILITY WORKBENCH
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Run trained XGBoost multiclass model + TreeSHAP + 5-factor risk engine on synthetic or custom sensor inputs
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPredictModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#121f36] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick Scenario Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#142036]">
            <span className="text-xs font-mono text-slate-400 font-semibold">LOAD TEST PRESETS:</span>
            <button
              onClick={() => handlePresetSelect('industrial_fire')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-[#1c1017] hover:bg-[#2b1622] text-rose-300 border border-rose-800/60 transition-all shadow-sm"
            >
              🔥 Industrial Fire Scenario
            </button>
            <button
              onClick={() => handlePresetSelect('gas_flare')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-[#1d140e] hover:bg-[#2e1d13] text-orange-300 border border-orange-800/60 transition-all shadow-sm"
            >
              📻 Gas Flare Scenario
            </button>
            <button
              onClick={() => handlePresetSelect('persistent_heat')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-[#0d1628] hover:bg-[#13223f] text-blue-300 border border-blue-800/60 transition-all shadow-sm"
            >
              🏭 Persistent Heat Scenario
            </button>
            <button
              onClick={() => handlePresetSelect('other_thermal')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-[#101724] hover:bg-[#162033] text-slate-300 border border-slate-700/60 transition-all shadow-sm"
            >
              🌲 Non-Industrial Heat Scenario
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              {/* TI4 */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">TI4 Brightness Temp (K):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bright_ti4}
                  onChange={(e) => handleInputChange('bright_ti4', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* TI5 */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">TI5 Brightness Temp (K):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bright_ti5}
                  onChange={(e) => handleInputChange('bright_ti5', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* FRP */}
              <div className="space-y-1">
                <label className="text-amber-400 font-semibold">Fire Radiative Power (MW):</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.frp}
                  onChange={(e) => handleInputChange('frp', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5 border-amber-500/40 text-amber-300"
                  required
                />
              </div>

              {/* Distance to Industry */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Distance to Industry (m):</label>
                <input
                  type="number"
                  step="1"
                  value={formData.distance_to_industry}
                  onChange={(e) => handleInputChange('distance_to_industry', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* Industries 500m */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Industries in 500m:</label>
                <input
                  type="number"
                  value={formData.industries_within_500m}
                  onChange={(e) => handleInputChange('industries_within_500m', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* Industries 1km */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Industries in 1km:</label>
                <input
                  type="number"
                  value={formData.industries_within_1km}
                  onChange={(e) => handleInputChange('industries_within_1km', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* Cluster Span Days */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Cluster Span (Days):</label>
                <input
                  type="number"
                  value={formData.cluster_span_days}
                  onChange={(e) => handleInputChange('cluster_span_days', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* Cluster Event Count */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Cluster Total Events:</label>
                <input
                  type="number"
                  value={formData.cluster_event_count}
                  onChange={(e) => handleInputChange('cluster_event_count', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* Day / Night */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Day / Night Pass:</label>
                <select
                  value={formData.daynight}
                  onChange={(e) => handleInputChange('daynight', e.target.value)}
                  className="select-tactical w-full px-3 py-1.5"
                >
                  <option value="1">☀️ Daytime Pass</option>
                  <option value="0">🌙 Nighttime Pass</option>
                </select>
              </div>

              {/* NDBI */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Built-Up Index (NDBI):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.NDBI}
                  onChange={(e) => handleInputChange('NDBI', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* NDVI */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Vegetation Index (NDVI):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.NDVI}
                  onChange={(e) => handleInputChange('NDVI', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>

              {/* NDWI */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Water Index (NDWI):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.NDWI}
                  onChange={(e) => handleInputChange('NDWI', e.target.value)}
                  className="input-tactical w-full px-3 py-1.5"
                  required
                />
              </div>
            </div>

            {/* Run Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('industrial_fire')}
                className="btn-tactical text-xs px-3 py-2 bg-[#0a1222] border-[#1c2e4d] text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Industrial Default</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary-glow flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white disabled:opacity-50 shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{loading ? 'RUNNING INFERENCE...' : 'EXECUTE AI INFERENCE'}</span>
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
              Error: {error}
            </div>
          )}

          {/* Inference Output Display */}
          {result && (
            <div className="p-4 rounded-xl bg-[#09152b] border border-cyan-800/60 space-y-4 animate-fadeIn shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-800/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-heading font-bold text-sm text-cyan-200">
                    PREDICTION RESULT: {result.predicted_class}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0d223d] text-cyan-300 border border-cyan-600 font-bold">
                    {formatPercent(result.confidence)} CONFIDENCE
                  </span>
                  <span
                    className="text-xs font-mono px-2.5 py-1 rounded uppercase font-bold"
                    style={{
                      backgroundColor: RISK_LEVELS[result.risk_level]?.bg || '#09152b',
                      color: RISK_LEVELS[result.risk_level]?.color || '#ffffff',
                      border: `1px solid ${RISK_LEVELS[result.risk_level]?.border || '#1e3252'}`,
                    }}
                  >
                    {result.risk_level} • RISK {result.final_risk_score}/100
                  </span>
                </div>
              </div>

              {/* SHAP Explanation in Modal */}
              {result.top_shap_explanations && (
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase block">
                    TreeSHAP Feature Drivers:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {result.top_shap_explanations.map((shap, idx) => {
                      const desc = SHAP_FEATURE_DESCRIPTIONS[shap.feature]
                      const isPos = shap.shap_value >= 0
                      return (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#050b17] border border-[#16233b] font-mono">
                          <div className="flex justify-between font-sans font-semibold text-slate-200">
                            <span>{desc ? desc.label : shap.feature}</span>
                            <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                              {isPos ? `+${shap.shap_value.toFixed(2)}` : shap.shap_value.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Value: {shap.feature_value} | {isPos ? 'Supports' : 'Opposes'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
