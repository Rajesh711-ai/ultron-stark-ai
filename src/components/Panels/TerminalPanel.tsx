import React, { useState } from 'react';
import { Terminal as TermIcon, CornerDownLeft } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

export const TerminalPanel: React.FC = () => {
  const { theme, setMode, setEnergyLevel, setTheme, resetOrb } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const [logs, setLogs] = useState<string[]>([
    'ULTRON PROTOCOL OS [Version 9.4.01]',
    'Copyright (C) Stark Industries / Ultron Labs. All rights reserved.',
    'Type "help" for a list of available CLI commands.',
  ]);
  const [cmd, setCmd] = useState('');

  const executeCommand = () => {
    if (!cmd.trim()) return;

    const trimmed = cmd.trim().toLowerCase();
    const newLogs = [...logs, `> ${cmd}`];

    if (trimmed === 'help') {
      newLogs.push(
        'AVAILABLE COMMANDS:',
        '  scan        - Engage high-frequency orbital diagnostic scan',
        '  overdrive   - Boost energy core to 100% capacity',
        '  attack      - Trigger tactical offensive mode',
        '  sleep       - Power down interface array',
        '  theme <c>   - Set theme (cyan, red, purple, green, white, gold)',
        '  reset       - Recalibrate orb physics and coordinates',
        '  clear       - Clear terminal buffer'
      );
    } else if (trimmed === 'scan') {
      setMode('SCANNING');
      newLogs.push('Executing deep spectrum scan sequence...');
    } else if (trimmed === 'overdrive') {
      setEnergyLevel(100);
      setMode('CHARGING');
      newLogs.push('OVERDRIVE ENGAGED: Energy output maxed out.');
    } else if (trimmed === 'attack') {
      setMode('ATTACK');
      newLogs.push('TACTICAL ATTACK PROTOCOL ACTIVE.');
    } else if (trimmed === 'sleep') {
      setMode('SLEEP');
      newLogs.push('INTERFACE SHIFTED TO LOW-POWER SLEEP MODE.');
    } else if (trimmed.startsWith('theme')) {
      const parts = trimmed.split(' ');
      const t = parts[1];
      if (t === 'cyan') setTheme('neon-cyan');
      else if (t === 'red') setTheme('iron-red');
      else if (t === 'purple') setTheme('electric-purple');
      else if (t === 'green') setTheme('emerald-green');
      else if (t === 'white') setTheme('stealth-white');
      else if (t === 'gold') setTheme('amber-gold');
      newLogs.push(`Theme updated to ${t || 'cyan'}.`);
    } else if (trimmed === 'reset') {
      resetOrb();
      newLogs.push('Orb state reset to default parameters.');
    } else if (trimmed === 'clear') {
      setLogs([]);
      setCmd('');
      return;
    } else {
      newLogs.push(`Command not recognized: "${cmd}". Type "help" for syntax.`);
    }

    setLogs(newLogs);
    setCmd('');
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
          <TermIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm tracking-widest text-cyan-200 uppercase font-bold">
            ULTRON CLI TERMINAL
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
          ROOT ACCESS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 p-2 bg-slate-950/80 rounded border border-cyan-500/20 text-xs text-cyan-300">
        {logs.map((line, idx) => (
          <div key={idx} className="leading-relaxed">
            {line}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-cyan-500/20">
        <span className="text-cyan-400 font-bold">&gt;</span>
        <input
          type="text"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-none text-xs text-cyan-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={executeCommand}
          className="text-cyan-400 hover:text-white transition-colors p-1"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
