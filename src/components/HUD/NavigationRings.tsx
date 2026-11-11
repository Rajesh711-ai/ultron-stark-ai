import React, { useState, useEffect } from 'react';
import {
  Camera,
  Mic,
  Music,
  Maximize,
  HelpCircle,
  ShieldAlert,
  Camera as ScreenshotIcon,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { speechEngine } from '../../lib/speech';
import { audioAnalyzer } from '../../lib/audioAnalyzer';

interface Props {
  onOpenTutorial: () => void;
  onOpenScreenshot: () => void;
  onOpenDeviceInterface?: () => void;
}

export const NavigationRings: React.FC<Props> = ({
  onOpenTutorial,
  onOpenScreenshot,
  onOpenDeviceInterface,
}) => {
  const {
    theme,
    deviceState,
    isWebcamActive,
    toggleWebcam,
    isVoiceActive,
    toggleVoice,
    isAudioReactive,
    toggleAudioReactive,
    isDebugMode,
    toggleDebugMode,
    resetOrb,
  } = useUltronStore();

  const themeColors = THEME_PRESETS[theme];

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      setTimeStr(new Date().toLocaleTimeString());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleVoice = () => {
    if (isVoiceActive) {
      speechEngine.stop();
    } else {
      speechEngine.start();
    }
  };

  const handleToggleAudio = async () => {
    if (isAudioReactive) {
      audioAnalyzer.stop();
      toggleAudioReactive(false);
    } else {
      const ok = await audioAnalyzer.startMicrophone();
      toggleAudioReactive(ok);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 font-mono">
      {/* Brand Header with Sleek Interface Accents */}
      <div className="pointer-events-auto flex flex-col border-l-2 border-cyan-500 pl-4 py-1 bg-slate-950/70 backdrop-blur-md rounded-r-lg pr-4 border-t border-b border-cyan-500/20">
        <h1 className="text-xl md:text-2xl font-bold tracking-widest uppercase text-cyan-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping inline-block" />
          Ultron Orb UI
        </h1>
        <div className="flex gap-3 text-[10px] opacity-80 tracking-wider">
          <span>OS: CORE_HOLOGRAPH_V9.2</span>
          <span>•</span>
          <span>ID: STARK_ENT_772</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">STATUS: ONLINE</span>
        </div>
      </div>

      {/* Header Telemetry & Quick Control Dock */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="hidden sm:flex gap-4 items-center bg-cyan-950/30 backdrop-blur-md border border-cyan-500/30 px-4 py-2 rounded-bl-2xl font-mono shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <div className="text-right">
            <p className="text-[9px] opacity-50 uppercase tracking-widest">SYSTEM DIAGNOSTICS</p>
            <p className="text-sm font-bold text-cyan-200">60.00 FPS</p>
          </div>
          <div className="w-px h-6 bg-cyan-500/30" />
          <div className="text-right">
            <p className="text-[9px] opacity-50 uppercase tracking-widest">CPU LOAD</p>
            <p className="text-sm font-bold text-red-400">42.8%</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          {/* Webcam */}
          <button
            onClick={() => toggleWebcam()}
            title="Toggle Hand Tracking Webcam"
            className={`p-2 rounded-lg border transition-all ${
              isWebcamActive
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_10px_#00f0ff]'
                : 'bg-slate-900/60 border-cyan-500/20 text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice */}
          <button
            onClick={handleToggleVoice}
            title="Toggle AI Speech Voice Controls"
            className={`p-2 rounded-lg border transition-all ${
              isVoiceActive
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_10px_#00f0ff]'
                : 'bg-slate-900/60 border-cyan-500/20 text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Audio Reactive */}
          <button
            onClick={handleToggleAudio}
            title="Toggle Audio Spectrum Reactivity"
            className={`p-2 rounded-lg border transition-all ${
              isAudioReactive
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_10px_#00f0ff]'
                : 'bg-slate-900/60 border-cyan-500/20 text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          <span className="text-cyan-500/30">|</span>

          {/* Tutorial */}
          <button
            onClick={onOpenTutorial}
            title="Gesture Tutorial Guide"
            className="p-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 text-slate-400 hover:text-cyan-200 hover:border-cyan-400 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Screenshot */}
          <button
            onClick={onOpenScreenshot}
            title="Capture Cybernetic Screenshot"
            className="p-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 text-slate-400 hover:text-cyan-200 hover:border-cyan-400 transition-all"
          >
            <ScreenshotIcon className="w-4 h-4" />
          </button>

          {/* Debug */}
          <button
            onClick={toggleDebugMode}
            title="Toggle Debug Overlay"
            className={`p-2 rounded-lg border transition-all ${
              isDebugMode
                ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                : 'bg-slate-900/60 border-cyan-500/20 text-slate-400 hover:text-cyan-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={resetOrb}
            title="Reset Orb Position & Physics"
            className="p-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 text-slate-400 hover:text-cyan-200 hover:border-cyan-400 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Interface Device Button */}
          {onOpenDeviceInterface && (
            <button
              onClick={onOpenDeviceInterface}
              title="Interface Physical Handset or ADB"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                deviceState.deviceConnected
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-gradient-to-r from-purple-900/80 to-cyan-950/80 border-cyan-500/40 text-cyan-200 hover:border-cyan-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden md:inline">
                {deviceState.deviceConnected ? 'DEVICE PAIRED' : 'INTERFACE DEVICE'}
              </span>
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            title="Toggle Fullscreen Mode"
            className="p-2 rounded-lg border border-cyan-500/20 bg-slate-900/60 text-slate-400 hover:text-cyan-200 hover:border-cyan-400 transition-all"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
