import React, { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Flame,
  Radio,
  Factory,
  Trees,
  Crosshair,
  ExternalLink,
  Layers,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASS_COLORS, RISK_LEVELS } from '../../utils/constants'
import {
  formatFRP,
  formatDistance,
  formatPercent,
  formatCoords,
} from '../../utils/formatters'

export default function EventTable() {
  const { filteredEvents, selectedEvent, focusEvent, getLocation } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [sortField, setSortField] = useState('final_risk_score')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const sortedEvents = useMemo(() => {
    const list = [...filteredEvents]
    list.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (aVal === undefined || aVal === null) aVal = 0
      if (bVal === undefined || bVal === null) bVal = 0

      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortAsc ? aVal - bVal : bVal - aVal
    })
    return list
  }, [filteredEvents, sortField, sortAsc])

  return (
    <div className="bg-[#030712] border-t border-[#12203a] flex flex-col transition-all duration-300 z-10 shrink-0 shadow-2xl">
      {/* Header bar with collapse toggle */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="px-4 py-2 bg-[#060c1c] border-b border-[#12203a] flex items-center justify-between cursor-pointer hover:bg-[#091428] transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
            VALIDATED THERMAL ANOMALY CATALOG &amp; TELEMETRY LOG
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shadow-sm">
            {filteredEvents.length} events
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            {collapsed ? 'Click to expand catalog table' : 'Click to collapse'}
          </span>
          {collapsed ? (
            <ChevronUp className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="max-h-56 overflow-y-auto overflow-x-auto bg-[#030712]">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-[#060c1c] border-b border-[#12203a] text-[10px] font-mono uppercase tracking-wider text-slate-400 sticky top-0 z-10 shadow-sm">
                <th
                  onClick={() => handleSort('event_id')}
                  className="px-3.5 py-2 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>EVENT ID</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-500" />
                  </div>
                </th>
                <th className="px-3.5 py-2">LOCATION (OSM)</th>
                <th
                  onClick={() => handleSort('predicted_class')}
                  className="px-3.5 py-2 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CLASSIFICATION</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('confidence')}
                  className="px-3.5 py-2 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CONFIDENCE</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('final_risk_score')}
                  className="px-3.5 py-2 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>RISK SCORE</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-500" />
                  </div>
                </th>
                <th className="px-3.5 py-2">RISK LEVEL</th>
                <th
                  onClick={() => handleSort('frp')}
                  className="px-3.5 py-2 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>FRP (MW)</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('distance_to_industry')}
                  className="px-3.5 py-2 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>IND. DISTANCE</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cluster_span_days')}
                  className="px-3.5 py-2 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>SPAN</span>
                    <ArrowUpDown className="w-3 h-3 text-cyan-500" />
                  </div>
                </th>
                <th className="px-3.5 py-2">COORDINATES</th>
                <th className="px-3.5 py-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0c162a] font-mono">
              {sortedEvents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-mono text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-6 h-6 text-slate-500 opacity-60" />
                      <span>No thermal anomaly events match the active filter criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedEvents.map((ev) => {
                  const isSelected = selectedEvent?.event_id === ev.event_id
                  const riskCfg = RISK_LEVELS[ev.risk_level] || RISK_LEVELS.LOW
                  const classCfg =
                    CLASS_COLORS[ev.predicted_class] || CLASS_COLORS['Other Thermal Source']

                  return (
                    <tr
                      key={ev.event_id}
                      onClick={() => focusEvent(ev)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'bg-[#081b36] text-cyan-200 border-l-4 border-l-cyan-400'
                          : 'hover:bg-[#071328] text-slate-300'
                      }`}
                    >
                      <td className="px-3.5 py-2 font-bold text-cyan-400 font-mono tracking-tight">{ev.event_id}</td>
                      <td className="px-3.5 py-2 max-w-[220px]">
                        <span className="truncate block font-sans text-xs text-slate-200 font-medium" title={getLocation(ev)}>
                          {getLocation(ev)}
                        </span>
                      </td>
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2 font-sans font-medium text-slate-200">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: classCfg.bg }}
                          />
                          <span className="truncate">{ev.predicted_class}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-300 font-bold">{formatPercent(ev.confidence)}</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 hidden xl:block overflow-hidden">
                            <div
                              className="bg-cyan-400 h-full rounded-full"
                              style={{ width: `${ev.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-2 font-extrabold text-amber-300 font-mono text-sm">{ev.final_risk_score}</td>
                      <td className="px-3.5 py-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block shadow-sm"
                          style={{
                            backgroundColor: riskCfg.bg,
                            color: riskCfg.color,
                            border: `1px solid ${riskCfg.border}`,
                          }}
                        >
                          {ev.risk_level}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-amber-400 font-bold font-mono">{formatFRP(ev.frp)}</td>
                      <td className="px-3.5 py-2 text-slate-400">
                        {formatDistance(ev.distance_to_industry)}
                      </td>
                      <td className="px-3.5 py-2 text-slate-400">{ev.cluster_span_days}d</td>
                      <td className="px-3.5 py-2 text-[11px] text-slate-400 font-mono">
                        {formatCoords(ev.latitude, ev.longitude)}
                      </td>
                      <td className="px-3.5 py-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            focusEvent(ev)
                          }}
                          className="btn-tactical text-[10px] px-2.5 py-1 bg-[#0b1730] hover:bg-cyan-950 text-cyan-300 border-cyan-800 hover:border-cyan-400 font-mono font-bold transition-all hover:scale-105 shadow-sm cursor-pointer"
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
