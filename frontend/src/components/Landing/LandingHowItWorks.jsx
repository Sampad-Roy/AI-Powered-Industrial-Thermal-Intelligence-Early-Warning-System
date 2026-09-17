import React from 'react'
import { Satellite, Database, Cpu, TrendingUp, BellRing } from 'lucide-react'

const steps = [
  {
    step: '01',
    title: 'NASA FIRMS',
    subtitle: 'Thermal Data',
    icon: Satellite,
    desc: 'Near-real-time VIIRS 375m I-band telemetry ingestion capturing radiative power and brightness temperatures.',
  },
  {
    step: '02',
    title: 'Data Processing',
    subtitle: '& GIS Integration',
    icon: Database,
    desc: 'Spatial indexing with OpenStreetMap industrial layers, temporal clustering, and spectral feature extraction.',
  },
  {
    step: '03',
    title: 'AI Classification',
    subtitle: '(XGBoost)',
    icon: Cpu,
    desc: 'Gradient-boosted decision trees classifying industrial fire, gas flares, and persistent manufacturing heat.',
  },
  {
    step: '04',
    title: 'Risk Assessment',
    subtitle: '& Explainability (SHAP)',
    icon: TrendingUp,
    desc: 'Mathematical 5-factor severity index paired with TreeSHAP attributions for transparent auditing.',
  },
  {
    step: '05',
    title: 'Alerts & Insights',
    subtitle: 'for Action',
    icon: BellRing,
    desc: 'Actionable SOPs and high-priority dispatches for GIDC, DISH, and industrial safety command centers.',
  },
]

/* Thin right-pointing arrow — sits in its own flex column, never overlaps steps */
function PipelineArrow() {
  return (
    <div
      className="hidden md:flex items-center justify-center shrink-0"
      style={{ width: '36px' }}
      aria-hidden="true"
    >
      <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
        <line x1="0" y1="8" x2="20" y2="8" stroke="#3F7358" strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="14,3 20,8 14,13" stroke="#3F7358" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

/* Mobile vertical connector */
function MobileConnector() {
  return (
    <div className="md:hidden flex justify-center py-1" aria-hidden="true">
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
        <line x1="8" y1="0" x2="8" y2="20" stroke="#3F7358" strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="3,14 8,20 13,14" stroke="#3F7358" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

export default function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: 'linear-gradient(135deg, #0B2633 0%, #102F3D 60%, #0D2530 100%)' }}
    >
      {/* ── Earth/satellite image — strictly contained within this section ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <img
          src="/landing_about.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.28) saturate(0.7)' }}
        />
        {/* Left-to-right gradient: full navy left → semi-transparent right — keeps text readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #0B2633 0%, #0B2633 30%, rgba(11,38,51,0.85) 55%, rgba(11,38,51,0.3) 80%, rgba(11,38,51,0.15) 100%)',
          }}
        />
        {/* Top + bottom edge fades — seal the image inside the section */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, #0B2633 0%, transparent 15%, transparent 85%, #0B2633 100%)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header — left aligned */}
        <div className="mb-14 max-w-xl">
          <span className="block text-[10.5px] font-mono font-bold tracking-widest uppercase text-[#3F7358] mb-3">
            Intelligence Pipeline
          </span>
          <h2 className="font-serif font-bold text-[2rem] sm:text-[2.4rem] text-white tracking-tight mb-3 leading-[1.2]">
            How It Works
          </h2>
          <p className="font-sans text-[1rem] text-slate-400 leading-relaxed">
            From Satellite Data to Real-World Impact
          </p>
        </div>

        {/* ── 5-Stage Pipeline ── */}
        {/*
          Desktop layout uses a single flex row with dedicated flex items for
          arrows and steps. Each arrow gets its own shrink-0 column so it can
          never intrude into a step's bounding box.
        */}
        <div className="flex flex-col md:flex-row md:items-start">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isLast = idx === steps.length - 1
            return (
              <React.Fragment key={step.step}>
                {/* ── Step ── */}
                <div className="flex-1 min-w-0 flex flex-col items-start">
                  {/* Number badge */}
                  <span
                    className="font-mono font-bold text-[10px] tracking-[0.2em] mb-3"
                    style={{ color: '#3F7358' }}
                  >
                    {step.step}
                  </span>

                  {/* Icon circle — sits directly on dark background */}
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full mb-4 shrink-0"
                    style={{
                      background: 'rgba(63, 115, 88, 0.15)',
                      border: '1px solid rgba(63, 115, 88, 0.35)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#3F7358' }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="font-serif font-bold text-[14.5px] leading-snug mb-1"
                    style={{ color: '#F0EEE8' }}
                  >
                    {step.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="font-sans font-semibold text-[11.5px] mb-3"
                    style={{ color: '#3F7358' }}
                  >
                    {step.subtitle}
                  </p>

                  {/* Description */}
                  <p
                    className="font-sans text-[11.5px] leading-relaxed"
                    style={{ color: 'rgba(148, 163, 184, 0.8)' }}
                  >
                    {step.desc}
                  </p>
                </div>

                {/* ── Arrow (own flex child, never touches step content) ── */}
                {!isLast && (
                  <>
                    <PipelineArrow />
                    <MobileConnector />
                  </>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Subtle bottom rule */}
        <div
          className="mt-14 h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(63,115,88,0.3), transparent)' }}
        />
      </div>
    </section>
  )
}
