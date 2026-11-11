import React from 'react';
import { Settings as SettingsIcon, Sliders, Palette, Zap, Volume2, Shield } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { UltronTheme } from '../../types';

export const SettingsPanel: React.FC = () => {
  const {
    theme,
    setTheme,
    particleCount,
    setParticleCount,
    shaderSpeed,
    setShaderSpeed,
    isSoundEffectsEnabled,
    toggleSoundEffects,
    isDebugMode,
    toggleDebugMode,
    resetOrb,
  } = useUltronStore();

  const themeColors = THEME_PRESETS[theme];

  const themes: { id: UltronTheme; label: string; color: string }[] = [
    { id: 'neon-cyan', label: 'Neon Cyan', color: '#00f0ff' },
    { id: 'iron-red', label: 'Iron Red', color: '#ff2a2a' },
    { id: 'electric-purple', label: 'Electric Purple', color: '#b026ff' },
    { id: 'emerald-green', label: 'Emerald Green', color: '#00ff88' },
    { id: 'stealth-white', label: 'Stealth White', color: '#e2e8f0' },
    { id: 'amber-gold', label: 'Amber Gold', color: '#ffb703' },
  ];

  return (
    <div
      className="flex flex-col h-[420px] w-full p-4 rounded-xl border backdrop-blur-md shadow-2xl relative overflow-hidden font-mono"
      style={{
        backgroundColor: themeColors.bgGlass,
        borderColor: themeColors.borderGlow,
        boxShadow: `0 0 25px ${themeColors.glow}`,
      }}
    >
      <div className="flex items-center justify-between border-b pb-3 mb-3 border-cyan-500/30">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm tracking-widest text-cyan-200 uppercase font-bold">
            SYSTEM PREFERENCES & SHADERS
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-cyan-100">
        {/* Theme Picker */}
        <div>
          <label className="text-slate-300 font-bold mb-2 block flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-cyan-400" /> UI & ORB THEME MATRIX
          </label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-2 rounded border flex items-center gap-2 transition-all ${
                  theme === t.id
                    ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'border-cyan-500/20 bg-slate-900/60 hover:border-cyan-500/50'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-[11px] truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shader Speed */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> PLASMA SHADER SPEED
            </span>
            <span className="text-cyan-400 font-bold">{shaderSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={shaderSpeed}
            onChange={(e) => setShaderSpeed(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>

        {/* Particle Count */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> GPU PARTICLE DENSITY
            </span>
            <span className="text-cyan-400 font-bold">{particleCount}</span>
          </div>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={particleCount}
            onChange={(e) => setParticleCount(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20">
          <button
            onClick={toggleSoundEffects}
            className={`p-2.5 rounded border flex items-center justify-between transition-all ${
              isSoundEffectsEnabled
                ? 'border-cyan-400 bg-cyan-950/60'
                : 'border-slate-800 bg-slate-900/40 text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> AUDIO FEEDBACK
            </span>
            <span>{isSoundEffectsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={toggleDebugMode}
            className={`p-2.5 rounded border flex items-center justify-between transition-all ${
              isDebugMode
                ? 'border-cyan-400 bg-cyan-950/60'
                : 'border-slate-800 bg-slate-900/40 text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> DEBUG OVERLAY
            </span>
            <span>{isDebugMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={resetOrb}
          className="w-full mt-2 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 rounded text-xs font-bold transition-all"
        >
          RECALIBRATE SYSTEM PARAMETERS
        </button>
      </div>
    </div>
  );
};
