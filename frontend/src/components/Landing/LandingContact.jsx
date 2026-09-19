import React from 'react'
import { Mail, Phone, MapPin, AlertTriangle } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const NAV_BG  = '#0B2633'
const NAV_BG2 = '#0e2f40'
const DIVIDER = 'rgba(255,255,255,0.09)'
const TEXT_MUTED = 'rgba(148,163,184,0.85)'
const TEXT_DIM   = 'rgba(203,213,225,0.7)'
const SAGE = '#3F7358'
const GOLD = '#C99A55'

const helplines = [
  { label: 'Emergency',      number: '112' },
  { label: 'Fire & Rescue',  number: '101' },
  { label: 'Police',         number: '100' },
]

export default function LandingContact() {
  const sectionRef = useScrollReveal({ threshold: 0.08 })

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ background: `linear-gradient(160deg, ${NAV_BG} 0%, ${NAV_BG2} 100%)` }}
    >
      {/* Top border accent */}
      <div style={{ height: '1px', background: `linear-gradient(to right, transparent, ${SAGE}, transparent)` }} />

      <div className="landing-container pt-20 pb-14 md:pt-24 md:pb-18">

        {/* Section label */}
        <div className="reveal mb-12">
          <span
            className="text-[9.5px] font-mono font-bold tracking-[0.22em] uppercase"
            style={{ color: SAGE }}
          >
            Get In Touch
          </span>
        </div>

        {/* Three distinct content zones — full width */}
        <div
          className="reveal grid grid-cols-1 md:grid-cols-3 border-t border-b"
          style={{ borderColor: DIVIDER }}
        >

          {/* ZONE 1 — Contact & Project info */}
          <div className="py-10 md:pr-10" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
            <h2
              className="font-serif font-bold text-[1.75rem] leading-[1.2] tracking-tight mb-4"
              style={{ color: '#F0EEE8' }}
            >
              Contact<br />SUDARSHAN
            </h2>
            <p
              className="font-sans text-[12.5px] leading-relaxed mb-7"
              style={{ color: TEXT_MUTED }}
            >
              Project coordination and technical inquiries for the SUDARSHAN satellite intelligence platform.
            </p>

            {/* Location */}
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SAGE }} />
              <div>
                <p className="font-sans font-semibold text-[12.5px]" style={{ color: '#E2E8F0' }}>
                  L. D. College of Engineering
                </p>
                <p className="font-sans text-[11.5px]" style={{ color: TEXT_MUTED }}>
                  Ahmedabad, Gujarat, India
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SAGE }} />
              <div>
                <p className="font-sans font-semibold text-[11px] mb-0.5" style={{ color: TEXT_DIM }}>
                  Official Project Email
                </p>
                <a
                  href="mailto:sampadroy391@gmail.com"
                  className="font-mono text-[12px] font-bold transition-colors"
                  style={{ color: GOLD }}
                  onMouseOver={e => (e.currentTarget.style.color = '#E0B870')}
                  onMouseOut={e  => (e.currentTarget.style.color = GOLD)}
                >
                  sampadroy391@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* ZONE 2 — Emergency Resources */}
          <div
            className="py-10 md:px-10"
            style={{
              borderBottom: `1px solid ${DIVIDER}`,
              borderLeft:  `1px solid ${DIVIDER}`,
              borderRight: `1px solid ${DIVIDER}`,
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
              <span
                className="text-[9.5px] font-mono font-bold tracking-[0.2em] uppercase"
                style={{ color: TEXT_DIM }}
              >
                Emergency Resources
              </span>
            </div>

            <div className="space-y-3 mb-7">
              {helplines.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${DIVIDER}` }}
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: SAGE }} />
                    <span className="font-sans text-[12.5px]" style={{ color: '#CBD5E1' }}>
                      {h.label}
                    </span>
                  </div>
                  <a
                    href={`tel:${h.number}`}
                    className="font-mono font-bold text-[16px] tracking-wide transition-colors"
                    style={{ color: '#F0EEE8' }}
                    onMouseOver={e => (e.currentTarget.style.color = GOLD)}
                    onMouseOut={e  => (e.currentTarget.style.color = '#F0EEE8')}
                  >
                    {h.number}
                  </a>
                </div>
              ))}
            </div>

            <p
              className="font-sans text-[10.5px] leading-relaxed"
              style={{ color: 'rgba(148,163,184,0.55)' }}
            >
              SUDARSHAN operates as a decision support system and does not dispatch automated alerts to emergency services.
            </p>
          </div>

          {/* ZONE 3 — Platform identity (no hackathon labels) */}
          <div
            className="hidden md:flex py-10 md:pl-10 flex-col justify-between"
            style={{ borderBottom: `1px solid ${DIVIDER}` }}
          >
            <div>
              <p
                className="font-serif font-bold text-[1.5rem] leading-[1.35] tracking-tight mb-6"
                style={{ color: 'rgba(240,238,232,0.16)' }}
              >
                SATELLITE<br />INSIGHTS FOR<br />A SAFER<br />TOMORROW
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: SAGE }}>
                Platform
              </p>
              <p className="font-sans text-[12.5px] font-semibold" style={{ color: '#E2E8F0' }}>
                SUDARSHAN
              </p>
              <p className="font-sans text-[11.5px]" style={{ color: TEXT_MUTED }}>
                AI-Powered Industrial Thermal Intelligence &amp; Early Warning System
              </p>
            </div>
          </div>

        </div>

        {/* Bottom footer bar */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{ borderTop: `1px solid ${DIVIDER}` }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/Logo png.png"
              alt="SUDARSHAN"
              className="w-7 h-7 object-contain rounded-full opacity-80"
            />
            <span className="font-serif font-bold text-[14px]" style={{ color: '#F0EEE8' }}>
              SUDARSHAN
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {[
              ['Home',    'hero'],
              ['Services','services'],
              ['About',   'about'],
              ['Impact',  'impact'],
              ['Team',    'team'],
              ['Contact', 'contact'],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}
                className="font-sans text-[11.5px] cursor-pointer transition-colors"
                style={{ color: TEXT_MUTED }}
                onMouseOver={e => (e.currentTarget.style.color = '#F0EEE8')}
                onMouseOut={e  => (e.currentTarget.style.color = TEXT_MUTED)}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Copyright */}
          <p className="font-sans text-[11px]" style={{ color: 'rgba(100,116,139,0.9)' }}>
            © 2026 Team SUDARSHAN
          </p>
        </div>

      </div>
    </section>
  )
}
