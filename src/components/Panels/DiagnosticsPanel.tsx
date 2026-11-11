import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Shield,
  Zap,
  Thermometer,
  Wifi,
  Radio,
  Eye,
  Compass,
  Hand,
  Mic,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Move,
  Flame,
  Volume2,
} from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { speechEngine } from '../../lib/speech';
import { SystemHealthAlert } from '../../types';

export const DiagnosticsPanel: React.FC = () => {
  const { theme, mode, diagnostics, updateDiagnostics, setMode } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const [activeTab, setActiveTab] = useState<'health' | 'inputs'>('health');
  const [selectedGazeTarget, setSelectedGazeTarget] = useState<string>('core_1');
  const [headYaw, setHeadYaw] = useState<number>(0);
  const [headPitch, setHeadPitch] = useState<number>(0);
  const [isSimulatingThermal, setIsSimulatingThermal] = useState<boolean>(false);
  const [isSimulatingLatency, setIsSimulatingLatency] = useState<boolean>(false);

  // Automated Real-Time Telemetry Generator
  useEffect(() => {
    const interval = setInterval(() => {
      const newTemp = isSimulatingThermal
        ? Math.min(95, diagnostics.temperature + Math.random() * 4 + 1)
        : Math.min(85, Math.max(38, diagnostics.temperature + (Math.random() * 4 - 2)));

      const newLatency = isSimulatingLatency
        ? Math.min(180, Math.max(70, diagnostics.latencyMs + Math.random() * 15))
        : Math.min(48, Math.max(12, diagnostics.latencyMs + (Math.random() * 6 - 3)));

      const newCpu = Math.min(100, Math.max(15, diagnostics.cpuUsage + (Math.random() * 8 - 4)));
      const newRam = Math.min(100, Math.max(20, diagnostics.ramUsage + (Math.random() * 4 - 2)));
      const newGpu = Math.min(100, Math.max(30, diagnostics.gpuLoad + (Math.random() * 10 - 5)));

      // Automated alert generation when thresholds are crossed
      const newAlerts: SystemHealthAlert[] = [...diagnostics.healthAlerts];

      if (newTemp > 78 && !newAlerts.some((a) => a.message.includes('THERMAL CRITICAL'))) {
        newAlerts.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          level: 'alert',
          message: `THERMAL CRITICAL: Core temp reached ${Math.round(newTemp)}°C! Cooling initiated.`,
          source: 'Thermal',
        });
      } else if (newLatency > 80 && !newAlerts.some((a) => a.message.includes('LATENCY SPIKE'))) {
        newAlerts.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          level: 'warning',
          message: `LATENCY SPIKE: MCP bridge delay at ${Math.round(newLatency)}ms. Jitter elevated.`,
          source: 'Network',
        });
      } else if (Math.random() < 0.15) {
        // Routine automated nominal health log
        const routineMsgs = [
          `Gaze fixation lock confirmed on ${diagnostics.gazeFixation.targetName}.`,
          `Head gesture reticle panned to vector (AZ: ${headYaw}°, EL: ${headPitch}°).`,
          `Manual gesture pinch scale updated to ${(diagnostics.manualGesture.pinchScale * 100).toFixed(0)}%.`,
          `Voice integration tandem queue ready for combat protocols.`,
        ];
        const randomMsg = routineMsgs[Math.floor(Math.random() * routineMsgs.length)];
        newAlerts.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          level: 'optimal',
          message: randomMsg,
          source: randomMsg.includes('Gaze')
            ? 'Gaze'
            : randomMsg.includes('Head')
            ? 'Head'
            : randomMsg.includes('gesture')
            ? 'Gesture'
            : 'Voice',
        });
      }

      updateDiagnostics({
        cpuUsage: newCpu,
        ramUsage: newRam,
        gpuLoad: newGpu,
        temperature: newTemp,
        latencyMs: newLatency,
        latencyJitter: Math.min(12, Math.max(0.5, newLatency * 0.08)),
        healthAlerts: newAlerts.slice(0, 20),
        headGesture: {
          ...diagnostics.headGesture,
          yaw: headYaw,
          pitch: headPitch,
          reticleVector: `AZ: ${headYaw}° / EL: ${headPitch}°`,
          isPanning: Math.abs(headYaw) > 10 || Math.abs(headPitch) > 10,
        },
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [diagnostics, headYaw, headPitch, isSimulatingThermal, isSimulatingLatency]);

  const handleSimulateThermalSpike = () => {
    setIsSimulatingThermal(true);
    speechEngine.speak('Simulating thermal core overload.');
    setTimeout(() => {
      setIsSimulatingThermal(false);
      updateDiagnostics({ temperature: 48 });
      speechEngine.speak('Coolant injection successful. Core temperature nominal.');
    }, 4500);
  };

  const handleSimulateLatencySpike = () => {
    setIsSimulatingLatency(true);
    speechEngine.speak('Simulating high network latency jitter.');
    setTimeout(() => {
      setIsSimulatingLatency(false);
      updateDiagnostics({ latencyMs: 16 });
      speechEngine.speak('MCP sync link stabilized.');
    }, 4000);
  };

  const handleSelectGazeTarget = (id: string, name: string) => {
    setSelectedGazeTarget(id);
    updateDiagnostics({
      gazeFixation: {
        ...diagnostics.gazeFixation,
        targetId: id,
        targetName: name,
        isLocked: true,
      },
    });
    speechEngine.speak(`Eye gaze fixation locked on ${name}.`);
  };

  const gazeTargets = [
    { id: 'core_1', name: 'Arc Reactor Core', category: 'Energy' },
    { id: 'weapon_array', name: 'Repulsor Array Alpha', category: 'Combat' },
    { id: 'shield_matrix', name: 'Tactical Shield Grid', category: 'Defense' },
    { id: 'mcp_bridge', name: 'MCP Mobile Link', category: 'Telemetry' },
  ];

  return (
    <div
      className="flex flex-col h-[520px] w-full p-4 rounded-2xl border backdrop-blur-xl shadow-2xl relative overflow-hidden font-mono text-cyan-300"
      style={{
        backgroundColor: themeColors.bgGlass,
        borderColor: themeColors.borderGlow,
        boxShadow: `0 0 30px ${themeColors.glow}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 mb-3 border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h2 className="text-xs tracking-widest text-cyan-200 uppercase font-bold">
              SYSTEM DIAGNOSTICS & TELEMETRY
            </h2>
            <p className="text-[9px] text-cyan-400/70">
              AUTOMATED HEALTH ALERTS & CORE INPUT MATRIX
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] px-2 py-0.5 rounded border font-bold ${
              diagnostics.temperature > 75
                ? 'bg-red-950 text-red-300 border-red-500/50 animate-bounce'
                : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {diagnostics.temperature > 75 ? '⚠️ THERMAL WARNING' : '● SYSTEM NOMINAL'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3 bg-slate-950/70 p-1 rounded-xl border border-cyan-500/20 text-xs">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
            activeTab === 'health'
              ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'text-slate-400 hover:text-cyan-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>HEALTH & TELEMETRY</span>
        </button>
        <button
          onClick={() => setActiveTab('inputs')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
            activeTab === 'inputs'
              ? 'bg-purple-500/30 text-purple-100 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'text-slate-400 hover:text-purple-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>CORE INPUT METHODS</span>
        </button>
      </div>

      {/* Tab 1: Real-Time Health & Automated Alerts */}
      {activeTab === 'health' && (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 text-xs">
          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Temperature Metric */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                diagnostics.temperature > 75
                  ? 'bg-red-950/80 border-red-500/60 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-slate-900/80 border-cyan-500/20 text-cyan-200'
              }`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1 font-bold">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> TEMP
                </span>
                <span className="font-bold text-xs">{Math.round(diagnostics.temperature)}°C</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-cyan-500/20">
                <div
                  className={`h-full transition-all duration-500 ${
                    diagnostics.temperature > 75
                      ? 'bg-red-500 animate-pulse'
                      : diagnostics.temperature > 60
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, diagnostics.temperature)}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-400 mt-1">
                {diagnostics.temperature > 75 ? 'CRITICAL HEAT' : 'OPTIMAL COOLING'}
              </span>
            </div>

            {/* Latency Metric */}
            <div
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                diagnostics.latencyMs > 70
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                  : 'bg-slate-900/80 border-cyan-500/20 text-cyan-200'
              }`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1 font-bold">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" /> LATENCY
                </span>
                <span className="font-bold text-xs">{Math.round(diagnostics.latencyMs)}ms</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-cyan-500/20">
                <div
                  className={`h-full transition-all duration-500 ${
                    diagnostics.latencyMs > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, (diagnostics.latencyMs / 120) * 100)}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-400 mt-1">
                Jitter: {diagnostics.latencyJitter.toFixed(1)}ms
              </span>
            </div>

            {/* CPU Core */}
            <div className="p-2.5 rounded-xl border bg-slate-900/80 border-cyan-500/20 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU CORE
                </span>
                <span className="font-bold text-xs">{Math.round(diagnostics.cpuUsage)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-cyan-500/20">
                <div
                  className="bg-cyan-400 h-full transition-all duration-500"
                  style={{ width: `${diagnostics.cpuUsage}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-400 mt-1">Flux: {diagnostics.quantumFlux.toFixed(1)}%</span>
            </div>

            {/* GPU Render */}
            <div className="p-2.5 rounded-xl border bg-slate-900/80 border-cyan-500/20 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1 font-bold">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> GPU LOAD
                </span>
                <span className="font-bold text-xs">{Math.round(diagnostics.gpuLoad)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-cyan-500/20">
                <div
                  className="bg-purple-400 h-full transition-all duration-500"
                  style={{ width: `${diagnostics.gpuLoad}%` }}
                />
              </div>
              <span className="text-[8px] text-slate-400 mt-1">RAM: {Math.round(diagnostics.ramUsage)}%</span>
            </div>
          </div>

          {/* Interactive Diagnostic Test Controls */}
          <div className="flex gap-2 bg-slate-950/80 p-2 rounded-xl border border-cyan-500/20 items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">
              AUTOMATED DIAGNOSTIC SIMULATORS
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={handleSimulateThermalSpike}
                className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 text-[10px] rounded border border-red-500/40 font-bold flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>THERMAL OVERLOAD</span>
              </button>
              <button
                onClick={handleSimulateLatencySpike}
                className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-200 text-[10px] rounded border border-amber-500/40 font-bold flex items-center gap-1"
              >
                <Wifi className="w-3 h-3 text-amber-400" />
                <span>LATENCY JITTER</span>
              </button>
            </div>
          </div>

          {/* Automated Real-Time System Health Alerts Feed */}
          <div className="flex-1 bg-slate-950/90 rounded-xl border border-cyan-500/30 p-3 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-cyan-500/20">
              <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                AUTOMATED SYSTEM HEALTH ALERTS STREAM
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {diagnostics.healthAlerts.length} RECORDED EVENTS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
              {diagnostics.healthAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded border flex items-start justify-between gap-2 transition-all ${
                    alert.level === 'alert'
                      ? 'bg-red-950/70 border-red-500/50 text-red-200'
                      : alert.level === 'warning'
                      ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
                      : 'bg-slate-900/60 border-cyan-500/20 text-cyan-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.level === 'alert' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    ) : alert.level === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold opacity-75">[{alert.source.toUpperCase()}]</span>
                        <span>{alert.message}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 shrink-0">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Core Input Methods Showcase & Telemetry */}
      {activeTab === 'inputs' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {/* Method 1: Head Gestures */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                1. HEAD GESTURES (ROTATION & VECTOR TRACKING)
              </span>
              <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded">
                RETICLE PANNING ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Reticles and peripheral UI elements track head rotation to pan across virtual layouts or lock onto designated vectors.
            </p>
            <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2 rounded-lg border border-cyan-500/20 items-center">
              <div>
                <label className="text-[9px] text-slate-400 block mb-1">
                  HEAD YAW / PITCH ROTATION (PAN)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={headYaw}
                    onChange={(e) => setHeadYaw(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <span className="text-[10px] font-bold text-cyan-200 w-12">{headYaw}° YAW</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded border border-cyan-500/30 text-center font-mono text-[10px]">
                <span className="text-slate-400 block text-[8px]">RETICLE VECTOR</span>
                <strong className="text-emerald-400">AZ: {headYaw}° / EL: {headPitch}°</strong>
                <span className="block text-[8px] text-cyan-300/80 mt-0.5">
                  {Math.abs(headYaw) > 10 ? 'Panning Peripheral Layout...' : 'Locked on Core Center'}
                </span>
              </div>
            </div>
          </div>

          {/* Method 2: Eye Tracking (Gaze Fixation) */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-400 animate-pulse" />
                2. EYE TRACKING (GAZE FIXATION)
              </span>
              <span className="text-[9px] bg-purple-950 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded">
                GAZE LOCK: {diagnostics.gazeFixation.targetName}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Registers focal points to highlight specific targets, zoom into tactical elements, or cue contextual weapon selection via natural language.
            </p>

            {/* Target Fixation Grid */}
            <div className="grid grid-cols-2 gap-2">
              {gazeTargets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectGazeTarget(t.id, t.name)}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                    selectedGazeTarget === t.id
                      ? 'bg-purple-900/70 border-purple-400 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-900/60 border-purple-500/20 text-slate-300 hover:border-purple-400/50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[10px]">{t.name}</div>
                    <div className="text-[8px] text-purple-300/70">{t.category}</div>
                  </div>
                  {selectedGazeTarget === t.id && (
                    <Eye className="w-3.5 h-3.5 text-purple-300 animate-ping" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Method 3: Manual Gestures */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-200 flex items-center gap-1.5">
                <Hand className="w-4 h-4 text-cyan-400" />
                3. MANUAL GESTURES (PINCH, EXPAND & SWIPE)
              </span>
              <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded">
                IN-AIR CONTROLS
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              In-air pinches, expansions, and swipes manipulate holographic windows, spin diagnostic models, or scale tactical maps when hands are not engaged in flight stabilization or combat.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  updateDiagnostics({
                    manualGesture: {
                      ...diagnostics.manualGesture,
                      activeGesture: 'PINCH_WINDOW',
                      pinchScale: 0.7,
                    },
                  });
                  speechEngine.speak('In-air window pinch executed.');
                }}
                className="p-2 bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-center text-[10px] font-bold text-cyan-200 flex flex-col items-center gap-1"
              >
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>PINCH WINDOW</span>
              </button>

              <button
                onClick={() => {
                  updateDiagnostics({
                    manualGesture: {
                      ...diagnostics.manualGesture,
                      activeGesture: 'EXPAND_MAP',
                      mapScale: 2.0,
                    },
                  });
                  speechEngine.speak('Tactical map expanded.');
                }}
                className="p-2 bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-center text-[10px] font-bold text-cyan-200 flex flex-col items-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                <span>EXPAND MAP</span>
              </button>

              <button
                onClick={() => {
                  useUltronStore.getState().updateOrbPhysics({
                    rotation: [0, Math.PI, 0],
                  });
                  speechEngine.speak('Spinning holographic model.');
                }}
                className="p-2 bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-center text-[10px] font-bold text-cyan-200 flex flex-col items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>SPIN MODEL</span>
              </button>
            </div>
          </div>

          {/* Method 4: Voice Integration */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-200 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
                4. VOICE INTEGRATION (GAZE & VOICE TANDEM)
              </span>
              <span className="text-[9px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded">
                TANDEM SYNCED
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Natural language processing works in tandem with the visual gaze, allowing instantaneous execution of complex diagnostics or combat protocols.
            </p>

            <button
              onClick={() => {
                speechEngine.speak(`Executing full diagnostic scan on ${diagnostics.gazeFixation.targetName}.`);
                setMode('ACTIVE');
              }}
              className="w-full p-2.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/40 hover:border-emerald-400 rounded-xl flex items-center justify-center gap-2 font-mono font-bold text-emerald-200 text-xs"
            >
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>TRIGGER GAZE-TANDEM VOICE DIAGNOSTICS PROTOCOL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
