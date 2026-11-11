import React from 'react';
import { Globe, Radio, CloudRain, Sun, Compass } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

export const PlanetScanPanel: React.FC = () => {
  const { theme } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  return (
    <div
      className="flex flex-col h-[420px] w-full p-4 rounded-xl border backdrop-blur-md shadow-2xl relative overflow-hidden"
      style={{
        backgroundColor: themeColors.bgGlass,
        borderColor: themeColors.borderGlow,
        boxShadow: `0 0 25px ${themeColors.glow}`,
      }}
    >
      <div className="flex items-center justify-between border-b pb-3 mb-3 border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-sm tracking-widest text-cyan-200 uppercase font-bold">
            ORBITAL WEATHER & RADAR SCAN
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
          SATELLITE LINK 07
        </span>
      </div>

      {/* Radar Animation Box */}
      <div className="relative flex-1 bg-slate-950/80 rounded-lg border border-cyan-500/20 flex items-center justify-center overflow-hidden my-2">
        {/* Radar Rings */}
        <div className="absolute w-48 h-48 rounded-full border border-cyan-500/30" />
        <div className="absolute w-32 h-32 rounded-full border border-cyan-500/20" />
        <div className="absolute w-16 h-16 rounded-full border border-cyan-500/40" />

        {/* Crosshair */}
        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
        <div className="absolute h-full w-[1px] bg-cyan-500/20" />

        {/* Sweeping Radar Line */}
        <div
          className="absolute w-24 h-24 origin-top-left border-l-2 border-cyan-400/80 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-spin"
          style={{ animationDuration: '4s' }}
        />

        {/* Simulated Blips */}
        <div className="absolute top-12 left-16 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <div className="absolute bottom-16 right-20 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />

        <span className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-300">
          COORDINATES: 37.7749° N, 122.4194° W
        </span>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-xs font-mono">
        <div className="bg-slate-900/80 p-2 rounded border border-cyan-500/20 text-center">
          <span className="text-slate-400 text-[10px] block">ATMOSPHERE</span>
          <span className="text-cyan-300 font-bold">1013.2 hPa</span>
        </div>
        <div className="bg-slate-900/80 p-2 rounded border border-cyan-500/20 text-center">
          <span className="text-slate-400 text-[10px] block">IONOSPHERE</span>
          <span className="text-cyan-300 font-bold">STABLE</span>
        </div>
        <div className="bg-slate-900/80 p-2 rounded border border-cyan-500/20 text-center">
          <span className="text-slate-400 text-[10px] block">TEMP MATRIX</span>
          <span className="text-cyan-300 font-bold">22.4°C</span>
        </div>
      </div>
    </div>
  );
};
