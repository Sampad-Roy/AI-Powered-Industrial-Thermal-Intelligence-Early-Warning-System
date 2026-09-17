import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function LandingImpact({ onLaunchDashboard }) {
  const { setActiveView } = useApp()

  const handleExplore = () => {
    if (onLaunchDashboard) onLaunchDashboard()
    else setActiveView('dashboard')
  }

  const metrics = [
    { value: '375m', label: 'Spatial Telemetry', detail: 'Precision VIIRS I-band resolution.' },
    { value: '100%', label: 'Transparent XAI', detail: 'Exact TreeSHAP feature attributions.' },
    { value: '5-Factor', label: 'Risk Engine', detail: 'Multi-dimensional severity scoring.' },
    { value: '24/7', label: 'Surveillance', detail: 'Continuous satellite overpass monitoring.' },
  ]

  return (
    <section
      id="impact"
      className="relative pt-28 pb-36 md:pt-36 md:pb-44 overflow-hidden"
      style={{
        backgroundImage: 'url(/landing_impact.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 55%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay — preserves landscape details */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#173042]/70 via-[#173042]/65 to-[#173042]/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Eyebrow */}
        <div className="mb-6">
          <span className="text-[10.5px] font-mono font-bold tracking-widest text-[#C99A55] uppercase">
            Environmental & Industrial Safety
          </span>
        </div>

        {/* Heading */}
        <h2 className="font-serif font-bold text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] text-white tracking-tight leading-[1.15] mb-6 max-w-3xl">
          Towards a Safer, Cleaner<br className="hidden sm:block" />
          and More Sustainable Future
        </h2>

        {/* Description */}
        <p className="font-sans text-[1.05rem] sm:text-[1.15rem] text-slate-200/90 leading-relaxed mb-10 max-w-2xl">
          Leveraging space technology and AI to empower industries, protect communities, and support a more sustainable future through satellite intelligence.
        </p>

        {/* CTA */}
        <button
          onClick={handleExplore}
          className="mb-16 px-7 py-3.5 rounded-xl font-sans font-bold text-[13.5px] text-[#173042] bg-[#EDEBE3] hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2.5 cursor-pointer group"
        >
          <span>Explore Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-10 border-t border-white/15">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-xl p-5 text-left"
            >
              <span className="font-serif font-bold text-[1.8rem] text-[#C99A55] block leading-none mb-1.5">
                {m.value}
              </span>
              <span className="font-sans font-semibold text-[13px] text-white block mb-1">
                {m.label}
              </span>
              <span className="font-sans text-[11.5px] text-slate-300/80 leading-snug block">
                {m.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
