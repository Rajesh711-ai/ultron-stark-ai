import React, { useEffect, useState } from 'react';
import { Bot, Shield, Cpu, Zap, Sparkles } from 'lucide-react';
import { useUltronStore } from '../../store/useUltronStore';

export const BootSequence: React.FC = () => {
  const { isBooting, setBooting } = useUltronStore();
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('INITIALIZING ULTRON CORE...');

  useEffect(() => {
    if (!isBooting) return;

    const steps = [
      { p: 15, text: 'LOADING PLASMA SHADER PIPELINES...' },
      { p: 35, text: 'CALIBRATING THREE.JS WEBGL CANVAS...' },
      { p: 55, text: 'INITIALIZING MEDIAPIPE GESTURE RECOGNITION...' },
      { p: 80, text: 'SYNCHRONIZING GEMINI AI MATRIX...' },
      { p: 100, text: 'ULTRON ORB UI ONLINE. DISENGAGING LOCKS.' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStepText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isBooting]);

  if (!isBooting) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center font-mono p-6 select-none overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full bg-slate-900/90 border border-cyan-500/40 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.3)] backdrop-blur-xl text-center">
        {/* Core Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-spin-slow shadow-[0_0_30px_#00f0ff]">
            <Bot className="w-10 h-10 text-cyan-300" />
          </div>
          <div className="absolute inset-0 rounded-full border border-purple-500 animate-ping opacity-50" />
        </div>

        <h1 className="text-xl font-extrabold tracking-widest text-cyan-100 uppercase mb-2">
          STARK ULTRON ORB UI
        </h1>
        <p className="text-xs text-cyan-400/80 mb-6 font-mono">
          SYSTEM INITIALIZATION PROTOCOL v9.4
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full border border-cyan-500/40 overflow-hidden mb-4 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-300 rounded-full transition-all duration-500 shadow-[0_0_12px_#00f0ff]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[10px] text-cyan-300 font-mono">
          <span>{stepText}</span>
          <span className="font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
