import React from 'react';
import { Music, Play, Pause, Mic, Radio, Volume2 } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { audioAnalyzer } from '../../lib/audioAnalyzer';

export const MusicPanel: React.FC = () => {
  const { theme, isAudioReactive, toggleAudioReactive, audioData } =
    useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const handleToggleMic = async () => {
    if (isAudioReactive) {
      audioAnalyzer.stop();
      toggleAudioReactive(false);
    } else {
      const ok = await audioAnalyzer.startMicrophone();
      toggleAudioReactive(ok);
    }
  };

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
          <Music className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm tracking-widest text-cyan-200 uppercase font-bold">
            AUDIO REACTIVE SYNTHESIS
          </span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded border ${
            isAudioReactive
              ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40'
              : 'text-slate-400 bg-slate-900/80 border-slate-700'
          }`}
        >
          {isAudioReactive ? 'MIC ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between my-2">
        {/* Frequency Spectrum Visualizer */}
        <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/20 h-44 flex items-end justify-between gap-1">
          {audioData.frequencyData.map((val, i) => (
            <div
              key={i}
              className="flex-1 bg-cyan-950/60 rounded-t overflow-hidden h-full flex items-end"
            >
              <div
                className="w-full bg-gradient-to-t from-cyan-500 to-purple-400 transition-all duration-75 shadow-[0_0_8px_#00f0ff]"
                style={{ height: `${Math.min(100, (val / 255) * 100)}%` }}
              />
            </div>
          ))}
        </div>

        {/* Audio Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs text-cyan-200 mt-2">
          <div className="bg-slate-900/80 p-2 rounded border border-cyan-500/20 text-center">
            <span className="text-slate-400 text-[10px] block">BASS LEVEL</span>
            <span className="font-bold text-cyan-400">
              {(audioData.bass * 100).toFixed(0)}%
            </span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded border border-cyan-500/20 text-center">
            <span className="text-slate-400 text-[10px] block">TREBLE</span>
            <span className="font-bold text-cyan-400">
              {(audioData.treble * 100).toFixed(0)}%
            </span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded border border-cyan-500/20 text-center">
            <span className="text-slate-400 text-[10px] block">VOLUME</span>
            <span className="font-bold text-cyan-400">
              {(audioData.volume * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Mic Control Button */}
        <button
          onClick={handleToggleMic}
          className={`w-full mt-3 py-3 rounded-lg border font-bold flex items-center justify-center gap-2 transition-all ${
            isAudioReactive
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900/80 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60'
          }`}
        >
          <Mic className="w-4 h-4" />
          {isAudioReactive
            ? 'DISABLE MICROPHONE REACTIVITY'
            : 'ENABLE MICROPHONE REACTIVITY'}
        </button>
      </div>
    </div>
  );
};
