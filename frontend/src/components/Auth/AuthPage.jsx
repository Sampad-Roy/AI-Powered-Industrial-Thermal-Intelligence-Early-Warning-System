import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'

/* ─────────────────────────────────────────────
   SUDARSHAN Auth Page
   Tab-based Sign In / Sign Up  •  Dark-navy card
   Preserves all validation + callback logic
───────────────────────────────────────────── */
export default function AuthPage({ onBackToHome, onAuthSuccess }) {
  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState('signin')

  /* ── Sign-in fields ── */
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siKeep, setSiKeep] = useState(false)
  const [siShowPw, setSiShowPw] = useState(false)
  const [siErrors, setSiErrors] = useState({})
  const [siSuccess, setSiSuccess] = useState('')

  /* ── Sign-up fields ── */
  const [suUsername, setSuUsername] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suRepeat, setSuRepeat] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suShowPw, setSuShowPw] = useState(false)
  const [suShowRe, setSuShowRe] = useState(false)
  const [suErrors, setSuErrors] = useState({})
  const [suSuccess, setSuSuccess] = useState('')

  /* ── Switch tab helper ── */
  const switchTab = (tab) => {
    setActiveTab(tab)
    setSiErrors({})
    setSiSuccess('')
    setSuErrors({})
    setSuSuccess('')
  }

  /* ── Sign-in validation ── */
  const validateSignIn = () => {
    const errs = {}
    if (!siEmail.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siEmail.trim())) {
      errs.email = 'Enter a valid email address.'
    }
    if (!siPassword) {
      errs.password = 'Password is required.'
    } else if (siPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters.'
    }
    setSiErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── Sign-up validation ── */
  const validateSignUp = () => {
    const errs = {}
    if (!suUsername.trim()) errs.username = 'Username is required.'
    if (!suPassword) {
      errs.password = 'Password is required.'
    } else if (suPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters.'
    }
    if (!suRepeat) {
      errs.repeat = 'Please repeat your password.'
    } else if (suRepeat !== suPassword) {
      errs.repeat = 'Passwords do not match.'
    }
    if (!suEmail.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail.trim())) {
      errs.email = 'Enter a valid email address.'
    }
    setSuErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── Submit handlers ── */
  const handleSignIn = (e) => {
    e.preventDefault()
    if (!validateSignIn()) return
    setSiSuccess('Authenticating…')
    if (onAuthSuccess) {
      setTimeout(() => onAuthSuccess({ email: siEmail }), 500)
    }
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    if (!validateSignUp()) return
    setSuSuccess('Account created! Directing to dashboard…')
    if (onAuthSuccess) {
      setTimeout(() => onAuthSuccess({ fullName: suUsername, email: suEmail }), 500)
    }
  }

  /* ── Shared input class builder ── */
  const inputCls = (hasErr) =>
    `w-full bg-[#1a2a40] border ${
      hasErr ? 'border-red-500/70' : 'border-[#2e4a6a]'
    } text-slate-100 placeholder-slate-400 rounded-lg px-4 py-2.5 text-[13.5px] font-sans
     focus:outline-none focus:border-[#3b82f6] focus:bg-[#1e3356] transition-all duration-200`

  return (
    /* ── Page wrapper ── */
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: 'radial-gradient(ellipse 120% 90% at 50% 0%, #0d2137 0%, #071422 55%, #040d17 100%)',
      }}
    >
      {/* ── Back-to-home link ── */}
      {onBackToHome && (
        <div className="w-full max-w-[420px] mb-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
        </div>
      )}

      {/* ── Auth card ── */}
      <div
        className="w-full max-w-[420px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f2133 0%, #0a1827 50%, #071220 100%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.12)',
        }}
      >
        {/* ── Brand ── */}
        <div className="flex flex-col items-center pt-8 pb-5 px-8">
          <div className="w-16 h-16 rounded-full bg-[#132033] border border-[#2e4a6a] flex items-center justify-center mb-3 shadow-lg">
            <img
              src="/Logo png.png"
              alt="SUDARSHAN"
              className="w-11 h-11 object-contain rounded-full"
            />
          </div>
          <h1 className="font-serif font-bold text-[22px] text-white tracking-tight leading-none">
            SUDARSHAN
          </h1>
          <p className="text-[11px] font-mono text-slate-400 mt-1 tracking-widest uppercase">
            Satellite Intelligence Portal
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="mx-6 mb-0">
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ background: '#0a1827', border: '1px solid #1e3556' }}
          >
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`flex-1 py-2.5 text-[13px] font-sans font-bold tracking-wide transition-all duration-250 cursor-pointer rounded-xl ${
                activeTab === 'signin'
                  ? 'bg-[#1d4ed8] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2.5 text-[13px] font-sans font-bold tracking-wide transition-all duration-250 cursor-pointer rounded-xl ${
                activeTab === 'signup'
                  ? 'bg-[#1d4ed8] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* ── Forms container ── */}
        <div className="px-6 pt-5 pb-7">

          {/* ════ SIGN IN FORM ════ */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} noValidate className="space-y-4">

              {/* Success banner */}
              {siSuccess && (
                <div className="rounded-lg bg-[#1a3a1a] border border-emerald-700/50 px-4 py-2.5 text-[12px] text-emerald-300 font-sans">
                  {siSuccess}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-[11.5px] font-sans font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                >
                  Username / Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="officer@gidc.gov.in"
                  value={siEmail}
                  onChange={(e) => {
                    setSiEmail(e.target.value)
                    if (siErrors.email) setSiErrors((p) => { const n={...p}; delete n.email; return n })
                  }}
                  className={inputCls(!!siErrors.email)}
                />
                {siErrors.email && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400 font-sans">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {siErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-[11.5px] font-sans font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={siShowPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={siPassword}
                    onChange={(e) => {
                      setSiPassword(e.target.value)
                      if (siErrors.password) setSiErrors((p) => { const n={...p}; delete n.password; return n })
                    }}
                    className={`${inputCls(!!siErrors.password)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setSiShowPw(!siShowPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    aria-label={siShowPw ? 'Hide password' : 'Show password'}
                  >
                    {siShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {siErrors.password && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400 font-sans">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {siErrors.password}
                  </p>
                )}
              </div>

              {/* Keep signed in */}
              <div className="flex items-center gap-2.5">
                <input
                  id="signin-keep"
                  type="checkbox"
                  checked={siKeep}
                  onChange={(e) => setSiKeep(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2e4a6a] bg-[#1a2a40] accent-[#1d4ed8] cursor-pointer"
                />
                <label htmlFor="signin-keep" className="text-[12.5px] font-sans text-slate-400 cursor-pointer select-none">
                  Keep me Signed in
                </label>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-sans font-bold text-[14px] text-white transition-all duration-200 cursor-pointer active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  boxShadow: '0 4px 18px rgba(29,78,216,0.4)',
                }}
              >
                Sign In
              </button>

              {/* Forgot password */}
              <p className="text-center text-[12px] text-slate-400 font-sans">
                <button
                  type="button"
                  className="hover:text-slate-200 transition-colors cursor-pointer underline underline-offset-2"
                >
                  Forgot Password?
                </button>
              </p>
            </form>
          )}

          {/* ════ SIGN UP FORM ════ */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} noValidate className="space-y-3.5">

              {/* Success banner */}
              {suSuccess && (
                <div className="rounded-lg bg-[#1a3a1a] border border-emerald-700/50 px-4 py-2.5 text-[12px] text-emerald-300 font-sans">
                  {suSuccess}
                </div>
              )}

              {/* Username */}
              <div>
                <label
                  htmlFor="signup-username"
                  className="block text-[11.5px] font-sans font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                >
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Dr. Rajesh Sharma"
                  value={suUsername}
                  onChange={(e) => {
                    setSuUsername(e.target.value)
                    if (suErrors.username) setSuErrors((p) => { const n={...p}; delete n.username; return n })
                  }}
                  className={inputCls(!!suErrors.username)}
                />
                {suErrors.username && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400 font-sans">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {suErrors.username}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-[11.5px] font-sans font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={suShowPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={suPassword}
                    onChange={(e) => {
                      setSuPassword(e.target.value)
                      if (suErrors.password) setSuErrors((p) => { const n={...p}; delete n.password; return n })
                    }}
                    className={`${inputCls(!!suErrors.password)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setSuShowPw(!suShowPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    aria-label={suShowPw ? 'Hide password' : 'Show password'}
                  >
                    {suShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {suErrors.password && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400 font-sans">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {suErrors.password}
                  </p>
                )}
              </div>

              {/* Repeat password */}
              <div>
                <label
                  htmlFor="signup-repeat-password"
                  className="block text-[11.5px] font-sans font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                >
                  Repeat Password
                </label>
                <div className="relative">
                  <input
                    id="signup-repeat-password"
                    type={suShowRe ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={suRepeat}
                    onChange={(e) => {
                      setSuRepeat(e.target.value)
                      if (suErrors.repeat) setSuErrors((p) => { const n={...p}; delete n.repeat; return n })
                    }}
                    className={`${inputCls(!!suErrors.repeat)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setSuShowRe(!suShowRe)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    aria-label={suShowRe ? 'Hide repeat password' : 'Show repeat password'}
                  >
                    {suShowRe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {suErrors.repeat && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400 font-sans">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {suErrors.repeat}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-[11.5px] font-sans font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="officer@gidc.gov.in"
                  value={suEmail}
                  onChange={(e) => {
                    setSuEmail(e.target.value)
                    if (suErrors.email) setSuErrors((p) => { const n={...p}; delete n.email; return n })
                  }}
                  className={inputCls(!!suErrors.email)}
                />
                {suErrors.email && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400 font-sans">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {suErrors.email}
                  </p>
                )}
              </div>

              {/* Sign Up button */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-sans font-bold text-[14px] text-white transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    boxShadow: '0 4px 18px rgba(29,78,216,0.4)',
                  }}
                >
                  Sign Up
                </button>
              </div>

              {/* Already member */}
              <p className="text-center text-[12px] text-slate-400 font-sans">
                Already Member?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className="text-[#60a5fa] hover:text-[#93c5fd] font-semibold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── Footer note ── */}
      <p className="mt-6 text-[11px] font-sans text-slate-600">
        © 2026 Team SUDARSHAN • Smart India Hackathon
      </p>
    </div>
  )
}
