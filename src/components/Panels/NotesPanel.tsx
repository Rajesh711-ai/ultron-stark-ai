import React, { useState } from 'react';
import { Edit3, Save, Check } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

export const NotesPanel: React.FC = () => {
  const { theme } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const [notes, setNotes] = useState(
    `[TACTICAL DIRECTIVE 094]:\n- Recalibrate plasma core output to match 1.21 GW.\n- Verify gesture recognition Kalman filters for two-hand zoom.\n- Monitor quantum flux stability.`
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <Edit3 className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm tracking-widest text-cyan-200 uppercase font-bold">
            TACTICAL SCRATCHPAD
          </span>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-1 rounded hover:bg-cyan-900/60 transition-all"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'SAVED' : 'SAVE'}</span>
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="flex-1 bg-slate-950/80 border border-cyan-500/20 rounded-lg p-3 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 resize-none font-mono leading-relaxed"
      />
    </div>
  );
};
