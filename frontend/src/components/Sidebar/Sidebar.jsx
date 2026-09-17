import React, { useState } from 'react'
import {
  Map,
  BarChart3,
  Search,
  Sparkles,
  Layers,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sliders,
  Server,
  Activity,
  AlertTriangle,
  Home,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Sidebar() {
  const { activeView, setActiveView, setIsPredictModalOpen, events, filteredEvents } = useApp()
  const [collapsed, setCollapsed] = useState(false)

  const criticalCount = events.filter((e) => e.risk_level === 'CRITICAL').length
  const highCount = events.filter((e) => e.risk_level === 'HIGH').length
  const moderateCount = events.filter((e) => e.risk_level === 'MODERATE').length
  const lowCount = events.filter((e) => e.risk_level === 'LOW').length

  const navItems = [
    {
      id: 'landing',
      label: 'Public Portal',
      icon: Home,
      badge: null,
      desc: 'Institutional overview',
    },
    {
      id: 'dashboard',
      label: 'GIS Tactical Map',
      icon: Map,
      badge: filteredEvents.length,
      desc: 'Live thermal overlay',
    },
    {
      id: 'alerts',
      label: '🚨 Alert & Response',
      icon: ShieldAlert,
      badge: criticalCount + highCount > 0 ? criticalCount + highCount : null,
      desc: 'Disaster triage & SOPs',
    },
    {
      id: 'investigation',
      label: 'Event Investigation',
      icon: Search,
      badge: null,
      desc: 'Telemetry & SHAP XAI',
    },
    {
      id: 'analytics',
      label: 'Telemetry & Analytics',
      icon: BarChart3,
      badge: null,
      desc: 'Statistical charts',
    },
    {
      id: 'health',
      label: 'System Health',
      icon: Server,
      badge: null,
      desc: 'Gateway & ML runtime',
    },
  ]

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-60'
      } bg-[#040916]/95 backdrop-blur-md border-r border-[#12203a] flex flex-col justify-between select-none z-20 shrink-0 transition-all duration-300 shadow-2xl relative md:sticky md:top-0 md:self-start md:max-h-screen md:overflow-y-auto`}
    >
      {/* Top Nav Header & Items */}
      <div className="py-3 px-2 flex flex-col gap-1">
        <div className="flex items-center justify-between px-2 pb-2">
          {!collapsed && (
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]"></span>
              SURVEILLANCE
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-[#0c1830] border border-transparent hover:border-[#172a4c] transition-colors ml-auto cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.18)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#091428] border border-transparent hover:border-[#152542]'
              }`}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#06b6d4]" />
              )}

              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              />

              {!collapsed && (
                <div className="text-left truncate flex-1">
                  <div className={`font-semibold leading-tight ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.desc}</div>
                </div>
              )}

              {!collapsed && item.badge !== null && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#0b1730] text-cyan-300 font-bold border border-cyan-800/60 shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        <div className="my-2 border-t border-[#12203a]" />

        {!collapsed && (
          <div className="px-2 pb-1 text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">
            AI WORKBENCH
          </div>
        )}

        <button
          onClick={() => setIsPredictModalOpen(true)}
          title={collapsed ? 'Live AI Inference Workbench' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-amber-200 bg-gradient-to-r from-amber-950/40 via-[#151320] to-[#0a1428] hover:from-amber-950/70 hover:to-[#0f1d38] border border-amber-500/40 hover:border-amber-400 transition-all shadow-[0_0_12px_rgba(245,158,11,0.1)] hover:shadow-[0_0_18px_rgba(245,158,11,0.25)] group cursor-pointer"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 group-hover:rotate-12 transition-transform" />
          {!collapsed && (
            <div className="text-left">
              <span className="font-semibold block font-heading text-amber-300">Live AI Predict</span>
              <span className="text-[10px] text-amber-400/80 font-mono">Test XGBoost + SHAP</span>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Emergency / Hazard Alert Callout */}
      <div className="p-2.5 border-t border-[#12203a]">
        {!collapsed ? (
          <div className="p-3 rounded-lg bg-gradient-to-b from-[#180913] to-[#0a040b] border border-rose-900/60 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 animate-pulse text-rose-500 shadow-[0_0_8px_#ef4444]" />
                <span className="font-heading tracking-wide uppercase font-bold text-rose-300">HAZARD MONITOR</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                LIVE
              </span>
            </div>
            
            <p className="text-[11px] text-slate-300 font-mono leading-relaxed mb-2">
              <span className="text-rose-400 font-extrabold">{criticalCount} Critical</span> &amp;{' '}
              <span className="text-orange-400 font-extrabold">{highCount} High</span> active thermal alerts.
            </p>

            {/* Severity Mini Badges */}
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px]">
              <div className="p-1 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 font-bold">
                CRIT: {criticalCount}
              </div>
              <div className="p-1 rounded bg-orange-950/80 border border-orange-800/60 text-orange-300 font-bold">
                HIGH: {highCount}
              </div>
              <div className="p-1 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 font-bold">
                MOD: {moderateCount}
              </div>
              <div className="p-1 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold">
                LOW: {lowCount}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2" title={`${criticalCount} Critical & ${highCount} High Alerts`}>
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
        )}

        {!collapsed && (
          <div className="mt-2.5 text-[10px] text-slate-400 text-center font-mono font-medium">
            SUDARSHAN v1.0.0 • ISRO/NASA FIRMS
          </div>
        )}
      </div>
    </aside>
  )
}
