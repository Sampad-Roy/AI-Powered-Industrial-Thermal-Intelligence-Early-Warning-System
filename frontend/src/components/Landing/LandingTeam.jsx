import React from 'react'

const members = [
  { name: 'Sourav Kar',        role: 'Team Lead & RS/GIS Lead',                  initials: 'SK', color: '#173042' },
  { name: 'Sampad Roy',        role: 'AI/ML, Frontend & Backend Lead',            initials: 'SR', color: '#315E4A' },
  { name: 'Himel Biswas',      role: 'Dashboard & UI/UX Lead',                   initials: 'HB', color: '#294554' },
  { name: 'Neloy Chowdhury',   role: 'Backend + Frontend Integration Lead',       initials: 'NC', color: '#173042' },
  { name: 'Rittika Biswas',    role: 'Data & Validation Lead',                   initials: 'RB', color: '#315E4A' },
  { name: 'Boishakhi',         role: 'Research, QA & Documentation Lead',        initials: 'B',  color: '#294554' },
]

export default function LandingTeam() {
  return (
    <section id="team" className="pt-36 pb-28 md:pt-44 md:pb-36 bg-[#F5F3ED]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* ── Two-column composition: heading left | members right ── */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16">

          {/* LEFT: heading block */}
          <div className="lg:w-56 xl:w-64 shrink-0">
            <span
              className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-4"
              style={{ color: '#315E4A' }}
            >
              The Innovators
            </span>
            <h2
              className="font-serif font-bold text-[1.9rem] sm:text-[2.1rem] leading-[1.2] tracking-tight mb-4"
              style={{ color: '#173042' }}
            >
              Meet Team<br />SUDARSHAN
            </h2>
            <p className="font-sans text-[13px] leading-relaxed" style={{ color: '#667277' }}>
              Multidisciplinary team bridging remote sensing, artificial intelligence, and industrial safety.
            </p>

            {/* Subtle accent rule */}
            <div
              className="mt-6 w-10 h-px"
              style={{ background: '#315E4A' }}
            />
          </div>

          {/* RIGHT: 6 members — 3×2 grid → single row on XL */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-x-6 gap-y-10">
            {members.map((m, i) => (
              <div key={i} className="flex flex-col items-start">

                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-3 shrink-0"
                  style={{ backgroundColor: m.color }}
                >
                  <span className="font-serif font-bold text-[13px] text-white select-none">
                    {m.initials}
                  </span>
                </div>

                {/* Name */}
                <h3
                  className="font-serif font-bold text-[13.5px] leading-snug mb-1"
                  style={{ color: '#173042' }}
                >
                  {m.name}
                </h3>

                {/* Role — keep it compact */}
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
      </div>
    </section>
  )
}
