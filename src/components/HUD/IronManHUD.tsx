import React from 'react';
import { CircularMenu } from './CircularMenu';
import { StatusIndicators } from './StatusIndicators';
import { NavigationRings } from './NavigationRings';
import { WebcamGestureHUD } from './WebcamGestureHUD';
import { AIAssistantPanel } from '../Panels/AIAssistantPanel';
import { DiagnosticsPanel } from '../Panels/DiagnosticsPanel';
import { FilesPanel } from '../Panels/FilesPanel';
import { PlanetScanPanel } from '../Panels/PlanetScanPanel';
import { TerminalPanel } from '../Panels/TerminalPanel';
import { SettingsPanel } from '../Panels/SettingsPanel';
import { MusicPanel } from '../Panels/MusicPanel';
import { NotesPanel } from '../Panels/NotesPanel';
import { DeviceControlPanel } from '../Panels/DeviceControlPanel';
import { useUltronStore } from '../../store/useUltronStore';
import { Bot, Smartphone, Globe, Activity, Terminal as TermIcon, Folder, X } from 'lucide-react';

interface Props {
  onOpenTutorial: () => void;
  onOpenScreenshot: () => void;
  onOpenDeviceInterface?: () => void;
}

export const IronManHUD: React.FC<Props> = ({
  onOpenTutorial,
  onOpenScreenshot,
  onOpenDeviceInterface,
}) => {
  const { activePanel, setActivePanel, energyLevel, diagnostics } = useUltronStore();

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'ai':
        return <AIAssistantPanel />;
      case 'devices':
        return <DeviceControlPanel />;
      case 'diagnostics':
        return <DiagnosticsPanel />;
      case 'files':
        return <FilesPanel />;
      case 'weather':
        return <PlanetScanPanel />;
      case 'terminal':
        return <TerminalPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'music':
        return <MusicPanel />;
      case 'notes':
        return <NotesPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none font-mono text-cyan-400">
      {/* Background Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Header Bar Navigation */}
      <NavigationRings
        onOpenTutorial={onOpenTutorial}
        onOpenScreenshot={onOpenScreenshot}
        onOpenDeviceInterface={onOpenDeviceInterface}
      />

      {/* Central Holographic Data Callouts */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none hidden md:block">
        <div className="absolute top-12 left-0 border-b border-r border-cyan-500/50 p-2 pr-6 bg-slate-950/60 backdrop-blur-sm rounded-br">
          <span className="text-[10px] block opacity-50 uppercase tracking-widest">CORE FREQUENCY</span>
          <span className="text-lg font-bold text-cyan-200">2.4 GHZ</span>
        </div>
        <div className="absolute bottom-12 right-0 border-t border-l border-cyan-500/50 p-2 pl-6 text-right bg-slate-950/60 backdrop-blur-sm rounded-tl">
          <span className="text-[10px] block opacity-50 uppercase tracking-widest">NEURAL CONNECT</span>
          <span className="text-lg font-bold text-emerald-400">SYNCHRONIZED</span>
        </div>
      </div>

      {/* Left Vertical Side Module Quick Selectors */}
      <div className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        <button
          onClick={() => setActivePanel('ai')}
          title="AI Matrix Assistant"
          className={`w-11 h-11 rounded border flex items-center justify-center font-bold text-xs transition-all ${
            activePanel === 'ai'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_#00f0ff]'
              : 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
          }`}
        >
          AI
        </button>
        <button
          onClick={() => setActivePanel('devices')}
          title="Physical Android MCP Rack"
          className={`w-11 h-11 rounded border flex items-center justify-center font-bold text-xs transition-all ${
            activePanel === 'devices'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_#00f0ff]'
              : 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
          }`}
        >
          RACK
        </button>
        <button
          onClick={() => setActivePanel('weather')}
          title="Orbital Radar & Weather"
          className={`w-11 h-11 rounded border flex items-center justify-center font-bold text-xs transition-all ${
            activePanel === 'weather'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_#00f0ff]'
              : 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
          }`}
        >
          RAD
        </button>
        <button
          onClick={() => setActivePanel('diagnostics')}
          title="System Diagnostics"
          className={`w-11 h-11 rounded border flex items-center justify-center font-bold text-xs transition-all ${
            activePanel === 'diagnostics'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_#00f0ff]'
              : 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
          }`}
        >
          DIAG
        </button>
        <button
          onClick={() => setActivePanel('files')}
          title="Data Vault Archives"
          className={`w-11 h-11 rounded border flex items-center justify-center font-bold text-xs transition-all ${
            activePanel === 'files'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_#00f0ff]'
              : 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
          }`}
        >
          VAULT
        </button>
      </div>

      {/* Right Side Energy & Network Analytics Cards */}
      <div className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-20">
        <div className="bg-slate-950/80 backdrop-blur-md border border-cyan-900 p-3.5 rounded-l-xl w-60 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <p className="text-[10px] mb-2 opacity-60 uppercase font-bold tracking-widest">ENERGY DISTRIBUTION</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-end text-[10px] mb-0.5">
                <span>SHIELDS</span>
                <span className="font-bold">{Math.round(energyLevel)}%</span>
              </div>
              <div className="h-1 bg-cyan-950 w-full rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${energyLevel}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end text-[10px] mb-0.5">
                <span>PROPULSION</span>
                <span className="font-bold">12%</span>
              </div>
              <div className="h-1 bg-cyan-950 w-full rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[12%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time HUD System Diagnostics & Health Card */}
        <div
          onClick={() => setActivePanel('diagnostics')}
          className="cursor-pointer bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 p-3.5 rounded-l-xl w-64 shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest text-cyan-200 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> DIAGNOSTICS & HEALTH
            </span>
            <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-2">
            <div className="bg-slate-900/90 p-1.5 rounded border border-cyan-500/20">
              <span className="text-slate-400 text-[8px] block">TEMP</span>
              <span className={`font-bold ${diagnostics.temperature > 75 ? 'text-red-400' : 'text-cyan-200'}`}>
                {Math.round(diagnostics.temperature)}°C
              </span>
            </div>
            <div className="bg-slate-900/90 p-1.5 rounded border border-cyan-500/20">
              <span className="text-slate-400 text-[8px] block">LATENCY</span>
              <span className="font-bold text-cyan-200">
                {Math.round(diagnostics.latencyMs)}ms
              </span>
            </div>
          </div>

          {/* Core Input Methods Active Cue */}
          <div className="text-[9px] font-mono text-cyan-300/80 bg-slate-900/80 p-1.5 rounded border border-cyan-500/20 flex flex-col gap-0.5">
            <div className="flex justify-between text-[8px]">
              <span className="text-slate-400">GAZE FIXATION:</span>
              <span className="text-purple-300 font-bold truncate max-w-[110px]">
                {diagnostics.gazeFixation.targetName}
              </span>
            </div>
            <div className="flex justify-between text-[8px]">
              <span className="text-slate-400">HEAD VECTOR:</span>
              <span className="text-cyan-300 font-bold">
                {diagnostics.headGesture.reticleVector}
              </span>
            </div>
          </div>

          <div className="mt-2 text-[8px] text-cyan-400/60 text-right group-hover:text-cyan-200 font-mono">
            CLICK TO OPEN FULL DIAGNOSTICS MATRIX →
          </div>
        </div>
      </div>

      {/* Center Holographic Ring Menu */}
      <CircularMenu />

      {/* Corner Status Indicators */}
      <StatusIndicators />

      {/* Floating PIP Webcam Tracking Window */}
      <WebcamGestureHUD />

      {/* Floating Interactive Panel Modal */}
      {activePanel && (
        <div className="pointer-events-auto absolute top-20 right-6 w-96 max-w-[calc(100vw-3rem)] z-30 animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="relative">
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-3 right-3 text-cyan-400 hover:text-white p-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 z-40 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            {renderActivePanel()}
          </div>
        </div>
      )}
    </div>
  );
};

