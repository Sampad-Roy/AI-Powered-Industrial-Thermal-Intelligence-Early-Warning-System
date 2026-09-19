import React from 'react'
import { Satellite, Database, Cpu, TrendingUp, BellRing } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

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

/** Animated horizontal connector line drawn between steps on desktop */
function ConnectorLine({ className = '' }) {
  return (
    <div
      className={`hidden md:block flex-1 self-start mt-[38px] mx-1 ${className}`}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="12"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background track */}
        <line
          x1="0" y1="6" x2="100" y2="6"
          stroke="rgba(63,115,88,0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Animated fill */}
        <line
          className="pipeline-line reveal"
          x1="0" y1="6" x2="100" y2="6"
          stroke="#3F7358"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ '--dash-len': 200 }}
        />
        {/* Arrow tip */}
        <polyline
          points="94,3 100,6 94,9"
          stroke="#3F7358"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

/** Vertical mobile connector */
function MobileConnector() {
  return (
    <div className="md:hidden flex justify-center py-1" aria-hidden="true">
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
        <line x1="8" y1="0" x2="8" y2="20" stroke="rgba(63,115,88,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="3,14 8,20 13,14" stroke="#3F7358" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

const stepDelayClass = ['', 'reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4']

export default function LandingHowItWorks() {
  const sectionRef = useScrollReveal({ threshold: 0.05 })

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: 'linear-gradient(135deg, #0B2633 0%, #102F3D 60%, #0D2530 100%)' }}
    >
      {/* Earth/satellite image — strictly contained within this section */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <img
          src="/landing_about.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.25) saturate(0.65)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #0B2633 0%, #0B2633 28%, rgba(11,38,51,0.88) 52%, rgba(11,38,51,0.35) 78%, rgba(11,38,51,0.18) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, #0B2633 0%, transparent 14%, transparent 86%, #0B2633 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 landing-container">

        {/* Header */}
        <div className="reveal mb-14">
          <h2 className="font-serif font-bold text-[2rem] sm:text-[2.5rem] text-white tracking-tight leading-[1.18]">
            How It Works
          </h2>
        </div>

        {/* 5-stage pipeline row */}
        <div className="flex flex-col md:flex-row md:items-start">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isLast = idx === steps.length - 1
            return (
              <React.Fragment key={step.step}>
                {/* Step card */}
                <div className={`reveal ${stepDelayClass[idx]} flex-1 min-w-0 flex flex-col items-start group`}>

                  {/* Step number — editorial */}
                  <span
                    className="font-mono font-bold text-[11px] tracking-[0.22em] mb-3 block"
                    style={{ color: 'rgba(63,115,88,0.75)' }}
                  >
                    {step.step}
                  </span>

                  {/* Icon circle */}
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full mb-4 shrink-0 transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: 'rgba(63, 115, 88, 0.14)',
                      border: '1px solid rgba(63, 115, 88, 0.32)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#3F7358' }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="font-serif font-bold text-[15px] leading-snug mb-1"
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
                    className="font-sans text-[11.5px] leading-relaxed pr-2"
                    style={{ color: 'rgba(148, 163, 184, 0.8)' }}
                  >
                    {step.desc}
                  </p>
                </div>

                {/* Connector — own flex child, never intrudes into step */}
                {!isLast && (
                  <>
                    <ConnectorLine />
                    <MobileConnector />
                  </>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Bottom divider */}
        <div
          className="mt-16 h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(63,115,88,0.28), transparent)' }}
        />
      </div>
    </section>
  )
}
