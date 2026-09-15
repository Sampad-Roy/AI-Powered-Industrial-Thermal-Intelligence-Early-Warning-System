import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'
import { CLASSIFICATIONS, CLASS_COLORS, RISK_LEVELS } from '../../utils/constants'

export default function MapLegend() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="absolute top-3 right-3 z-[1000] bg-[#060c1c]/95 backdrop-blur-md rounded-lg border border-[#172a4c] shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-xs select-none min-w-[210px] overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-3 py-2 bg-[#081124] border-b border-[#12203a] cursor-pointer hover:bg-[#0c1a35] transition-colors"
      >
        <div className="flex items-center gap-2 font-mono font-bold text-[11px] text-cyan-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>TACTICAL MAP LEGEND</span>
        </div>
        {collapsed ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
        )}
      </div>

      {!collapsed && (
        <div className="p-3 space-y-3 bg-[#060c1c]">
          {/* Classification Types */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              HAZARD CLASSIFICATIONS
            </div>
            <div className="space-y-1.5">
              {Object.entries(CLASS_COLORS).map(([name, cfg]) => (
                <div key={name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cfg.bg }}
                    />
                    <span className="text-slate-200 font-medium truncate">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Severity Levels */}
          <div className="pt-2 border-t border-[#12203a]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              RISK SEVERITY TIERS
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {Object.entries(RISK_LEVELS).map(([level, cfg]) => (
                <div key={level} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="font-mono text-[10px] font-bold text-slate-300">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
