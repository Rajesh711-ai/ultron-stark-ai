import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Wifi,
  Unlock,
  Lock,
  Youtube,
  Search,
  Camera,
  Vibrate,
  Volume2,
  VolumeX,
  Radio,
  Battery,
  Zap,
  Activity,
  ShieldCheck,
  Compass,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Monitor,
  ExternalLink,
} from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { speechEngine } from '../../lib/speech';

interface MobileHandsetReceiverProps {
  onSwitchToDesktopMode: () => void;
}

export const MobileHandsetReceiver: React.FC<MobileHandsetReceiverProps> = ({
  onSwitchToDesktopMode,
}) => {
  const { theme, setTheme, triggerDeviceAction, deviceState, setDeviceConnected } =
    useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>(
    'connecting'
  );
  const [sessionPin, setSessionPin] = useState('859102');
  const [pinInput, setPinInput] = useState('859102');
  const [isLocked, setIsLocked] = useState(false);
  const [activeApp, setActiveApp] = useState<string>('home');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string>(
    'Awaiting command from laptop console...'
  );
  const [lastCommandTime, setLastCommandTime] = useState<string>('');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isTorchActive, setIsTorchActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [gyroValues, setGyroValues] = useState<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 1. Establish SSE Connection to Server for Real-Time Execution
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/device/stream');

        eventSource.onopen = () => {
          setConnectionStatus('connected');
          const phoneName = /iPhone|iPad/i.test(navigator.userAgent)
            ? 'Apple iPhone Handset'
            : /Android/i.test(navigator.userAgent)
            ? 'Android Handset'
            : 'Tactical Handset Client';

          setDeviceConnected(true, phoneName);

          // Pair with server
          fetch('/api/device/pair', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: sessionPin, deviceName: phoneName }),
          }).catch(() => {});
        };

        eventSource.addEventListener('command_executed', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            handleIncomingCommand(data);
          } catch (err) {
            console.warn('SSE parse error:', err);
          }
        });

        eventSource.onerror = () => {
          setConnectionStatus('connecting');
        };
      } catch (err) {
        setConnectionStatus('error');
      }
    };

    connectSSE();

    // 2. Battery Telemetry Ingestion
    if ('getBattery' in navigator) {
      (navigator as any).getBattery?.().then((bat: any) => {
        const level = Math.round(bat.level * 100);
        setBatteryLevel(level);
        fetch('/api/device/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ battery: level }),
        }).catch(() => {});
      });
    }

    // 3. Gyroscope Listener
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.gamma !== null) {
        const newGyro = {
          alpha: Math.round(event.alpha || 0),
          beta: Math.round(event.beta),
          gamma: Math.round(event.gamma),
        };
        setGyroValues(newGyro);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [sessionPin]);

  // Handle Incoming Remote Commands from Laptop
  const handleIncomingCommand = (data: any) => {
    const { action, targetApp, speechText, deepLink, theme: newTheme } = data;
    const now = new Date().toLocaleTimeString();
    setLastCommandTime(now);

    const cmdDesc = action || targetApp || 'COMMAND_EXECUTE';
    setLastExecutedCommand(cmdDesc.toUpperCase());

    // Native Mobile Hardware Vibration
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch (e) {}
    }

    // Speech Voice Output
    if (speechText && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(speechText);
        utter.rate = 1.05;
        utter.pitch = 0.9;
        window.speechSynthesis.speak(utter);
      } catch (e) {}
    }

    // Handle Specific Actions
    if (action === 'lock' || targetApp === 'lock') {
      setIsLocked(true);
      setActiveApp('lock');
    } else if (action === 'unlock') {
      setIsLocked(false);
      setActiveApp('home');
    }

    if (targetApp && targetApp !== 'lock') {
      setActiveApp(targetApp);
      setIsLocked(false);
    }

    if (newTheme) {
      setTheme(newTheme);
    }

    // Deep link execution if provided
    if (deepLink) {
      try {
        window.open(deepLink, '_blank');
      } catch (e) {}
    }
  };

  // Sound Siren / Alert generator
  const toggleAlarm = () => {
    if (isAlertActive) {
      setIsAlertActive(false);
      if (audioCtxRef.current) audioCtxRef.current.close();
      audioCtxRef.current = null;
    } else {
      setIsAlertActive(true);
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
            setIsAlertActive(false);
          }
        }, 3000);
      } catch (e) {}
    }
  };

  // Trigger Action from Phone back to Laptop
  const sendCommandToLaptop = (action: string, targetApp: string, text: string) => {
    setLastExecutedCommand(`TRANSMITTED: ${action.toUpperCase()}`);
    setLastCommandTime(new Date().toLocaleTimeString());

    fetch('/api/device/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        targetApp,
        speechText: text,
      }),
    }).catch(() => {});

    speechEngine.speak(text);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-mono text-slate-100 select-none overflow-x-hidden ${
        isTorchActive ? 'bg-white' : 'bg-slate-950'
      }`}
      style={{
        backgroundColor: isTorchActive ? '#ffffff' : '#030712',
      }}
    >
      {/* Top Tactical Status Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-cyan-500/30 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-amber-400'
              }`}
            />
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-cyan-200 uppercase flex items-center gap-1.5">
              <span>STARK HANDSET NODE</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                }`}
              >
                {connectionStatus === 'connected' ? '● PAIRED' : 'CONNECTING...'}
              </span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              MCP PROTOCOL // PIN: {sessionPin}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-cyan-500/30 px-2 py-1 rounded text-[10px] text-emerald-400 font-mono">
            <Battery className="w-3.5 h-3.5" />
            <span>{batteryLevel}%</span>
          </div>

          <button
            onClick={onSwitchToDesktopMode}
            title="Switch to Desktop 3D View"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-cyan-500/30 text-[10px] flex items-center gap-1"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Execution Body */}
      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Real-time Command Feedback Box */}
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-cyan-950/80 border-2 border-cyan-400/60 rounded-2xl p-4 shadow-[0_0_25px_rgba(0,240,255,0.2)] text-center relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[8px] bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded font-mono">
            LIVE SSE LINK
          </div>

          <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block mb-1">
            LAPTOP EXECUTION STATUS
          </span>

          <div className="text-base font-extrabold text-white tracking-wide flex items-center justify-center gap-2 my-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="truncate">{lastExecutedCommand}</span>
          </div>

          {lastCommandTime && (
            <div className="text-[9px] text-slate-400 font-mono">
              Last command received at: {lastCommandTime}
            </div>
          )}
        </div>

        {/* Lockout Screen Overlay if Locked */}
        {isLocked ? (
          <div className="bg-red-950/70 border-2 border-red-500/60 rounded-2xl p-6 text-center space-y-3">
            <Lock className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
            <h3 className="text-sm font-extrabold text-red-200 uppercase tracking-widest">
              HANDSET LOCKED BY LAPTOP CONSOLE
            </h3>
            <p className="text-[11px] text-red-300/80">
              Target device locked under Stark Security protocol. Command 'Unlock' from laptop or tap below to override.
            </p>
            <button
              onClick={() => {
                setIsLocked(false);
                setActiveApp('home');
                sendCommandToLaptop('unlock', 'home', 'Phone unlocked manually from handset.');
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Unlock className="w-4 h-4" />
              <span>OVERRIDE & UNLOCK PHONE</span>
            </button>
          </div>
        ) : (
          /* Active Target App Container */
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                ACTIVE HANDSET APPLICATION
              </span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold">
                {activeApp}
              </span>
            </div>

            {activeApp === 'home' && (
              <div className="p-4 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-100">HOME LAUNCHER READY</h4>
                <p className="text-[10px] text-slate-400">
                  Phone is unlocked and listening for remote gestures or terminal commands from your laptop.
                </p>
              </div>
            )}

            {activeApp === 'youtube' && (
              <div className="space-y-2 text-center">
                <Youtube className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
                <div className="text-xs font-bold text-red-400 uppercase">YOUTUBE MEDIA PLAYER</div>
                <iframe
                  className="w-full h-40 rounded-xl border border-red-500/40 bg-black"
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Mobile YouTube Stream"
                  allow="autoplay; encrypted-media"
                />
                <button
                  onClick={() => window.open('https://youtube.com', '_blank')}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN IN NATIVE YOUTUBE APP</span>
                </button>
              </div>
            )}

            {activeApp === 'camera' && (
              <div className="space-y-2 text-center">
                <Camera className="w-8 h-8 text-purple-400 mx-auto" />
                <div className="text-xs font-bold text-purple-300 uppercase">
                  LIVE OPTICAL SENSOR STREAM
                </div>
                <div className="w-full h-44 bg-black rounded-xl overflow-hidden relative border border-purple-500/40">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 border-2 border-dashed border-purple-400 rounded-lg animate-pulse" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.mediaDevices
                      ?.getUserMedia({ video: { facingMode: 'environment' } })
                      .then((stream) => {
                        if (videoRef.current) videoRef.current.srcObject = stream;
                        setCameraActive(true);
                      })
                      .catch(() => {
                        navigator.mediaDevices?.getUserMedia({ video: true }).then((stream) => {
                          if (videoRef.current) videoRef.current.srcObject = stream;
                          setCameraActive(true);
                        });
                      });
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ACTIVATE CAMERA SENSOR</span>
                </button>
              </div>
            )}

            {activeApp === 'whatsapp' && (
              <div className="space-y-2 text-center p-2">
                <MessageSquare className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-300 uppercase">WHATSAPP MESSENGER</div>
                <p className="text-[10px] text-slate-400">
                  Launching WhatsApp directly on your physical handset.
                </p>
                <button
                  onClick={() => window.open('whatsapp://', '_blank')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>LAUNCH WHATSAPP NOW</span>
                </button>
              </div>
            )}

            {activeApp === 'search' && (
              <div className="space-y-2 text-center p-2">
                <Search className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="text-xs font-bold text-cyan-300 uppercase">GOOGLE SEARCH</div>
                <button
                  onClick={() => window.open('https://google.com', '_blank')}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN SEARCH BROWSER</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Handset Hardware Triggers Matrix */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" />
            NATIVE DEVICE INTERACTION CONTROLS
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400]);
              }}
              className="p-3 bg-slate-950 border border-purple-500/30 hover:border-purple-400 rounded-xl flex items-center gap-2 text-purple-300 active:scale-95 transition-all"
            >
              <Vibrate className="w-4 h-4 text-purple-400" />
              <span>TEST VIBRATE</span>
            </button>

            <button
              onClick={toggleAlarm}
              className={`p-3 border rounded-xl flex items-center gap-2 active:scale-95 transition-all ${
                isAlertActive
                  ? 'bg-red-600 border-red-400 text-white animate-pulse'
                  : 'bg-slate-950 border-amber-500/30 text-amber-300'
              }`}
            >
              {isAlertActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isAlertActive ? 'STOP SIREN' : 'TRIGGER SIREN'}</span>
            </button>

            <button
              onClick={() => setIsTorchActive(!isTorchActive)}
              className={`p-3 border rounded-xl flex items-center gap-2 active:scale-95 transition-all ${
                isTorchActive
                  ? 'bg-amber-400 border-amber-200 text-slate-900 font-bold'
                  : 'bg-slate-950 border-cyan-500/30 text-cyan-300'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{isTorchActive ? 'TORCH OFF' : 'FLASH SCREEN'}</span>
            </button>

            <button
              onClick={() =>
                sendCommandToLaptop(
                  'theme_toggle',
                  'home',
                  'Theme synchronized between handset and laptop.'
                )
              }
              className="p-3 bg-slate-950 border border-emerald-500/30 hover:border-emerald-400 rounded-xl flex items-center gap-2 text-emerald-300 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>SYNC THEME</span>
            </button>
          </div>
        </div>

        {/* Gyroscope Orientation Telemetry */}
        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 text-[10px] font-mono flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>GYROSCOPE TELEMETRY:</span>
          </div>
          <div>
            β: {gyroValues.beta}° | γ: {gyroValues.gamma}°
          </div>
        </div>

        {/* Quick Commands sent back to laptop */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">
            SEND COMMAND BACK TO LAPTOP HUD
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[9px]">
            <button
              onClick={() => sendCommandToLaptop('unlock', 'home', 'Unlock authorized by phone.')}
              className="p-1.5 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded font-bold"
            >
              UNLOCK HUD
            </button>
            <button
              onClick={() => sendCommandToLaptop('lock', 'lock', 'Lockdown initiated from phone.')}
              className="p-1.5 bg-red-950 border border-red-500/40 text-red-300 rounded font-bold"
            >
              LOCKDOWN
            </button>
            <button
              onClick={() =>
                sendCommandToLaptop(
                  'diag',
                  'home',
                  'Executing diagnostic sweep from mobile node.'
                )
              }
              className="p-1.5 bg-purple-950 border border-purple-500/40 text-purple-300 rounded font-bold"
            >
              DIAGNOSTICS
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-[9px] text-slate-500 font-mono border-t border-slate-900">
        STARK TACTICAL MCP HANDSET // ENCRYPTED SESSION ACTIVE
      </footer>
    </div>
  );
};
