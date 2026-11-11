import React from 'react';
import { Hand, X, Sparkles, Move, Minimize2, Maximize2, Crosshair, ArrowLeftRight } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureTutorial: React.FC<Props> = ({ isOpen, onClose }) => {
  const { theme } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  if (!isOpen) return null;

  const gestures = [
    { title: 'Open Palm', desc: 'Activate interface array & unlock core', icon: <Hand className="w-5 h-5 text-cyan-400" /> },
    { title: 'Closed Fist', desc: 'Sleep mode & close active panels', icon: <Minimize2 className="w-5 h-5 text-purple-400" /> },
    { title: 'Pinch & Move', desc: 'Grab 3D orb and drag in space', icon: <Move className="w-5 h-5 text-emerald-400" /> },
    { title: 'Spread Fingers', desc: 'Expand orb size and boost energy density', icon: <Maximize2 className="w-5 h-5 text-amber-400" /> },
    { title: 'Point Finger', desc: 'Target lock & highlight HUD buttons', icon: <Crosshair className="w-5 h-5 text-cyan-400" /> },
    { title: 'Swipe Left / Right', desc: 'Navigate active HUD modules', icon: <ArrowLeftRight className="w-5 h-5 text-cyan-400" /> },
    { title: 'Two Hands Apart', desc: 'Zoom in / Expand field', icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
    { title: 'Two Hands Together', desc: 'Compress orb scale', icon: <Minimize2 className="w-5 h-5 text-emerald-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div
        className="relative max-w-xl w-full bg-slate-950 border p-6 rounded-2xl shadow-2xl overflow-hidden"
        style={{ borderColor: themeColors.borderGlow }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyan-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-cyan-500/30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b pb-3 border-cyan-500/30">
          <Hand className="w-6 h-6 text-cyan-400 animate-pulse" />
          <h2 className="text-base font-bold text-cyan-100 uppercase tracking-widest">
            WEBCAM HAND GESTURE GUIDE
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2">
          {gestures.map((g, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/30">
                {g.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-cyan-200">{g.title}</span>
                <span className="text-[11px] text-slate-400 leading-snug">{g.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Hold hand ~1.5 - 3 feet in front of webcam</span>
          <button
            onClick={onClose}
            className="bg-cyan-500/20 border border-cyan-400 text-cyan-200 px-4 py-1.5 rounded-lg hover:bg-cyan-500/40 font-bold"
          >
            DISMISS GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
