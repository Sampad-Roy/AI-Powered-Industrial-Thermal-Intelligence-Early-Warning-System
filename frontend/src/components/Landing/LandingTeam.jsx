import React from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const members = [
  { name: 'Sourav Kar',       role: 'Team Lead & RS/GIS Lead',                  initials: 'SK', color: '#173042' },
  { name: 'Sampad Roy',       role: 'AI/ML, Frontend & Backend Lead',            initials: 'SR', color: '#315E4A' },
  { name: 'Himel Biswas',     role: 'Dashboard & UI/UX Lead',                    initials: 'HB', color: '#294554' },
  { name: 'Neloy Chowdhury',  role: 'Backend + Frontend Integration Lead',       initials: 'NC', color: '#173042' },
  { name: 'Rittika Biswas',   role: 'Data & Validation Lead',                    initials: 'RB', color: '#315E4A' },
  { name: 'Boishakhi',        role: 'Research, QA & Documentation Lead',         initials: 'B',  color: '#294554' },
]

const delayClass = ['', 'reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4', 'reveal-d5']

export default function LandingTeam() {
  const sectionRef = useScrollReveal({ threshold: 0.05 })

  return (
    <section id="team" ref={sectionRef} className="py-24 md:py-32 bg-[#F5F3ED]">
      <div className="landing-container">

        {/* Section header */}
        <div className="reveal mb-14">
          <h2 className="font-serif font-bold text-[2rem] sm:text-[2.2rem] leading-[1.18] tracking-tight" style={{ color: '#173042' }}>
            Meet Team SUDARSHAN
          </h2>
        </div>

        {/* ── 6-member grid — full desktop width, 3 cols on md, 6 on xl ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {members.map((m, i) => (
            <div
              key={i}
              className={`reveal ${delayClass[i]} group flex flex-col p-5 rounded-xl bg-white border border-[#E8E6E0] hover:border-[#C5C3BE] hover:shadow-md transition-all duration-250 cursor-default`}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shrink-0 group-hover:scale-105 transition-transform duration-250 shadow-sm"
                style={{ backgroundColor: m.color }}
              >
                <span className="font-serif font-bold text-[13px] text-white select-none">
                  {m.initials}
                </span>
              </div>

              {/* Accent rule */}
              <div className="w-6 h-[2px] mb-3 rounded-full" style={{ backgroundColor: m.color, opacity: 0.35 }} />

              {/* Name */}
              <h3
                className="font-serif font-bold text-[13.5px] leading-snug mb-1.5"
                style={{ color: '#173042' }}
              >
                {m.name}
              </h3>

              {/* Role */}
              <p
                className="font-sans text-[11.5px] leading-relaxed"
                style={{ color: '#667277' }}
              >
                {m.role}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
