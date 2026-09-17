import React from 'react'
import { Flame, Radio, ShieldCheck, Thermometer, ArrowUpRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function LandingServices({ onLaunchDashboard }) {
  const { setActiveView, setFilters } = useApp()

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

  return (
    <section id="services" className="py-20 md:py-28 bg-[#F5F3ED]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="max-w-xl mb-14">
          <span className="text-[10.5px] font-mono font-bold tracking-widest text-[#315E4A] uppercase block mb-3">
            Core Capabilities
          </span>
          <h2 className="font-serif font-bold text-[2rem] sm:text-[2.4rem] text-[#173042] tracking-tight leading-[1.2] mb-4">
            Our Services
          </h2>
          <p className="font-sans text-[1.05rem] text-[#667277] leading-relaxed">
            Comprehensive thermal intelligence for a safer industrial world.
          </p>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((srv) => {
            const Icon = srv.icon
            return (
              <div
                key={srv.id}
                onClick={() => handleServiceClick(srv.filterClass)}
                className="bg-white rounded-xl p-6 border border-[#D9D8D2] hover:border-[#173042]/40 shadow-xs hover:shadow-md transition-all duration-250 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 text-left"
              >
                <div>
                  {/* Number + Icon row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#F5F3ED] border border-[#D9D8D2] flex items-center justify-center text-[#173042] group-hover:bg-[#173042] group-hover:text-white transition-colors duration-250">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#D9D8D2] group-hover:text-[#667277] transition-colors">
                      {srv.number}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-[15.5px] text-[#173042] mb-2 leading-snug">
                    {srv.title}
                  </h3>
                  <p className="font-sans text-[12.5px] text-[#667277] leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Footer row */}
                <div className="pt-5 mt-5 border-t border-[#F5F3ED] flex items-center justify-between">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#B0AEA8]">
                    {srv.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[12px] font-sans font-semibold text-[#173042] opacity-0 group-hover:opacity-100 transition-opacity">
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
