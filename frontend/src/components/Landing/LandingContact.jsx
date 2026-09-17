import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

const NAV_BG = '#0B2633'
const NAV_BG2 = '#0e2f40'
const DIVIDER = 'rgba(255,255,255,0.09)'
const TEXT_MUTED = 'rgba(148,163,184,0.85)'
const TEXT_DIM = 'rgba(203,213,225,0.7)'
const SAGE = '#3F7358'
const GOLD = '#C99A55'

const helplines = [
  { label: 'Emergency', number: '112' },
  { label: 'Fire & Rescue', number: '101' },
  { label: 'Police', number: '100' },
]

export default function LandingContact() {
  return (
    <section
      id="contact"
      style={{ background: `linear-gradient(135deg, ${NAV_BG} 0%, ${NAV_BG2} 100%)` }}
    >
      {/* ── Top border accent ── */}
      <div style={{ height: '1px', background: `linear-gradient(to right, transparent, ${SAGE}, transparent)` }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20 md:py-24">

        {/* ── 4-column contact grid ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0"
          style={{ borderTop: `1px solid ${DIVIDER}`, borderBottom: `1px solid ${DIVIDER}` }}
        >

          {/* ── COL 1: Get In Touch ── */}
          <div
            className="py-8 lg:pr-8"
            style={{ borderBottom: `1px solid ${DIVIDER}` }}
          >
            <span
              className="block text-[9.5px] font-mono font-bold tracking-[0.2em] uppercase mb-4"
              style={{ color: SAGE }}
            >
              Get In Touch
            </span>
            <h2
              className="font-serif font-bold text-[1.55rem] leading-[1.25] mb-4"
              style={{ color: '#F0EEE8' }}
            >
              Contact<br />SUDARSHAN
            </h2>
            <p
              className="font-sans text-[12.5px] leading-relaxed"
              style={{ color: TEXT_MUTED }}
            >
              Project coordination and technical inquiries for the SUDARSHAN satellite intelligence platform.
            </p>
          </div>


          {/* ── COL 2: Location + Email ── */}
          <div
            className="py-8 lg:px-8"
            style={{ borderBottom: `1px solid ${DIVIDER}` }}
          >
            <span
              className="block text-[9.5px] font-mono font-bold tracking-[0.2em] uppercase mb-6"
              style={{ color: TEXT_DIM }}
            >
              Team SUDARSHAN
            </span>

            <div className="space-y-5">
              {/* Location */}
              <div className="flex items-start gap-3">
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
                    onMouseOut={e => (e.currentTarget.style.color = GOLD)}
                  >
                    sampadroy391@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── COL 3: Emergency Resources ── */}
          <div
            className="py-8 lg:px-8"
            style={{ borderBottom: `1px solid ${DIVIDER}` }}
          >
            <span
              className="block text-[9.5px] font-mono font-bold tracking-[0.2em] uppercase mb-6"
              style={{ color: TEXT_DIM }}
            >
              Emergency Resources
            </span>

            <div className="space-y-4">
              {helplines.map((h, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: SAGE }} />
                    <span className="font-sans text-[12.5px]" style={{ color: '#CBD5E1' }}>
                      {h.label}
                    </span>
                  </div>
                  <a
                    href={`tel:${h.number}`}
                    className="font-mono font-bold text-[13px] transition-colors"
                    style={{ color: '#F0EEE8' }}
                    onMouseOver={e => (e.currentTarget.style.color = GOLD)}
                    onMouseOut={e => (e.currentTarget.style.color = '#F0EEE8')}
                  >
                    {h.number}
                  </a>
                </div>
              ))}
            </div>

            <p
              className="font-sans text-[10.5px] leading-relaxed mt-6"
              style={{ color: 'rgba(148,163,184,0.6)' }}
            >
              SUDARSHAN operates as a decision support system and does not currently dispatch automated alerts to emergency services.
            </p>
          </div>

          {/* ── COL 4: Tagline — hidden on mobile to keep layout clean ── */}
          <div className="hidden sm:flex py-8 lg:pl-8 flex-col justify-between">
            <div>
              <p
                className="font-serif font-bold text-[1.45rem] leading-[1.3] tracking-tight mb-6"
                style={{ color: 'rgba(240,238,232,0.2)' }}
              >
                SATELLITE<br />INSIGHTS FOR<br />A SAFER<br />TOMORROW
              </p>
            </div>

            {/* SIH badge */}
            <div>
              <span
                className="inline-block text-[9px] font-mono font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded"
                style={{
                  color: GOLD,
                  border: `1px solid rgba(201,154,85,0.3)`,
                  background: 'rgba(201,154,85,0.07)',
                }}
              >
                SIH26162 · 2026
              </span>
            </div>
          </div>

        </div>

        {/* ── Bottom footer bar ── */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: `1px solid ${DIVIDER}` }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/Logo png.png"
              alt="SUDARSHAN"
              className="w-7 h-7 object-contain rounded-full opacity-80"
            />
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[14px]" style={{ color: '#F0EEE8' }}>
                SUDARSHAN
              </span>
              <span
                className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ color: GOLD, border: `1px solid rgba(201,154,85,0.25)`, background: 'rgba(201,154,85,0.07)' }}
              >
                SIH26162
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {[['Home','hero'],['Services','services'],['About','about'],['Impact','impact'],['Team','team'],['Contact','contact']].map(([label, id]) => (
              <button
                key={id}
                onClick={() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}
                className="font-sans text-[11.5px] cursor-pointer transition-colors"
                style={{ color: TEXT_MUTED }}
                onMouseOver={e => (e.currentTarget.style.color = '#F0EEE8')}
                onMouseOut={e => (e.currentTarget.style.color = TEXT_MUTED)}
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
