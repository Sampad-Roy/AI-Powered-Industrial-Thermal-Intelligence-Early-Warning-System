import React from 'react'
import { ArrowRight, Globe, ShieldCheck, Cpu } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export default function LandingAbout() {
  const sectionRef = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

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
    <section id="about" className="py-24 md:py-32 bg-[#EDEBE3] relative overflow-hidden" ref={sectionRef}>
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── LEFT COLUMN: Text & Expanded Feature Blocks ── */}
          <div className="space-y-8">
            <div className="reveal">
              <h2 className="font-serif font-bold text-[2rem] sm:text-[2.6rem] text-[#173042] tracking-tight leading-[1.18] mb-5">
                What is SUDARSHAN?
              </h2>
              <p className="font-sans text-[1.05rem] sm:text-[1.12rem] text-[#34434A] leading-[1.8]">
                SUDARSHAN is an AI-powered geospatial platform that uses satellite thermal data to detect, classify, and assess industrial thermal anomalies such as fires, gas flares, and persistent heat. It helps support faster, data-driven action for industrial safety, environmental monitoring and compliance.
              </p>
            </div>

            {/* 3 Prominent Feature Blocks with sequential scroll reveal */}
            <div className="space-y-4 pt-2">
              {pillars.map((p, i) => {
                const Icon = p.icon
                return (
                  <div
                    key={i}
                    className={`reveal reveal-d${i + 1} landing-card group flex items-start gap-5 p-6 sm:p-7 rounded-2xl bg-white border border-[#D9D8D2] hover:border-[#173042]/35 shadow-sm hover:shadow-md transition-all duration-300 cursor-default`}
                  >
                    <div className="p-3.5 rounded-xl bg-[#F5F3ED] border border-[#D9D8D2] shrink-0 mt-0.5 group-hover:bg-[#173042] group-hover:border-[#173042] transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[#315E4A] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-[18px] sm:text-[19px] text-[#173042] mb-1.5 tracking-tight leading-snug">
                        {p.title}
                      </h4>
                      <p className="font-sans text-[14px] sm:text-[14.5px] text-[#55636B] leading-[1.75]">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Visual Image + Learn More Button ── */}
          <div className="flex flex-col items-end gap-6 w-full lg:pt-2">
            
            {/* Visual Image Container */}
            <div className="reveal reveal-scale relative w-full h-[420px] sm:h-[500px] lg:h-[560px] rounded-2xl overflow-hidden shadow-xl border border-[#D9D8D2] bg-[#173042]/10 group">
              <img
                src="/landing_about.jpg"
                alt="Satellite Remote Sensing of Industrial Corridor"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                style={{ filter: 'brightness(0.88)' }}
              />
              {/* Natural subtle gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1c27]/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#173042]/15 via-transparent to-[#173042]/25 pointer-events-none" />

              {/* Telemetry overlay — anchored bottom */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#173042]/90 backdrop-blur-md rounded-xl border-l-3 border-l-[#3F7358] border border-white/15 p-4 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/12">
                  <span className="font-mono text-[10.5px] text-[#C99A55] font-bold tracking-widest uppercase">
                    Remote Sensing Telemetry
                  </span>
                  <span className="font-mono text-[9.5px] text-slate-400">EPSG:4326 (WGS84)</span>
                </div>
                <p className="text-[11.5px] text-slate-200/90 font-sans leading-relaxed">
                  Multi-spectral fusion combining VIIRS 375m Middle-Infrared (TI4) and Longwave-Infrared (TI5) brightness temperatures with OpenStreetMap industrial boundaries.
                </p>
              </div>
            </div>

            {/* Learn More Button — directly below the image on the right */}
            <div className="reveal reveal-d4 w-full sm:w-auto flex justify-end">
              <button
                onClick={scrollToServices}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-sans font-bold text-[14.5px] text-white bg-[#173042] hover:bg-[#315E4A] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.03] cursor-pointer group whitespace-nowrap"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform duration-300 text-[#EDEBE3]" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
