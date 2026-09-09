import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
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
import { AlertTriangle, RefreshCw, Satellite } from 'lucide-react'

function MainContent() {
  const { loading, error, refreshEvents, activeView } = useApp()

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070b14] text-cyan-400 select-none p-6">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <Satellite className="w-10 h-10 text-cyan-400 animate-pulse" />
          <div className="absolute inset-0 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
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
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070b14] text-slate-200 select-none p-6">
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
          className="flex items-center gap-2 px-4 py-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 font-semibold rounded text-xs border border-cyan-700 transition-all font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RETRY CONNECTION</span>
        </button>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#070c18] relative">
      {activeView === 'dashboard' && (
        <>
          <FilterToolbar />
          <div className="flex-1 flex overflow-hidden relative">
            {/* GIS Centerpiece Map */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <div className="flex-1 relative">
                <GisMap />
              </div>
              <EventTable />
            </div>

            {/* Right Event Intelligence Panel */}
            <EventPanel />
          </div>
        </>
      )}

      {activeView === 'analytics' && <AnalyticsView />}

      {activeView === 'investigation' && <InvestigationView />}

      {activeView === 'health' && <SystemHealthView />}
    </main>
  )
}

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100">
        <Header />
        <KPIBar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
        <PredictionModal />
      </div>
    </AppProvider>
  )
}
