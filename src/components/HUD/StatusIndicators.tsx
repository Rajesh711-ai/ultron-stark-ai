import React, { useEffect, useState } from 'react';
import { Shield, Zap, Cpu, Gauge, Radio, Crosshair } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { UltronMode } from '../../types';

export const StatusIndicators: React.FC = () => {
  const {
    theme,
    mode,
    setMode,
    energyLevel,
    diagnostics,
    lastDetectedGesture,
    gestureConfidence,
    isTargetLocked,
  } = useUltronStore();

  const themeColors = THEME_PRESETS[theme];
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const checkFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(checkFps);
    };

    const animId = requestAnimationFrame(checkFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const modes: UltronMode[] = [
    'ACTIVE',
    'STANDBY',
    'SCANNING',
    'CHARGING',
    'ATTACK',
    'SLEEP',
  ];

  return (
    <div className="pointer-events-none flex flex-col justify-between h-full p-4 font-mono text-xs">
      {/* Top Left Status Module */}
      <div className="flex items-start justify-between">
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl flex flex-col gap-2 min-w-[220px] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-cyan-500/20 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" /> CORE ENERGY
            </span>
            <span>{Math.round(energyLevel)}%</span>
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-500/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-400 transition-all duration-300 shadow-[0_0_10px_#00f0ff]"
              style={{ width: `${energyLevel}%` }}
            />
          </div>

          {/* Current Interface State Badge */}
          <div className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/30 text-[10px]">
            <span className="text-slate-400">INTERFACE MODE:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider ${
                mode === 'ACTIVE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : mode === 'STANDBY'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              ● {mode}
            </span>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-1 text-[9px] rounded border transition-all ${
                  mode === m
                    ? m === 'ACTIVE'
                      ? 'bg-emerald-500/30 text-emerald-100 border-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : m === 'STANDBY'
                      ? 'bg-amber-500/30 text-amber-100 border-amber-400 font-bold'
                      : 'bg-cyan-500/30 text-cyan-100 border-cyan-400 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-cyan-500/20 hover:text-cyan-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Top Right System Telemetry */}
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl flex flex-col gap-1.5 min-w-[200px] shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-cyan-500/20 pb-1 text-[11px]">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" /> FRAME RATE
            </span>
            <span className="text-emerald-400 font-bold">{fps} FPS</span>
          </div>

          <div className="flex justify-between text-[10px] text-cyan-200/80">
            <span>CPU LOAD:</span>
            <span className="font-bold">{Math.round(diagnostics.cpuUsage)}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-cyan-200/80">
            <span>RAM ALLOC:</span>
            <span className="font-bold">{Math.round(diagnostics.ramUsage)}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-cyan-200/80">
            <span>GPU LOAD:</span>
            <span className="font-bold">{Math.round(diagnostics.gpuLoad)}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Center Active Gesture Feedback */}
      <div className="flex items-center justify-center">
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <Crosshair className={`w-4 h-4 ${isTargetLocked ? 'text-emerald-400 animate-spin' : 'text-cyan-400'}`} />
          <span className="text-slate-400 text-[11px]">GESTURE:</span>
          <span className="text-cyan-200 font-bold tracking-wider text-xs uppercase">
            {lastDetectedGesture}
          </span>
          {gestureConfidence > 0 && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {Math.round(gestureConfidence * 100)}% MATCH
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
