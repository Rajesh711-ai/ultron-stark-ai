import React, { useState } from 'react';
import { Folder, FileCode, Lock, ShieldCheck, Download, Search } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

const MOCK_FILES = [
  { name: 'ULTRON_CORE_SHADERS.glsl', size: '1.4 MB', type: 'GLSL Shader', status: 'ENCRYPTED' },
  { name: 'MARK_85_PLASMA_SPECS.dat', size: '42.8 MB', type: 'Schematic', status: 'VERIFIED' },
  { name: 'MEDIAPIPE_GESTURE_WEIGHTS.bin', size: '8.2 MB', type: 'AI Model', status: 'ACTIVE' },
  { name: 'TACTICAL_TARGET_OVERRIDE.json', size: '320 KB', type: 'Protocol', status: 'LOCKED' },
  { name: 'QUANTUM_ENERGY_LOGS.log', size: '12.1 MB', type: 'Log', status: 'VERIFIED' },
];

export const FilesPanel: React.FC = () => {
  const { theme } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];
  const [query, setQuery] = useState('');

  const filtered = MOCK_FILES.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

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
          <Folder className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-sm tracking-widest text-cyan-200 uppercase font-bold">
            HOLOGRAPHIC DATA VAULT
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
          5 FILES
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3 bg-slate-900/80 p-2 rounded border border-cyan-500/20">
        <Search className="w-4 h-4 text-cyan-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter data vault archives..."
          className="bg-transparent border-none text-xs font-mono text-cyan-100 placeholder-slate-500 focus:outline-none flex-1"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded bg-slate-900/70 border border-cyan-500/20 hover:border-cyan-400/60 transition-all font-mono text-xs text-cyan-100"
          >
            <div className="flex items-center gap-2.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="font-bold">{file.name}</span>
                <span className="text-[10px] text-slate-400">{file.type} • {file.size}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded border ${
                file.status === 'VERIFIED' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' :
                file.status === 'ENCRYPTED' ? 'text-purple-400 border-purple-500/30 bg-purple-950/40' :
                'text-amber-400 border-amber-500/30 bg-amber-950/40'
              }`}>
                {file.status}
              </span>
              <button className="text-cyan-400 hover:text-white transition-colors p-1">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
