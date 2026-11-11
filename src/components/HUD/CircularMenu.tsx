import React from 'react';
import {
  Bot,
  Activity,
  Folder,
  Globe,
  Terminal as TermIcon,
  Settings,
  Music,
  Edit3,
  Smartphone,
} from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { ActiveHUDPanel } from '../../types';

export const CircularMenu: React.FC = () => {
  const { theme, activePanel, setActivePanel } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const menuItems: { id: ActiveHUDPanel; label: string; icon: React.ReactNode }[] = [
    { id: 'ai', label: 'AI CHAT', icon: <Bot className="w-4 h-4" /> },
    { id: 'devices', label: 'MCP RACK', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'diagnostics', label: 'SYSTEM', icon: <Activity className="w-4 h-4" /> },
    { id: 'files', label: 'VAULT', icon: <Folder className="w-4 h-4" /> },
    { id: 'weather', label: 'RADAR', icon: <Globe className="w-4 h-4" /> },
    { id: 'terminal', label: 'CLI', icon: <TermIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'PREFS', icon: <Settings className="w-4 h-4" /> },
    { id: 'music', label: 'SYNTH', icon: <Music className="w-4 h-4" /> },
    { id: 'notes', label: 'NOTES', icon: <Edit3 className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Outer Rotating Arc Ring */}
      <div
        className="w-[380px] h-[380px] rounded-full border border-dashed border-cyan-500/30 animate-spin-slow absolute"
        style={{ animationDuration: '24s' }}
      />

      <div className="relative w-[340px] h-[340px] flex items-center justify-center">
        {menuItems.map((item, index) => {
          const angle = (index / menuItems.length) * (Math.PI * 2) - Math.PI / 2;
          const radius = 170; // px
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const isActive = activePanel === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`pointer-events-auto absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-mono tracking-wider transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
                isActive
                  ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 scale-110 shadow-[0_0_15px_#00f0ff]'
                  : 'bg-slate-950/70 text-cyan-400/80 border-cyan-500/30 hover:border-cyan-400 hover:text-white hover:scale-105'
              }`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              {item.icon}
              <span className="hidden sm:inline font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
