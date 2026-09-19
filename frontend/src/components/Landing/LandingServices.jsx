import React from 'react'
import { Flame, Radio, ShieldCheck, Thermometer, ArrowUpRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export default function LandingServices({ onLaunchDashboard }) {
  const { setActiveView, setFilters } = useApp()
  const sectionRef = useScrollReveal({ threshold: 0.1 })

  const handleServiceClick = (filterClass) => {
    if (filterClass) setFilters((prev) => ({ ...prev, classification: filterClass }))
    if (onLaunchDashboard) onLaunchDashboard()
    else setActiveView('dashboard')
  }

  const services = [
    {
      id: 'thermal-anomaly',
      number: '01',
      title: 'Thermal Anomaly Detection',
      description: 'Identify high-temperature events from VIIRS satellite telemetry with precision radiative power analysis.',
      icon: Thermometer,
      filterClass: 'ALL',
      tag: 'VIIRS Telemetry',
    },
    {
      id: 'industrial-fire',
      number: '02',
      title: 'Industrial Fire Detection',
      description: 'Detect and classify potential industrial fire incidents using XGBoost multi-class AI inference.',
      icon: Flame,
      filterClass: 'Industrial Fire',
      tag: 'Emergency Triage',
    },
    {
      id: 'gas-flare',
      number: '03',
      title: 'Gas Flare Monitoring',
      description: 'Identify and monitor gas flare events across industrial zones for emission compliance audits.',
      icon: Radio,
      filterClass: 'Gas Flare',
      tag: 'Emission Audit',
    },
    {
      id: 'risk-assessment',
      number: '04',
      title: 'Risk Assessment & Compliance',
      description: 'Assess risk levels with a 5-factor mathematical engine and SHAP explainability for environmental compliance.',
      icon: ShieldCheck,
      filterClass: 'Persistent Industrial Heat',
      tag: '5-Factor Engine',
    },
  ]

  const delayClass = ['reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4']

  return (
    <section id="services" className="py-24 md:py-32 bg-[#F5F3ED]" ref={sectionRef}>
      <div className="landing-container">

        {/* Header — balanced responsive layout */}
        <div className="reveal mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-[2rem] sm:text-[2.5rem] text-[#173042] tracking-tight leading-[1.18]">
              Our Services
            </h2>
          </div>
          <p className="font-sans text-[1.05rem] text-[#667277] leading-relaxed max-w-md sm:text-right">
            Comprehensive thermal intelligence for a safer industrial world.
          </p>
        </div>

        {/* 4-column card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon
            return (
              <div
                key={srv.id}
                onClick={() => handleServiceClick(srv.filterClass)}
                className={`reveal ${delayClass[idx]} landing-card bg-white rounded-xl p-6 border border-[#D9D8D2] hover:border-[#173042]/35 shadow-sm flex flex-col justify-between group cursor-pointer text-left`}
              >
                <div>
                  {/* Number + Icon row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl bg-[#F5F3ED] border border-[#D9D8D2] flex items-center justify-center text-[#173042] group-hover:bg-[#173042] group-hover:text-white group-hover:border-[#173042] transition-colors duration-250">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#D9D8D2] group-hover:text-[#B0AEA8] transition-colors">
                      {srv.number}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-[15.5px] text-[#173042] mb-2.5 leading-snug">
                    {srv.title}
                  </h3>
                  <p className="font-sans text-[12.5px] text-[#667277] leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Footer row */}
                <div className="pt-5 mt-5 border-t border-[#F0EEE8] flex items-center justify-between">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#B0AEA8]">
                    {srv.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[12px] font-sans font-semibold text-[#173042] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span>View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
