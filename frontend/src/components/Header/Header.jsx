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
  Activity,
  LogOut,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Header() {
  const { apiHealth, refreshEvents, setIsPredictModalOpen, loading, setActiveView, logout, currentUser } = useApp()
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
    <header className="bg-[#040916]/95 backdrop-blur-md border-b border-[#12203a] px-4 py-2 flex items-center justify-between gap-3 select-none shrink-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.7)] relative">
      {/* Brand (Clickable to Landing Page) */}
      <div
        onClick={() => setActiveView('landing')}
        title="Return to Public Landing Page"
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <img
          src="/Logo png.png"
          alt="SUDARSHAN"
          className="h-9 w-auto object-contain shrink-0 drop-shadow-[0_0_14px_rgba(6,182,212,0.45)] group-hover:scale-105 transition-transform"
        />
        <span className="font-heading font-extrabold text-base sm:text-lg tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
          SUDARSHAN
        </span>
      </div>

      {/* Subsystem Telemetry Badges */}
      <div className="hidden md:flex items-center gap-2 text-xs font-mono">
        {/* VIIRS Satellite Stream */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#071022] border border-[#172a4c] shadow-sm">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400 font-medium">VIIRS 375m:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]"></span>
            ACTIVE
          </span>
        </div>

        {/* AI Engine Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#071022] border border-[#172a4c] shadow-sm">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400 font-medium">AI ENGINE:</span>
          {isModelReady ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              XGBoost v1.0.0
            </span>
          ) : (
            <span className="text-cyan-300 font-bold">XGBoost + SHAP</span>
          )}
        </div>

        {/* API Gateway Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#071022] border border-[#172a4c] shadow-sm">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 font-medium">GATEWAY:</span>
          {isApiOk ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ONLINE
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              STANDALONE (CATALOG)
            </span>
          )}
        </div>

        {/* Geographic Region */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#071022] border border-[#172a4c] shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-medium">CORRIDOR:</span>
          <span className="text-slate-200 font-bold">Sanand - Vatva GIDC</span>
        </div>

        {/* UTC Synchronized Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#030712] border border-[#15233e] text-slate-300 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold text-cyan-300 tracking-wider font-mono">{utcTime || 'UTC SYNCHRONIZED'}</span>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={refreshEvents}
          disabled={loading}
          title="Refresh satellite telemetry and catalog"
          className="p-2 text-slate-400 hover:text-cyan-300 bg-[#071022] hover:bg-[#0e1d38] border border-[#172a4c] hover:border-cyan-500/50 rounded-md transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        <button
          onClick={() => setIsPredictModalOpen(true)}
          className="btn-primary-glow flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md text-white border border-cyan-400/50 transition-all active:scale-95 group cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-100 group-hover:rotate-12 transition-transform" />
          <span className="font-heading font-bold tracking-wider uppercase text-[11px]">RUN AI ANALYSIS</span>
        </button>

        <button
          onClick={logout}
          title={currentUser ? `Sign Out (${currentUser})` : 'Sign Out / Logout'}
          className="p-2 text-slate-400 hover:text-rose-300 bg-[#071022] hover:bg-rose-950/40 border border-[#172a4c] hover:border-rose-500/50 rounded-md transition-all active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline text-rose-300 font-mono font-semibold text-[11px]">LOGOUT</span>
        </button>
      </div>
    </header>
  )
}
