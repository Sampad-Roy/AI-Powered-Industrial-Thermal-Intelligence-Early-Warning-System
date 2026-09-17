import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import LandingPage from './components/Landing/LandingPage'
import AuthPage from './components/Auth/AuthPage'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import KPIBar from './components/KPI/KPIBar'
import FilterToolbar from './components/Filters/FilterToolbar'
import GisMap from './components/Map/GisMap'
import EventPanel from './components/EventPanel/EventPanel'
import EventTable from './components/EventTable/EventTable'
import PredictionModal from './components/Prediction/PredictionModal'
import AnalyticsView from './components/Analytics/AnalyticsView'
import InvestigationView from './components/Investigation/InvestigationView'
import SystemHealthView from './components/Health/SystemHealthView'
import AlertResponseView from './components/Alerts/AlertResponseView'
import { AlertTriangle, RefreshCw, Satellite } from 'lucide-react'

function MainContent() {
  const { loading, error, refreshEvents, activeView } = useApp()

  if (loading) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center bg-[#070b14] text-cyan-400 select-none p-6">
        <div className="relative flex items-center justify-center w-20 h-20 mb-4">
          <img
            src="/Logo png.png"
            alt="SUDARSHAN Logo"
            className="w-16 h-16 object-contain animate-pulse drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
          />
        </div>
        <h3 className="font-heading font-bold text-lg text-slate-100 tracking-wider">
          INITIALIZING SUDARSHAN SATELLITE COMMAND CENTER
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Connecting to FastAPI Gateway &amp; Loading VIIRS Thermal Events Catalog...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center bg-[#070b14] text-slate-200 select-none p-6">
        <div className="p-4 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-bold text-lg text-rose-200 tracking-wider">
          API GATEWAY CONNECTION ERROR
        </h3>
        <p className="text-xs text-slate-400 font-mono max-w-md text-center mt-2 mb-4">
          {error}
        </p>
        <p className="text-[11px] text-slate-500 font-mono mb-4">
          Ensure the FastAPI server is running: <code className="text-cyan-400">python api_server.py</code>
        </p>
        <button
          onClick={refreshEvents}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 font-semibold rounded text-xs border border-cyan-700 transition-all font-mono cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RETRY CONNECTION</span>
        </button>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 w-full bg-[#070c18] relative">
      {activeView === 'dashboard' && (
        <div className="flex-1 flex flex-col w-full min-w-0">
          <FilterToolbar />
          <div className="p-4 md:p-6 space-y-6 w-full max-w-full">
            {/* GIS Centerpiece Map */}
            <section className="w-full">
              <GisMap />
            </section>

            {/* Event Catalog & Intelligence Section */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
              <div className="xl:col-span-7 w-full min-w-0">
                <EventTable />
              </div>
              <div className="xl:col-span-5 w-full min-w-0">
                <EventPanel />
              </div>
            </section>
          </div>
        </div>
      )}

      {activeView === 'alerts' && <AlertResponseView />}

      {activeView === 'analytics' && <AnalyticsView />}

      {activeView === 'investigation' && <InvestigationView />}

      {activeView === 'health' && <SystemHealthView />}
    </main>
  )
}

function AppRoot() {
  const { activeView, setActiveView, isAuthenticated, login } = useApp()

  // ── Unauthenticated user trying to access a protected view ──
  // Push /auth into URL and show AuthPage
  if (!isAuthenticated && activeView !== 'landing' && activeView !== 'auth') {
    if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
      window.history.replaceState({}, '', '/auth')
    }
    return (
      <AuthPage
        onAuthSuccess={(userData) => login(userData)}
        onBackToHome={() => {
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/')
          }
          setActiveView('landing')
        }}
      />
    )
  }

  // ── Explicit auth view ──
  if (activeView === 'auth') {
    return (
      <AuthPage
        onAuthSuccess={(userData) => login(userData)}
        onBackToHome={() => {
          if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/')
          }
          setActiveView('landing')
        }}
      />
    )
  }

  // ── Landing page ──
  if (activeView === 'landing') {
    return (
      <LandingPage
        onLaunchDashboard={() => {
          if (isAuthenticated) {
            if (window.location.pathname !== '/dashboard') {
              window.history.pushState({}, '', '/dashboard')
            }
            setActiveView('dashboard')
          } else {
            if (window.location.pathname !== '/auth') {
              window.history.pushState({}, '', '/auth')
            }
            setActiveView('auth')
          }
        }}
        onNavigateAuth={() => {
          if (window.location.pathname !== '/auth') {
            window.history.pushState({}, '', '/auth')
          }
          setActiveView('auth')
        }}
      />
    )
  }

  // ── Dashboard (and all sub-views: alerts / analytics / investigation / health) ──
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-[#070b14] text-slate-100">
      <Header />
      <KPIBar />
      <div className="flex-1 flex flex-col md:flex-row w-full min-w-0">
        <Sidebar />
        <MainContent />
      </div>
      <PredictionModal />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  )
}
