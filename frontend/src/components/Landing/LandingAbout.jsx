import React from 'react'
import { ArrowRight, Globe, ShieldCheck, Cpu } from 'lucide-react'

export default function LandingAbout() {
  const scrollToServices = () => {
    const el = document.getElementById('services')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const pillars = [
    {
      icon: Globe,
      title: 'Geospatial Scale',
      desc: 'Continuous coverage of industrial zones, chemical estates, and refinery clusters.',
    },
    {
      icon: ShieldCheck,
      title: 'Early Warning',
      desc: 'Rapid triage distinguishing routine industrial heat from emergency fire escalation.',
    },
    {
      icon: Cpu,
      title: 'Explainable AI',
      desc: 'Every ML classification is paired with exact SHAP feature attributions for transparent auditing.',
    },
  ]

  return (
    <section id="about" className="py-20 md:py-28 bg-[#EDEBE3] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left: Text */}
          <div className="space-y-7">
            <div>
              <span className="text-[10.5px] font-mono font-bold tracking-widest text-[#315E4A] uppercase block mb-4">
                About the Platform
              </span>
              <h2 className="font-serif font-bold text-[2rem] sm:text-[2.4rem] text-[#173042] tracking-tight leading-[1.2] mb-5">
                What is SUDARSHAN?
              </h2>
              <p className="font-sans text-[1.05rem] text-[#34434A] leading-[1.75]">
                SUDARSHAN is an AI-powered geospatial platform that uses satellite thermal data to detect, classify, and assess industrial thermal anomalies such as fires, gas flares, and persistent heat. It helps support faster, data-driven action for industrial safety, environmental monitoring and compliance.
              </p>
            </div>

            <div className="space-y-4">
              {pillars.map((p, i) => {
                const Icon = p.icon
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#D9D8D2]">
                    <div className="p-2 rounded-lg bg-[#F5F3ED] border border-[#D9D8D2] shrink-0">
                      <Icon className="w-4.5 h-4.5 text-[#315E4A] w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-[14px] text-[#173042] mb-0.5">{p.title}</h4>
                      <p className="font-sans text-[12.5px] text-[#667277] leading-snug">{p.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={scrollToServices}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-sans font-bold text-[13px] text-white bg-[#173042] hover:bg-[#294554] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right: Naturally integrated photograph */}
          <div className="relative h-[420px] sm:h-[500px] lg:h-[560px] rounded-2xl overflow-hidden">
            <img
              src="/landing_about.jpg"
              alt="Satellite Remote Sensing of Industrial Corridor"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.88)' }}
            />
            {/* Natural bottom-to-section-color fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#EDEBE3]/70 via-transparent to-transparent pointer-events-none" />
            {/* Subtle dark edge vignette */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#173042]/10 via-transparent to-[#173042]/20 pointer-events-none" />

            {/* Telemetry overlay — anchored bottom-left */}
            <div className="absolute bottom-5 left-5 right-5 bg-[#173042]/85 backdrop-blur-sm rounded-xl border border-white/15 p-4 text-white">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/15">
                <span className="font-mono text-[10px] text-[#C99A55] font-bold tracking-widest uppercase">
                  Remote Sensing Telemetry
                </span>
                <span className="font-mono text-[9px] text-slate-400">EPSG:4326 (WGS84)</span>
              </div>
              <p className="text-[11px] text-slate-200/90 font-sans leading-relaxed">
                Multi-spectral fusion combining VIIRS 375m Middle-Infrared (TI4) and Longwave-Infrared (TI5) brightness temperatures with OpenStreetMap industrial boundaries.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
