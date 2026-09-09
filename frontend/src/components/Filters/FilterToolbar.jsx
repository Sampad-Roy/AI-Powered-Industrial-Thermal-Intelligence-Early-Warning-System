import React from 'react'
import {
  Search,
  RotateCcw,
  Sun,
  Moon,
  Filter,
  X,
  SlidersHorizontal,
  Compass,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASSIFICATIONS } from '../../utils/constants'

export default function FilterToolbar() {
  const { filters, setFilters, resetFilters, events, filteredEvents } = useApp()

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  const handleClassChange = (e) => {
    setFilters((prev) => ({ ...prev, classification: e.target.value }))
  }

  const handleRiskChange = (e) => {
    setFilters((prev) => ({ ...prev, riskLevel: e.target.value }))
  }

  const handleConfidenceChange = (e) => {
    setFilters((prev) => ({ ...prev, minConfidence: parseFloat(e.target.value) }))
  }

  const handleDayNightChange = (val) => {
    setFilters((prev) => ({ ...prev, daynight: val }))
  }

  const isFiltered =
    filters.search !== '' ||
    filters.classification !== 'ALL' ||
    filters.riskLevel !== 'ALL' ||
    filters.minConfidence > 0 ||
    filters.daynight !== 'ALL'

  return (
    <div className="px-4 py-2.5 bg-[#060b17] border-b border-[#16233b] flex flex-wrap items-center justify-between gap-3 text-xs select-none shrink-0 shadow-md">
      {/* Search Input */}
      <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter Event ID (e.g. FIRMS_0012) or Class..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-8 py-1.5 bg-[#0a1222] border border-[#1c2e4d] rounded-md text-slate-100 placeholder-slate-400 text-xs font-mono focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Classification Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-mono text-[11px] font-semibold">CLASS:</span>
          <select
            value={filters.classification}
            onChange={handleClassChange}
            className="select-tactical text-xs py-1 px-2.5 bg-[#0a1222] border border-[#1c2e4d] text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Hazard Classes</option>
            <option value={CLASSIFICATIONS.INDUSTRIAL_FIRE}>Industrial Fire</option>
            <option value={CLASSIFICATIONS.GAS_FLARE}>Gas Flare</option>
            <option value={CLASSIFICATIONS.PERSISTENT_HEAT}>Persistent Industrial Heat</option>
            <option value={CLASSIFICATIONS.OTHER_THERMAL}>Other Thermal Source</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-mono text-[11px] font-semibold">RISK:</span>
          <select
            value={filters.riskLevel}
            onChange={handleRiskChange}
            className="select-tactical text-xs py-1 px-2.5 bg-[#0a1222] border border-[#1c2e4d] text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical (75–100)</option>
            <option value="HIGH">High (50–75)</option>
            <option value="MODERATE">Moderate (25–50)</option>
            <option value="LOW">Low (0–25)</option>
          </select>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-[#0a1222] border border-[#1c2e4d] shadow-sm">
          <span className="text-slate-400 font-mono text-[11px] font-medium">
            CONF &ge; <span className="text-cyan-400 font-bold">{Math.round(filters.minConfidence * 100)}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.05"
            value={filters.minConfidence}
            onChange={handleConfidenceChange}
            className="w-16 cursor-pointer"
          />
        </div>

        {/* Day / Night Segmented Switch */}
        <div className="flex items-center rounded-md bg-[#0a1222] border border-[#1c2e4d] p-0.5 shadow-sm">
          <button
            onClick={() => handleDayNightChange('ALL')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-all font-semibold ${
              filters.daynight === 'ALL'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => handleDayNightChange('DAY')}
            title="Daytime satellite overpasses only"
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono transition-all font-semibold ${
              filters.daynight === 'DAY'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>DAY</span>
          </button>
          <button
            onClick={() => handleDayNightChange('NIGHT')}
            title="Nighttime satellite overpasses only"
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono transition-all font-semibold ${
              filters.daynight === 'NIGHT'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3 h-3 text-indigo-400" />
            <span>NIGHT</span>
          </button>
        </div>

        {/* Reset Action */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-600 transition-all font-mono text-[11px] font-semibold active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>RESET</span>
          </button>
        )}
      </div>

      {/* Match Counter */}
      <div className="font-mono text-[11px] text-slate-400 hidden sm:block">
        Showing <span className="text-cyan-400 font-bold">{filteredEvents.length}</span> of{' '}
        <span className="text-slate-300 font-bold">{events.length}</span> events
      </div>
    </div>
  )
}
