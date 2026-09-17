import React from 'react'
import { BookOpen, Landmark } from 'lucide-react'

const mentors = [
  {
    name: 'Dr. Mahendrasinh Gadhavi',
    designation: 'Assistant Professor',
    department: 'Department of Civil Engineering',
    institution: 'L. D. College of Engineering, Ahmedabad',
    initials: 'MG',
  },
  {
    name: 'Dr. M. M. Shaikh',
    designation: 'Assistant Professor',
    department: 'Civil Engineering Department',
    institution: 'L. D. College of Engineering, Ahmedabad',
    initials: 'MS',
  },
]

export default function LandingMentors() {
  return (
    <section
      id="mentors"
      className="pt-24 pb-24 md:pt-32 md:pb-32"
      style={{ background: '#EDEBE3', borderTop: '1px solid #D9D8D2' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span
              className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-3"
              style={{ color: '#315E4A' }}
            >
              Academic Guidance
            </span>
            <h2
              className="font-serif font-bold text-[1.9rem] sm:text-[2.1rem] leading-[1.2] tracking-tight"
              style={{ color: '#173042' }}
            >
              Our Mentors
            </h2>
          </div>
          <p
            className="font-sans text-[13px] leading-relaxed max-w-xs sm:text-right"
            style={{ color: '#667277' }}
          >
            Distinguished faculty providing institutional guidance and scientific direction.
          </p>
        </div>

        {/* ── Two mentors side by side ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x md:divide-[#D9D8D2]">
          {mentors.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-5 py-8 ${i > 0 ? 'md:pl-10' : 'md:pr-10'}`}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#173042' }}
              >
                <span className="font-serif font-bold text-[14px] text-white select-none">
                  {m.initials}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-serif font-bold text-[15.5px] leading-snug mb-0.5"
                  style={{ color: '#173042' }}
                >
                  {m.name}
                </h3>
                <p
                  className="font-sans font-semibold text-[12px] mb-3"
                  style={{ color: '#315E4A' }}
                >
                  {m.designation}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <BookOpen
                      className="w-3.5 h-3.5 shrink-0 mt-[1px]"
                      style={{ color: '#B0AEA8' }}
                    />
                    <span className="font-sans text-[12px]" style={{ color: '#34434A' }}>
                      {m.department}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Landmark
                      className="w-3.5 h-3.5 shrink-0 mt-[1px]"
                      style={{ color: '#C99A55' }}
                    />
                    <span className="font-sans font-semibold text-[12px]" style={{ color: '#173042' }}>
                      {m.institution}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
