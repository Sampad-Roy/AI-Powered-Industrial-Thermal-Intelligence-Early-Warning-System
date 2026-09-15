import React from 'react'
import {
  Flame,
  Radio,
  Factory,
  Trees,
  AlertOctagon,
  Zap,
  Activity,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASSIFICATIONS } from '../../utils/constants'
import { formatNumber, formatFRP } from '../../utils/formatters'

export default function KPIBar() {
  const { events, filteredEvents } = useApp()

  const dataToUse = filteredEvents.length > 0 ? filteredEvents : events

  const total = dataToUse.length
  const industrialFires = dataToUse.filter(
    (e) => e.predicted_class === CLASSIFICATIONS.INDUSTRIAL_FIRE
  ).length
  const gasFlares = dataToUse.filter((e) => e.predicted_class === CLASSIFICATIONS.GAS_FLARE).length
  const persistentHeat = dataToUse.filter(
    (e) => e.predicted_class === CLASSIFICATIONS.PERSISTENT_HEAT
  ).length
  const otherThermal = dataToUse.filter(
    (e) => e.predicted_class === CLASSIFICATIONS.OTHER_THERMAL
  ).length
  const highCritical = dataToUse.filter(
    (e) => e.risk_level === 'CRITICAL' || e.risk_level === 'HIGH'
  ).length

  const avgRisk =
    total > 0
      ? (dataToUse.reduce((acc, curr) => acc + (curr.final_risk_score || 0), 0) / total).toFixed(1)
      : '0.0'

  const maxFRP =
    total > 0
      ? Math.max(...dataToUse.map((e) => e.frp || 0)).toFixed(2)
      : '0.00'

  const cards = [
    {
      id: 'total',
      label: 'TOTAL DETECTIONS',
      value: total,
      subtext: 'Validated anomalies',
      icon: Activity,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30 hover:border-cyan-400/80',
      bg: 'bg-gradient-to-b from-[#071326] to-[#040915]',
      accentBar: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]',
      progress: Math.min(100, (total / 60) * 100),
    },
    {
      id: 'fire',
      label: 'INDUSTRIAL FIRE',
      value: industrialFires,
      subtext: 'Emergency flare events',
      icon: Flame,
      color: 'text-rose-400',
      border: 'border-rose-500/30 hover:border-rose-400/80',
      bg: 'bg-gradient-to-b from-[#160810] to-[#08040a]',
      accentBar: 'bg-rose-500 shadow-[0_0_8px_#ef4444]',
      progress: total > 0 ? (industrialFires / total) * 100 : 0,
    },
    {
      id: 'flare',
      label: 'GAS FLARE',
      value: gasFlares,
      subtext: 'High-temp flare stacks',
      icon: Radio,
      color: 'text-orange-400',
      border: 'border-orange-500/30 hover:border-orange-400/80',
      bg: 'bg-gradient-to-b from-[#180d07] to-[#090503]',
      accentBar: 'bg-orange-500 shadow-[0_0_8px_#f97316]',
      progress: total > 0 ? (gasFlares / total) * 100 : 0,
    },
    {
      id: 'heat',
      label: 'PERSISTENT HEAT',
      value: persistentHeat,
      subtext: 'Kilns, furnaces & mills',
      icon: Factory,
      color: 'text-blue-400',
      border: 'border-blue-500/30 hover:border-blue-400/80',
      bg: 'bg-gradient-to-b from-[#081124] to-[#040914]',
      accentBar: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
      progress: total > 0 ? (persistentHeat / total) * 100 : 0,
    },
    {
      id: 'other',
      label: 'OTHER THERMAL',
      value: otherThermal,
      subtext: 'Rural / baseline heat',
      icon: Trees,
      color: 'text-slate-400',
      border: 'border-slate-700/40 hover:border-slate-500',
      bg: 'bg-gradient-to-b from-[#09101f] to-[#040812]',
      accentBar: 'bg-slate-400',
      progress: total > 0 ? (otherThermal / total) * 100 : 0,
    },
    {
      id: 'high_critical',
      label: 'HIGH + CRITICAL',
      value: highCritical,
      subtext: 'Immediate dispatch',
      icon: ShieldAlert,
      color: 'text-rose-400',
      border: 'border-rose-500/60 hover:border-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
      bg: 'bg-gradient-to-b from-[#1d0914] to-[#0a0309]',
      accentBar: 'bg-rose-500 shadow-[0_0_10px_#ef4444]',
      progress: total > 0 ? (highCritical / total) * 100 : 0,
      badge: highCritical > 0 ? `${highCritical} ACTIVE` : 'CLEAR',
    },
    {
      id: 'frp',
      label: 'PEAK FRP POWER',
      value: `${maxFRP} MW`,
      subtext: 'Max observed radiance',
      icon: Zap,
      color: 'text-amber-400',
      border: 'border-amber-500/30 hover:border-amber-400/80',
      bg: 'bg-gradient-to-b from-[#181106] to-[#080603]',
      accentBar: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
      progress: Math.min(100, (parseFloat(maxFRP) / 50) * 100),
    },
    {
      id: 'risk',
      label: 'CORRIDOR RISK AVG',
      value: `${avgRisk} / 100`,
      subtext: '5-factor severity index',
      icon: AlertOctagon,
      color: 'text-cyan-300',
      border: 'border-cyan-500/30 hover:border-cyan-400/80',
      bg: 'bg-gradient-to-b from-[#071326] to-[#040915]',
      accentBar: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]',
      progress: parseFloat(avgRisk),
    },
  ]

  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 px-4 py-2 bg-[#030712] border-b border-[#121e35] select-none shrink-0 shadow-inner">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`p-2.5 rounded-lg border ${card.border} ${card.bg} flex flex-col justify-between transition-all duration-200 shadow-md hover:-translate-y-0.5 cursor-default relative overflow-hidden group`}
          >
            {/* Top corner subtle HUD tick */}
            <div className="absolute top-0 right-0 w-6 h-6 bg-white/[0.03] rounded-bl-lg pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 truncate font-bold uppercase">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0 group-hover:scale-110 transition-transform`} />
            </div>

            <div className="flex items-baseline justify-between my-0.5">
              <span className="text-base font-extrabold font-mono text-slate-100 tracking-tight">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/60 font-bold shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse">
                  {card.badge}
                </span>
              )}
            </div>

            {/* Micro visual indicator bar */}
            <div className="w-full bg-[#0d1629] rounded-full h-1 my-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${card.accentBar}`}
                style={{ width: `${Math.max(8, Math.min(100, card.progress))}%` }}
              />
            </div>

            <span className="text-[10px] text-slate-400 font-medium truncate">{card.subtext}</span>
          </div>
        )
      })}
    </section>
  )
}
