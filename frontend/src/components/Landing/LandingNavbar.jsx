import React, { useState, useEffect } from 'react'
import { Menu, X, LogIn, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function LandingNavbar({ onLaunchDashboard, onNavigateAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { setActiveView } = useApp()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLoginClick = () => {
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
    if (onLaunchDashboard) onLaunchDashboard()
    else setActiveView('dashboard')
  }

  const navLinks = [
    { label: 'Home', target: 'hero' },
    { label: 'Services', target: 'services' },
    { label: 'About', target: 'about' },
    { label: 'Impact', target: 'impact' },
    { label: 'Team', target: 'team' },
    { label: 'Contact', target: 'contact' },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/98 shadow-sm border-b border-[#D9D8D2]'
            : 'bg-[#F5F3ED]/95 border-b border-[#D9D8D2]'
        } backdrop-blur-md`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-[68px]">

            {/* Brand */}
            <button
              onClick={() => scrollTo('hero')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <img
                src="/Logo png.png"
                alt="SUDARSHAN"
                className="w-9 h-9 object-contain rounded-full group-hover:opacity-90 transition-opacity"
              />
              <span className="font-serif font-bold text-[18px] text-[#173042] tracking-tight">
                SUDARSHAN
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  onClick={() => scrollTo(link.target)}
                  className="text-[13px] font-sans font-semibold text-[#34434A] hover:text-[#173042] transition-colors relative py-1 group cursor-pointer"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#315E4A] group-hover:w-full transition-all duration-200" />
                </button>
              ))}
            </nav>

            {/* Right: Login */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 text-[12px] font-sans font-semibold text-[#173042] hover:text-[#315E4A] rounded-lg border border-[#D9D8D2] hover:border-[#173042] bg-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={handleLoginClick}
                className="px-3 py-1.5 text-[11px] font-sans font-bold text-[#173042] rounded-lg border border-[#D9D8D2] bg-white cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#173042] hover:bg-[#EDEBE3] transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#D9D8D2] px-5 pt-3 pb-5 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-sans font-semibold text-[#173042] hover:bg-[#F5F3ED] transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#173042]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#D9D8D2] shadow-2xl max-w-sm w-full p-7 text-[#34434A] relative">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 text-[#667277] hover:text-[#173042] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mb-5">
              <div className="p-2.5 rounded-xl bg-[#F5F3ED] border border-[#D9D8D2] shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#315E4A]" />
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
              The public demonstrator operates in open surveillance mode for SIH evaluation. Enter the live intelligence system directly.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-sans font-semibold text-[#173042] mb-1">
                  Officer ID / Email
                </label>
                <input
                  type="text"
                  defaultValue="officer@gidc.gov.in"
                  disabled
                  className="w-full px-3 py-2 text-[12px] font-mono bg-[#F5F3ED] border border-[#D9D8D2] rounded-lg text-[#34434A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-sans font-semibold text-[#173042] mb-1">
                  Access Key
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  disabled
                  className="w-full px-3 py-2 text-[12px] font-mono bg-[#F5F3ED] border border-[#D9D8D2] rounded-lg text-[#34434A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setLoginModalOpen(false)}
                className="px-4 py-2 text-[12px] font-sans font-semibold text-[#667277] hover:text-[#173042] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunch}
                className="px-5 py-2 text-[12px] font-sans font-bold text-white bg-[#173042] hover:bg-[#315E4A] rounded-lg transition-all shadow-sm cursor-pointer"
              >
                Enter Live System →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
