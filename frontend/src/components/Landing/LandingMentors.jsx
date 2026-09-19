import React from 'react'
import { BookOpen, Landmark } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

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
  const sectionRef = useScrollReveal({ threshold: 0.05 })

  return (
    <section
      id="mentors"
      ref={sectionRef}
      className="pt-20 pb-24 md:pt-28 md:pb-32"
      style={{ background: '#EDEBE3', borderTop: '1px solid #D9D8D2' }}
    >
      <div className="landing-container">

        {/* Header */}
        <div className="reveal mb-14">
          <h2
            className="font-serif font-bold text-[1.9rem] sm:text-[2.1rem] leading-[1.2] tracking-tight"
            style={{ color: '#173042' }}
          >
            Our Mentors
          </h2>
        </div>

        {/* Two mentor cards — elevated, hover lift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((m, i) => (
            <div
              key={i}
              className={`reveal reveal-d${i + 1} landing-card bg-white rounded-xl border border-[#D9D8D2] hover:border-[#173042]/30 p-7 flex items-start gap-6 shadow-sm cursor-default`}
            >
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-md"
                style={{ backgroundColor: '#173042' }}
              >
                <span className="font-serif font-bold text-[15px] text-white select-none">
                  {m.initials}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-serif font-bold text-[16px] leading-snug mb-1"
                  style={{ color: '#173042' }}
                >
                  {m.name}
                </h3>
                <p
                  className="font-sans font-semibold text-[12px] mb-4"
                  style={{ color: '#315E4A' }}
                >
                  {m.designation}
                </p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <BookOpen
                      className="w-3.5 h-3.5 shrink-0 mt-[2px]"
                      style={{ color: '#B0AEA8' }}
                    />
                    <span className="font-sans text-[12px]" style={{ color: '#34434A' }}>
                      {m.department}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Landmark
                      className="w-3.5 h-3.5 shrink-0 mt-[2px]"
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
