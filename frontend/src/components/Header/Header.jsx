import React, { useState, useEffect } from 'react'
import {
  Satellite,
  Cpu,
  Server,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Layers,
  Radio,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const { apiHealth, refreshEvents, setIsPredictModalOpen, loading } = useApp()
  const [utcTime, setUtcTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setUtcTime(
        now.toUTCString().replace('GMT', 'UTC').replace(/^[A-Za-z]+,\s*/, '')
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const isApiOk = apiHealth && apiHealth.status === 'ok'
  const isModelReady = apiHealth && apiHealth.model_loaded

  return (
    <header className="bg-[#060b17] border-b border-[#16233b] px-4 py-2.5 flex items-center justify-between gap-4 select-none shrink-0 z-30 shadow-xl">
      {/* Brand & Mission Identifier */}
      <div className="flex items-center space-x-3.5">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-950/80 via-[#0a1426] to-blue-950/80 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
          <Satellite className="w-5 h-5 text-cyan-400" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-heading font-extrabold text-base tracking-wider text-slate-100 flex items-center gap-1.5">
              SUDARSHAN
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-600/60 uppercase tracking-widest font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]">
              SIH26162
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            AI-Powered Industrial Thermal Intelligence &amp; Early Warning System
          </p>
        </div>
      </div>

      {/* Subsystem Telemetry Badges */}
      <div className="hidden md:flex items-center gap-2 lg:gap-2.5 text-xs font-mono">
        {/* FIRMS Satellite Stream */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#091222] border border-[#1a2b48] shadow-sm">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">VIIRS 375m:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#10b981]"></span>
            ACTIVE
          </span>
        </div>

        {/* AI Engine Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#091222] border border-[#1a2b48] shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">AI ENGINE:</span>
          {isModelReady ? (
            <span className="text-emerald-400 font-semibold">XGBoost v1.0.0</span>
          ) : (
            <span className="text-cyan-300 font-semibold">XGBoost + SHAP</span>
          )}
        </div>

        {/* API Gateway Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#091222] border border-[#1a2b48] shadow-sm">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">GATEWAY:</span>
          {isApiOk ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ONLINE
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              STANDALONE (CATALOG)
            </span>
          )}
        </div>

        {/* Geographic Region */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#091222] border border-[#1a2b48] shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">CORRIDOR:</span>
          <span className="text-slate-200 font-semibold">Sanand - Vatva GIDC</span>
        </div>

        {/* UTC Synchronized Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#040813] border border-[#16233b] text-slate-300 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-cyan-300 tracking-wider">{utcTime || 'UTC SYNCHRONIZED'}</span>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={refreshEvents}
          disabled={loading}
          title="Refresh satellite telemetry and catalog"
          className="p-2 text-slate-400 hover:text-cyan-300 bg-[#091222] hover:bg-[#121f36] border border-[#1c2e4d] hover:border-cyan-500/50 rounded-md transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        <button
          onClick={() => setIsPredictModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan-400/50 transition-all active:scale-95 hover:shadow-[0_0_22px_rgba(6,182,212,0.5)] group"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-100 group-hover:rotate-12 transition-transform" />
          <span className="font-heading tracking-wide">RUN AI ANALYSIS</span>
        </button>
      </div>
    </header>
  )
}
