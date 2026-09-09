import React, { useState, useEffect } from 'react'
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Server,
  ShieldCheck,
  Database,
  Layers,
  Zap,
  Globe,
  Radio,
  FileCode,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { fetchHealth } from '../../api/client'

export default function SystemHealthView() {
  const { apiHealth, events, refreshEvents } = useApp()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [latency, setLatency] = useState(null)

  const handlePingTest = async () => {
    setTesting(true)
    const start = performance.now()
    try {
      const res = await fetchHealth()
      const end = performance.now()
      setLatency(Math.round(end - start))
      setTestResult({
        ok: res && res.status === 'ok',
        data: res,
        timestamp: new Date().toLocaleTimeString(),
      })
    } catch (err) {
      setTestResult({
        ok: false,
        error: err.message,
        timestamp: new Date().toLocaleTimeString(),
      })
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    handlePingTest()
  }, [])

  const isHealthy = apiHealth && apiHealth.status === 'ok' && apiHealth.model_loaded

  return (
    <div className="flex-1 p-5 overflow-y-auto bg-[#040813] space-y-4 select-none">
      {/* Title Banner */}
      <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
              SYSTEM ARCHITECTURE &amp; GATEWAY TELEMETRY
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-sm flex items-center gap-1.5 ${
                isHealthy
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {isHealthy ? 'GATEWAY OPERATIONAL' : 'SYSTEM DEGRADED'}
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-slate-100 mt-1 flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            SUDARSHAN INFERENCE ENGINE &amp; MICROSERVICES
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingTest}
            disabled={testing}
            className="btn-primary-glow text-xs px-3.5 py-1.5 flex items-center gap-2 font-mono font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'PINGING GATEWAY...' : 'PING GATEWAY'}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. FastAPI Gateway */}
        <div className="p-3.5 rounded-xl bg-[#081020] border border-[#1a2b48] space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">FASTAPI GATEWAY</span>
            <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Globe className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="text-base font-heading font-bold text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {isHealthy ? 'Online (HTTP 200)' : 'Offline / Degraded'}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Target: <code className="text-cyan-300">http://127.0.0.1:8000</code>
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#142036] flex justify-between">
            <span>Ping Latency:</span>
            <span className="text-emerald-400 font-bold">{latency !== null ? `${latency} ms` : 'Testing...'}</span>
          </div>
        </div>

        {/* 2. XGBoost Multiclass Classifier */}
        <div className="p-3.5 rounded-xl bg-[#081020] border border-[#1a2b48] space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">ML INFERENCE ENGINE</span>
            <span className="p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
              <Cpu className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="text-base font-heading font-bold text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              XGBoost Multiclass
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              15 Features • 4 Hazard Classes
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#142036] flex justify-between">
            <span>Model Version:</span>
            <span className="text-indigo-300 font-bold">{apiHealth?.version || '1.0.0'}</span>
          </div>
        </div>

        {/* 3. TreeSHAP Explainer */}
        <div className="p-3.5 rounded-xl bg-[#081020] border border-[#1a2b48] space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">EXPLAINABLE AI (XAI)</span>
            <span className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800">
              <Zap className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="text-base font-heading font-bold text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              TreeSHAP Explainer
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Marginal Log-Odds Attributions
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#142036] flex justify-between">
            <span>SHAP Top-K:</span>
            <span className="text-amber-300 font-bold">Top 5 Features</span>
          </div>
        </div>

        {/* 4. Satellite Catalog Cache */}
        <div className="p-3.5 rounded-xl bg-[#081020] border border-[#1a2b48] space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">VIIRS EVENT CATALOG</span>
            <span className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-800">
              <Database className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="text-base font-heading font-bold text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {events.length} Hotspots Loaded
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Sanand • Vatva • Chhatral • Naroda
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#142036] flex justify-between">
            <span>Payload Cache:</span>
            <span className="text-blue-300 font-bold">Active in Memory</span>
          </div>
        </div>
      </div>

      {/* API Gateway Endpoints Matrix */}
      <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] space-y-3 shadow-lg">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          FASTAPI REST INTERFACE CONTRACT SPECIFICATION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* GET /health */}
          <div className="p-3 rounded-lg bg-[#050b17] border border-[#16233b] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                GET /health
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">200 OK</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-tight">
              Liveness check and ML bundle readiness status.
            </p>
            <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#142036]">
              Response: <code className="text-cyan-300">HealthResponse</code>
            </div>
          </div>

          {/* GET /events */}
          <div className="p-3 rounded-lg bg-[#050b17] border border-[#16233b] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                GET /events
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">200 OK</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-tight">
              Returns all 58 pre-scored VIIRS satellite events with SHAP &amp; risk factors.
            </p>
            <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#142036]">
              Response: <code className="text-cyan-300">List[EventRecord]</code>
            </div>
          </div>

          {/* POST /predict */}
          <div className="p-3 rounded-lg bg-[#050b17] border border-[#16233b] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                POST /predict
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">200 OK</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-tight">
              Executes real-time XGBoost inference, TreeSHAP attributions, and 5-factor risk scoring.
            </p>
            <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#142036]">
              Request: <code className="text-cyan-300">PredictRequest (15 feats)</code>
            </div>
          </div>
        </div>
      </div>

      {/* Live Gateway Diagnostics Console */}
      <div className="p-4 rounded-xl bg-[#081020] border border-[#1a2b48] space-y-2 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            LIVE GATEWAY DIAGNOSTICS LOG
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Last Ping: {testResult?.timestamp || 'Never'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#030712] border border-[#16233b] font-mono text-xs text-slate-300 overflow-x-auto">
          {testResult ? (
            <pre className="text-[11px] leading-relaxed text-cyan-300">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          ) : (
            <div className="text-slate-400">Press "PING GATEWAY" to perform a real-time connectivity audit.</div>
          )}
        </div>
      </div>
    </div>
  )
}
