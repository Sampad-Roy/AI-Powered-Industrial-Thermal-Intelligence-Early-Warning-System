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
      label: 'TOTAL DETECTIONS',
      value: total,
      subtext: 'Validated anomalies',
      icon: Activity,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30 hover:border-cyan-400',
      bg: 'bg-[#081020]',
      glow: 'hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    },
    {
      label: 'INDUSTRIAL FIRE',
      value: industrialFires,
      subtext: 'Acute emergency flares',
      icon: Flame,
      color: 'text-rose-400',
      border: 'border-rose-500/30 hover:border-rose-400',
      bg: 'bg-[#081020]',
      glow: 'hover:shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    },
    {
      label: 'GAS FLARE',
      value: gasFlares,
      subtext: 'High-temp flare stacks',
      icon: Radio,
      color: 'text-orange-400',
      border: 'border-orange-500/30 hover:border-orange-400',
      bg: 'bg-[#081020]',
      glow: 'hover:shadow-[0_0_12px_rgba(249,115,22,0.25)]',
    },
    {
      label: 'PERSISTENT HEAT',
      value: persistentHeat,
      subtext: 'Continuous kilns & mills',
      icon: Factory,
      color: 'text-blue-400',
      border: 'border-blue-500/30 hover:border-blue-400',
      bg: 'bg-[#081020]',
      glow: 'hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    },
    {
      label: 'OTHER THERMAL',
      value: otherThermal,
      subtext: 'Rural / baseline heat',
      icon: Trees,
      color: 'text-slate-400',
      border: 'border-slate-600/30 hover:border-slate-500',
      bg: 'bg-[#081020]',
      glow: 'hover:shadow-[0_0_12px_rgba(148,163,184,0.15)]',
    },
    {
      label: 'HIGH + CRITICAL',
      value: highCritical,
      subtext: 'Immediate dispatch',
      icon: ShieldAlert,
      color: 'text-rose-400',
      border: 'border-rose-500/60 hover:border-rose-400',
      bg: 'bg-[#150a16]',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_16px_rgba(239,68,68,0.4)]',
      badge: highCritical > 0 ? 'ALERT' : 'CLEAR',
    },
    {
      label: 'PEAK FRP POWER',
      value: `${maxFRP} MW`,
      subtext: 'Max observed radiance',
      icon: Zap,
      color: 'text-amber-400',
      border: 'border-amber-500/30 hover:border-amber-400',
      bg: 'bg-[#081020]',
      glow: 'hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    },
    {
      label: 'CORRIDOR RISK AVG',
      value: `${avgRisk} / 100`,
      subtext: '5-factor severity index',
      icon: AlertOctagon,
      color: 'text-cyan-300',
      border: 'border-cyan-500/30 hover:border-cyan-400',
      bg: 'bg-[#081020]',
      glow: 'hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    },
  ]

  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 px-4 py-2 bg-[#040813] border-b border-[#142036] select-none shrink-0">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className={`p-2.5 rounded-lg border ${card.border} ${card.bg} ${card.glow} flex flex-col justify-between transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-default relative overflow-hidden group`}
          >
            {/* Subtle corner highlight */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 truncate font-semibold uppercase">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
            </div>

            <div className="flex items-baseline justify-between my-0.5">
              <span className="text-base font-bold font-mono text-slate-100 tracking-tight">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/60 font-bold shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse">
                  {card.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 font-medium truncate">{card.subtext}</span>
          </div>
        )
      })}
    </section>
  )
}
