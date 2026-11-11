import React, { useState } from 'react';
import { Camera, Download, X, Check } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenshotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { theme } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const [captured, setCaptured] = useState(false);

  if (!isOpen) return null;

  const handleCapture = () => {
    // Capture canvas
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `ultron-orb-capture-${Date.now()}.png`;
    link.click();

    setCaptured(true);
    setTimeout(() => {
      setCaptured(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div
        className="relative max-w-md w-full bg-slate-950 border p-6 rounded-2xl shadow-2xl overflow-hidden text-center"
        style={{ borderColor: themeColors.borderGlow }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyan-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-cyan-500/30"
        >
          <X className="w-5 h-5" />
        </button>

        <Camera className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-pulse" />
        <h2 className="text-base font-bold text-cyan-100 uppercase tracking-widest mb-1">
          CYBERNETIC SNAPSHOT
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Capture high-resolution 3D holographic canvas frame.
        </p>

        <button
          onClick={handleCapture}
          className="w-full py-3 bg-cyan-500/30 border border-cyan-400 text-cyan-100 rounded-xl font-bold hover:bg-cyan-500/50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
        >
          {captured ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>SNAPSHOT CAPTURED & SAVED!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>CAPTURE & DOWNLOAD FRAME</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
