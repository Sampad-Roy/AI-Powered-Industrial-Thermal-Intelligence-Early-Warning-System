import React, { useState } from 'react'
import { ArrowRight, Play, CheckCircle2, X, Satellite } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function LandingHero({ onLaunchDashboard, onNavigateAuth }) {
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { setActiveView } = useApp()

  const handleExplore = () => {
    if (onNavigateAuth) {
      onNavigateAuth()
    } else {
      if (window.location.pathname !== '/auth') {
        window.history.pushState({}, '', '/auth')
      }
      setActiveView('auth')
    }
  }

  const handleLaunch = () => {
    setLoginModalOpen(false)
    setVideoModalOpen(false)
    if (onLaunchDashboard) onLaunchDashboard()
    else setActiveView('dashboard')
  }

  return (
    <>
      {/* ── CINEMATIC FULL-WIDTH HERO ── */}
      <section
        id="hero"
        className="relative w-full overflow-hidden flex items-center"
        style={{ minHeight: 'min(92vh, 900px)' }}
      >
        {/* Background with subtle Ken Burns / slow zoom */}
        <div
          className="absolute inset-0 hero-bg-zoom"
          style={{
            backgroundImage: 'url(/landing_hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            backgroundRepeat: 'no-repeat',
          }}
          aria-hidden="true"
        />

        {/* Layered overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e1c27]/52 via-[#0e1c27]/62 to-[#0e1c27]/84 pointer-events-none" />
        {/* Warm bottom vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(14,28,39,0.45),transparent)] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 landing-container py-24 md:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-16">

            {/* Left Column */}
            <div className="max-w-2xl flex-1">

              {/* Eyebrow */}
              <div className="hero-fade-up hero-fade-up-1 inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#C99A55] animate-pulse shrink-0" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#EDEBE3] uppercase">
                  Satellite Intelligence for a Safer Tomorrow
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="hero-fade-up hero-fade-up-2 font-serif font-bold text-[2.1rem] sm:text-[2.75rem] md:text-[3.5rem] leading-[1.1] text-white tracking-tight mb-6">
                AI-Powered Industrial<br />
                Thermal Intelligence &<br />
                <span className="text-[#C99A55]">Early Warning System</span>
              </h1>

              {/* Description */}
              <p className="hero-fade-up hero-fade-up-3 font-sans text-[1.05rem] sm:text-[1.12rem] text-slate-200/88 leading-[1.78] mb-9 max-w-[520px]">
                Transforming satellite thermal data into actionable insights to detect, monitor, and prevent industrial risks — for a safer, cleaner and more sustainable tomorrow.
              </p>

              {/* Mobile CTA (< lg) */}
              <div className="hero-fade-up hero-fade-up-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 lg:hidden">
                <button
                  onClick={handleExplore}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-sans font-bold text-[15px] text-white bg-[#315E4A] hover:bg-[#3F7358] border border-[#C99A55]/40 transition-all duration-200 shadow-xl flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#EDEBE3]" />
                </button>

                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl font-sans font-semibold text-[13.5px] text-white/90 hover:text-white bg-white/10 hover:bg-white/18 border border-white/25 hover:border-white/50 transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span>Watch Video</span>
                </button>
              </div>

              {/* Feature highlights */}
              <div className="hero-fade-up hero-fade-up-5 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] font-sans text-slate-300/90 border-t border-white/15 pt-7">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A55] shrink-0" />
                  <span className="font-semibold text-slate-100">NASA FIRMS VIIRS 375m Telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A55] shrink-0" />
                  <span className="font-semibold text-slate-100">TreeSHAP Explainable AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C99A55] shrink-0" />
                  <span className="font-semibold text-slate-100">Industrial Safety Intelligence</span>
                </div>
              </div>
            </div>

            {/* Right Column: Explore Now + Watch Video, desktop only */}
            <div className="hidden lg:flex flex-col items-end justify-center gap-5 shrink-0">
              {/* Primary CTA */}
              <button
                onClick={handleExplore}
                className="hero-fade-up hero-fade-up-3 px-10 py-5 rounded-2xl font-sans font-bold text-[16px] text-white bg-[#315E4A] hover:bg-[#3F7358] border border-[#C99A55]/50 hover:border-[#C99A55] transition-all duration-300 shadow-2xl shadow-black/50 hover:shadow-black/70 hover:-translate-y-1 flex items-center gap-3.5 cursor-pointer group whitespace-nowrap"
              >
                <span className="tracking-wide">Explore Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform text-[#EDEBE3]" />
              </button>

              {/* Watch Video — directly below, prominent */}
              <button
                onClick={() => setVideoModalOpen(true)}
                className="hero-fade-up hero-fade-up-4 flex items-center gap-3.5 px-8 py-4 rounded-xl font-sans font-semibold text-[14.5px] text-white/88 hover:text-white bg-white/9 hover:bg-white/17 border border-white/24 hover:border-white/48 backdrop-blur-sm transition-all duration-250 cursor-pointer group hover:scale-[1.02] whitespace-nowrap"
              >
                <div className="w-9 h-9 rounded-full border border-white/32 bg-white/14 flex items-center justify-center group-hover:border-white/56 group-hover:bg-white/24 transition-all duration-250 shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <span>Watch Video Walkthrough</span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0e1c27]/55 to-transparent pointer-events-none" />
      </section>

      {/* ── VIDEO MODAL ── */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0e1c27]/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#D9D8D2] shadow-2xl max-w-2xl w-full p-6 text-[#34434A] relative">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 text-[#667277] hover:text-[#173042] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#315E4A]">
                SUDARSHAN System Walkthrough
              </span>
              <h3 className="font-serif font-bold text-xl text-[#173042] mt-1">
                Thermal Intelligence Pipeline Demonstration
              </h3>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#D9D8D2] bg-[#173042] aspect-video relative flex flex-col items-center justify-center text-center p-6 text-white">
              <img
                src="/landing_hero.jpg"
                alt="System Video Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 space-y-3 max-w-md">
                <div className="w-14 h-14 rounded-full bg-[#315E4A] flex items-center justify-center mx-auto shadow-lg">
                  <Play className="w-6 h-6 fill-white ml-1 text-white" />
                </div>
                <h4 className="font-serif font-bold text-lg">End-to-End Early Warning Architecture</h4>
                <p className="text-xs font-sans text-slate-200 leading-relaxed">
                  Interactive demonstration showcasing NASA FIRMS ingestion, XGBoost multi-class hazard inference, and TreeSHAP feature attributions.
                </p>
                <button
                  onClick={handleLaunch}
                  className="px-5 py-2 rounded-lg bg-white text-[#173042] font-sans font-bold text-xs hover:bg-[#EDEBE3] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Launch Live Interactive System</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-[#667277]">
              <span>SUDARSHAN • AI-Powered Industrial Thermal Intelligence</span>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="font-semibold text-[#173042] hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGIN MODAL (kept, but unused — handleExplore navigates directly) ── */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0e1c27]/65 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#D9D8D2] shadow-2xl max-w-sm w-full p-7 text-[#34434A] relative">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 text-[#667277] hover:text-[#173042] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mb-5">
              <div className="p-2.5 rounded-xl bg-[#F5F3ED] border border-[#D9D8D2] shrink-0">
                <Satellite className="w-5 h-5 text-[#315E4A]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[17px] text-[#173042] leading-tight">
                  Institutional Portal
                </h3>
                <p className="text-[11px] font-sans text-[#667277] mt-0.5">
                  Authorized GIDC / DISH / SPCB Officer Access
                </p>
              </div>
            </div>

            <p className="text-[12px] font-sans leading-relaxed text-[#34434A] mb-5 bg-[#F5F3ED] p-3.5 rounded-xl border border-[#D9D8D2]">
              The public demonstrator operates in open surveillance mode. Enter the live intelligence system directly.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-sans font-semibold text-[#173042] mb-1">Officer ID / Email</label>
                <input type="text" defaultValue="officer@gidc.gov.in" disabled className="w-full px-3 py-2 text-[12px] font-mono bg-[#F5F3ED] border border-[#D9D8D2] rounded-lg text-[#34434A]" />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-semibold text-[#173042] mb-1">Access Key</label>
                <input type="password" defaultValue="••••••••••••" disabled className="w-full px-3 py-2 text-[12px] font-mono bg-[#F5F3ED] border border-[#D9D8D2] rounded-lg text-[#34434A]" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setLoginModalOpen(false)} className="px-4 py-2 text-[12px] font-sans font-semibold text-[#667277] hover:text-[#173042] cursor-pointer">Cancel</button>
              <button onClick={handleLaunch} className="px-5 py-2 text-[12px] font-sans font-bold text-white bg-[#173042] hover:bg-[#315E4A] rounded-lg transition-all shadow-sm cursor-pointer">Enter Live System →</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
