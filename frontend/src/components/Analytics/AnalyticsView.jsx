import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Doughnut, Bar, Scatter } from 'react-chartjs-2'
import { BarChart3, PieChart, Activity, Zap, Factory, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CLASSIFICATIONS, CLASS_COLORS, RISK_LEVELS } from '../../utils/constants'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AnalyticsView() {
  const { events } = useApp()

  if (!events || events.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono text-xs">
        <Activity className="w-10 h-10 text-slate-400 mb-3 animate-pulse" />
        <p>No dataset loaded for telemetry analytics. Ensure API Gateway is connected.</p>
      </div>
    )
  }

  // 1. Classification breakdown
  const classCounts = {
    [CLASSIFICATIONS.INDUSTRIAL_FIRE]: 0,
    [CLASSIFICATIONS.GAS_FLARE]: 0,
    [CLASSIFICATIONS.PERSISTENT_HEAT]: 0,
    [CLASSIFICATIONS.OTHER_THERMAL]: 0,
  }

  events.forEach((e) => {
    if (classCounts[e.predicted_class] !== undefined) {
      classCounts[e.predicted_class]++
    }
  })

  const classChartData = {
    labels: Object.keys(classCounts),
    datasets: [
      {
        data: Object.values(classCounts),
        backgroundColor: [
          CLASS_COLORS[CLASSIFICATIONS.INDUSTRIAL_FIRE].bg,
          CLASS_COLORS[CLASSIFICATIONS.GAS_FLARE].bg,
          CLASS_COLORS[CLASSIFICATIONS.PERSISTENT_HEAT].bg,
          CLASS_COLORS[CLASSIFICATIONS.OTHER_THERMAL].bg,
        ],
        borderColor: '#060b17',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  }

  // 2. Risk Level breakdown
  const riskCounts = {
    CRITICAL: 0,
    HIGH: 0,
    MODERATE: 0,
    LOW: 0,
  }

  events.forEach((e) => {
    if (riskCounts[e.risk_level] !== undefined) {
      riskCounts[e.risk_level]++
    }
  })

  const riskChartData = {
    labels: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'],
    datasets: [
      {
        label: 'Event Count',
        data: [
          riskCounts.CRITICAL,
          riskCounts.HIGH,
          riskCounts.MODERATE,
          riskCounts.LOW,
        ],
        backgroundColor: [
          RISK_LEVELS.CRITICAL.color,
          RISK_LEVELS.HIGH.color,
          RISK_LEVELS.MODERATE.color,
          RISK_LEVELS.LOW.color,
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  // 3. FRP vs Distance Scatter Data
  const scatterData = {
    datasets: [
      {
        label: 'Industrial Fire',
        data: events
          .filter((e) => e.predicted_class === CLASSIFICATIONS.INDUSTRIAL_FIRE)
          .map((e) => ({ x: e.distance_to_industry, y: e.frp })),
        backgroundColor: CLASS_COLORS[CLASSIFICATIONS.INDUSTRIAL_FIRE].bg,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Gas Flare',
        data: events
          .filter((e) => e.predicted_class === CLASSIFICATIONS.GAS_FLARE)
          .map((e) => ({ x: e.distance_to_industry, y: e.frp })),
        backgroundColor: CLASS_COLORS[CLASSIFICATIONS.GAS_FLARE].bg,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Persistent Heat',
        data: events
          .filter((e) => e.predicted_class === CLASSIFICATIONS.PERSISTENT_HEAT)
          .map((e) => ({ x: e.distance_to_industry, y: e.frp })),
        backgroundColor: CLASS_COLORS[CLASSIFICATIONS.PERSISTENT_HEAT].bg,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Other Thermal',
        data: events
          .filter((e) => e.predicted_class === CLASSIFICATIONS.OTHER_THERMAL)
          .map((e) => ({ x: e.distance_to_industry, y: e.frp })),
        backgroundColor: CLASS_COLORS[CLASSIFICATIONS.OTHER_THERMAL].bg,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  // 4. Persistence Span Histogram
  const spanBuckets = { '0-7d (Acute)': 0, '8-30d (Short)': 0, '31-60d (Chronic)': 0, '61-90d+ (Permanent)': 0 }
  events.forEach((e) => {
    const s = e.cluster_span_days || 0
    if (s <= 7) spanBuckets['0-7d (Acute)']++
    else if (s <= 30) spanBuckets['8-30d (Short)']++
    else if (s <= 60) spanBuckets['31-60d (Chronic)']++
    else spanBuckets['61-90d+ (Permanent)']++
  })

  const spanChartData = {
    labels: Object.keys(spanBuckets),
    datasets: [
      {
        label: 'Cluster Event Span Count',
        data: Object.values(spanBuckets),
        backgroundColor: '#0284c7',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  // 5. Model Confidence Distribution
  const confBuckets = { '90% – 100%': 0, '80% – 89%': 0, '70% – 79%': 0, '< 70%': 0 }
  events.forEach((e) => {
    const c = (e.confidence || 0) * 100
    if (c >= 90) confBuckets['90% – 100%']++
    else if (c >= 80) confBuckets['80% – 89%']++
    else if (c >= 70) confBuckets['70% – 79%']++
    else confBuckets['< 70%']++
  })

  const confChartData = {
    labels: Object.keys(confBuckets),
    datasets: [
      {
        label: 'Model Confidence Count',
        data: Object.values(confBuckets),
        backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0c1424',
        titleColor: '#f1f5f9',
        bodyColor: '#38bdf8',
        borderColor: '#1e2d4a',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: 'rgba(30, 41, 59, 0.4)' },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { family: 'JetBrains Mono', size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#091222',
        titleColor: '#f1f5f9',
        bodyColor: '#38bdf8',
        borderColor: '#1a2b48',
        borderWidth: 1,
        padding: 10,
      },
    },
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto bg-[#040813] space-y-5 select-none">
      {/* Analytics Title Banner */}
      <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="font-heading font-extrabold text-lg text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            CORRIDOR THERMAL ANALYTICS &amp; STATISTICAL DISTRIBUTIONS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Exploratory telemetry across all {events.length} validated VIIRS satellite thermal events in the Gujarat industrial belt
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shadow-sm">
            {events.length} SAMPLES
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0f1c35] text-slate-300 border border-[#1e3152] font-semibold">
            15 SENSOR FEATURES
          </span>
        </div>
      </div>

      {/* Grid of 5 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Classification Doughnut */}
        <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] flex flex-col h-72 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-cyan-400" />
              1. CLASSIFICATION BREAKDOWN
            </span>
          </div>
          <div className="flex-1 relative">
            <Doughnut data={classChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* 2. Risk Level Bar */}
        <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] flex flex-col h-72 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              2. MULTI-FACTOR RISK SEVERITY
            </span>
          </div>
          <div className="flex-1 relative">
            <Bar data={riskChartData} options={commonOptions} />
          </div>
        </div>

        {/* 3. Model Confidence Distribution */}
        <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] flex flex-col h-72 shadow-lg md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              3. MODEL CONFIDENCE DISTRIBUTION
            </span>
          </div>
          <div className="flex-1 relative">
            <Bar data={confChartData} options={commonOptions} />
          </div>
        </div>

        {/* 4. FRP vs Distance Scatter */}
        <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] flex flex-col h-80 shadow-lg md:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              4. FRP (MW) VS DISTANCE TO INDUSTRY (m)
            </span>
          </div>
          <div className="flex-1 relative">
            <Scatter
              data={scatterData}
              options={{
                ...commonOptions,
                scales: {
                  x: {
                    title: { display: true, text: 'Distance to Industry (m)', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(30, 41, 59, 0.4)' },
                  },
                  y: {
                    title: { display: true, text: 'FRP (MW)', color: '#94a3b8' },
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(30, 41, 59, 0.4)' },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 5. Cluster Span Days */}
        <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] flex flex-col h-80 shadow-lg md:col-span-1 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-blue-400" />
              5. PERSISTENCE SPAN PROFILE
            </span>
          </div>
          <div className="flex-1 relative">
            <Bar data={spanChartData} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
