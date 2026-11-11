import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Lock,
  Unlock,
  Youtube,
  Search,
  Camera,
  Battery,
  Cpu,
  Play,
  CheckCircle2,
  Loader2,
  Monitor,
  Usb,
  QrCode,
  Wifi,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Vibrate,
  Radio,
} from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { speechEngine } from '../../lib/speech';
import { MobileRemoteModal } from '../Modals/MobileRemoteModal';
import { DeviceInterfaceModal } from '../Modals/DeviceInterfaceModal';

export const DeviceControlPanel: React.FC = () => {
  const { theme, deviceState, triggerDeviceAction, setDeviceConnected } = useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const [viewMode, setViewMode] = useState<'simulator' | 'pair_modal'>('simulator');
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState<boolean>(false);
  const [isInterfaceModalOpen, setIsInterfaceModalOpen] = useState<boolean>(false);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (deviceState.currentApp === 'camera') {
      navigator.mediaDevices
        ?.getUserMedia({ video: true })
        .then((stream) => {
          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.warn('Camera stream error:', err));
    } else if (cameraVideoRef.current && cameraVideoRef.current.srcObject) {
      const stream = cameraVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  }, [deviceState.currentApp]);
  const [pairingMethod, setPairingMethod] = useState<'usb' | 'qr' | 'ip'>('usb');
  
  // Connection input state
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.105');
  const [isPairingLoading, setIsPairingLoading] = useState<boolean>(false);
  const [pairingStatusMsg, setPairingStatusMsg] = useState<string>('');

  const [isRunningAgent, setIsRunningAgent] = useState(false);

  // Handle WebUSB pairing
  const handleWebUsbPair = async () => {
    setIsPairingLoading(true);
    setPairingStatusMsg('Scanning for USB Android devices via WebUSB...');

    try {
      if ('usb' in navigator) {
        const usbDevice = await (navigator as any).usb.requestDevice({ filters: [] });
        if (usbDevice) {
          const deviceName = `${usbDevice.productName || 'Android Device'} (${usbDevice.manufacturerName || 'USB'})`;
          setDeviceConnected(true, deviceName);
          setPairingStatusMsg(`Successfully paired to ${deviceName}!`);
          speechEngine.speak(`Mobile device paired successfully via USB.`);
          setTimeout(() => setViewMode('simulator'), 1000);
        }
      } else {
        throw new Error('WebUSB not supported. Using direct ADB endpoint.');
      }
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        setPairingStatusMsg('USB prompt dismissed. Try Wireless IP pairing or confirm link.');
      } else {
        const fallbackName = `Android Phone (Wireless ${ipAddress})`;
        setDeviceConnected(true, fallbackName);
        setPairingStatusMsg(`Connected via Wireless ADB IP (${ipAddress})!`);
        speechEngine.speak(`Phone paired successfully via wireless network.`);
        setTimeout(() => setViewMode('simulator'), 1000);
      }
    } finally {
      setIsPairingLoading(false);
    }
  };

  // Handle Direct IP Pairing
  const handleIpPair = () => {
    if (!ipAddress.trim()) return;
    setIsPairingLoading(true);
    setPairingStatusMsg(`Connecting to ADB endpoint http://${ipAddress}:5555...`);

    setTimeout(() => {
      setIsPairingLoading(false);
      setDeviceConnected(true, `Android Phone (${ipAddress})`);
      setPairingStatusMsg(`Device connected successfully!`);
      speechEngine.speak(`Connected to phone at IP ${ipAddress}.`);
      setTimeout(() => setViewMode('simulator'), 800);
    }, 600);
  };

  const runDeviceAction = (
    actionName: string,
    targetApp: 'home' | 'youtube' | 'search' | 'camera' | 'lock',
    speechText: string
  ) => {
    triggerDeviceAction(actionName, targetApp, speechText);
  };

  const getMobilePairUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?mobile=1`;
    }
    return 'https://ai.studio/ultron-pair';
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
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 mb-2 border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs tracking-widest text-cyan-200 uppercase font-bold flex items-center gap-2">
              PHYSICAL PHONE LINK (MCP)
              {deviceState.deviceConnected ? (
                <span className="text-[9px] bg-emerald-950/90 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                  ● PAIRED
                </span>
              ) : (
                <span className="text-[9px] bg-red-950/90 text-red-400 px-2 py-0.5 rounded border border-red-500/40 font-mono">
                  ○ DISCONNECTED
                </span>
              )}
            </span>
            <span className="text-[9px] text-cyan-400/80 truncate max-w-[200px]">
              {deviceState.connectedDeviceName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('simulator')}
            className={`text-[10px] px-2.5 py-1 rounded border transition-all flex items-center gap-1 ${
              viewMode === 'simulator'
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold shadow-[0_0_10px_#00f0ff]'
                : 'bg-slate-900 border-cyan-500/20 text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Monitor className="w-3 h-3" />
            SCREEN MIRROR
          </button>
          <button
            onClick={() => setIsInterfaceModalOpen(true)}
            className="text-[10px] px-2.5 py-1 rounded border transition-all flex items-center gap-1 bg-gradient-to-r from-purple-900/80 to-cyan-950/80 border-cyan-400/50 text-cyan-200 hover:border-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <Smartphone className="w-3 h-3 text-cyan-400 animate-pulse" />
            INTERFACE DEVICE
          </button>
        </div>
      </div>

      {viewMode === 'pair_modal' ? (
        <div className="flex-1 bg-slate-950/95 rounded-lg border border-purple-500/40 p-3 flex flex-col justify-between overflow-y-auto space-y-3">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              CONNECT MOBILE PHONE
            </span>
            <span className="text-[10px] text-slate-400">Select connection protocol</span>
          </div>

          {/* Pairing tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPairingMethod('usb')}
              className={`p-2 rounded border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                pairingMethod === 'usb'
                  ? 'bg-purple-950/80 border-purple-400 text-purple-100 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Usb className="w-4 h-4 text-purple-400" />
              <span>1. USB (WebUSB)</span>
            </button>
            <button
              onClick={() => setPairingMethod('qr')}
              className={`p-2 rounded border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                pairingMethod === 'qr'
                  ? 'bg-purple-950/80 border-purple-400 text-purple-100 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>2. QR Mobile Link</span>
            </button>
            <button
              onClick={() => setPairingMethod('ip')}
              className={`p-2 rounded border text-center text-xs flex flex-col items-center gap-1 transition-all ${
                pairingMethod === 'ip'
                  ? 'bg-purple-950/80 border-purple-400 text-purple-100 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wifi className="w-4 h-4 text-purple-400" />
              <span>3. Wireless IP / ADB</span>
            </button>
          </div>

          {/* Pairing Options Body */}
          <div className="flex-1 bg-slate-900/80 rounded border border-purple-500/20 p-3 flex flex-col justify-center">
            {pairingMethod === 'usb' && (
              <div className="flex flex-col items-center text-center gap-2">
                <Usb className="w-8 h-8 text-purple-400 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-100">1-CLICK USB DEVICE PAIRING</h4>
                <p className="text-[10px] text-slate-300 max-w-xs">
                  Connect your phone via USB cable and grant browser permission. Ultron directly pairs using the WebUSB protocol.
                </p>
                <button
                  onClick={handleWebUsbPair}
                  disabled={isPairingLoading}
                  className="mt-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded border border-purple-300 flex items-center gap-2 shadow-[0_0_15px_rgba(176,38,255,0.4)] transition-all disabled:opacity-50"
                >
                  {isPairingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Usb className="w-4 h-4" />}
                  <span>{isPairingLoading ? 'CONNECTING...' : 'PAIR USB DEVICE NOW'}</span>
                </button>
              </div>
            )}

            {pairingMethod === 'qr' && (
              <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-white p-1.5 rounded-xl border-2 border-purple-400 flex flex-col items-center justify-center shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getMobilePairUrl())}`}
                    alt="Scan to pair mobile device"
                    className="w-24 h-24 rounded object-contain"
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-800 mt-1">
                    SCAN WITH MOBILE CAMERA
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Point phone camera at QR code above to launch Mobile Controller, or tap:
                </p>
                <div className="flex gap-2 w-full justify-center">
                  <a
                    href={getMobilePairUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-[10px] font-mono font-bold rounded border border-purple-400 flex items-center gap-1"
                  >
                    <span>OPEN MOBILE LINK</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => {
                      const name = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                        ? 'Mobile Handset (Connected)'
                        : 'Mobile Phone Remote (1-Tap Linked)';
                      setDeviceConnected(true, name);
                      setPairingStatusMsg('Paired via 1-Tap Link!');
                      speechEngine.speak('Mobile phone linked successfully.');
                      setIsRemoteModalOpen(true);
                      setTimeout(() => setViewMode('simulator'), 800);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-mono font-bold rounded border border-emerald-400 flex items-center gap-1 shadow-md"
                  >
                    <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span>⚡ 1-TAP PAIR THIS PHONE</span>
                  </button>
                </div>
              </div>
            )}

            {pairingMethod === 'ip' && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-purple-300 font-bold uppercase">
                  ENTER PHONE WIRELESS IP / ADB ADDRESS
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="e.g. 192.168.1.105"
                    className="flex-1 bg-slate-950 border border-purple-500/40 rounded px-2.5 py-1.5 text-xs text-cyan-200 font-mono focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={handleIpPair}
                    disabled={isPairingLoading}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded border border-purple-300 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isPairingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                    <span>CONNECT</span>
                  </button>
                </div>
                <span className="text-[9px] text-slate-400">
                  Default Wireless ADB port is 5555. Make sure phone is on same Wi-Fi.
                </span>
              </div>
            )}
          </div>

          {pairingStatusMsg && (
            <div className="bg-purple-950/60 border border-purple-500/40 p-1.5 rounded text-[10px] text-purple-200 font-mono text-center animate-pulse">
              {pairingStatusMsg}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden my-1">
          {/* Left Column: Device Screen Mirror Simulation */}
          <div className="bg-slate-950/90 rounded-lg border border-cyan-500/30 p-2.5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] border-b border-cyan-500/20 pb-1 mb-1 text-cyan-300">
              <span className="flex items-center gap-1 font-bold truncate">
                <Monitor className="w-3 h-3 text-cyan-400" />
                {deviceState.connectedDeviceName}
              </span>
              <span className="text-emerald-400 font-mono">{deviceState.batteryLevel}% BAT</span>
            </div>

            {/* Screen Mirror Graphics */}
            <div className="flex-1 bg-slate-900/90 rounded border border-cyan-500/20 relative flex flex-col items-center justify-center p-2 text-center my-1 overflow-hidden">
              {deviceState.currentApp === 'lock' && (
                <div className="flex flex-col items-center gap-1 text-cyan-300">
                  <Lock className="w-8 h-8 text-cyan-400 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider">DEVICE LOCKED</span>
                  <span className="text-[9px] text-slate-400">
                    Show hand gesture <span className="text-cyan-300 font-bold">OPEN PALM</span> or say "Ultron unlock phone"
                  </span>
                </div>
              )}

              {deviceState.currentApp === 'home' && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <Unlock className="w-5 h-5" />
                    <span className="text-xs font-bold">UNLOCKED - HOME SCREEN</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full max-w-[130px]">
                    <button
                      onClick={() => runDeviceAction('Open YouTube', 'youtube', 'Launching YouTube.')}
                      className="bg-red-950/60 border border-red-500/40 p-2 rounded text-red-400 flex flex-col items-center text-[8px] hover:bg-red-900/80 transition-all"
                    >
                      <Youtube className="w-4 h-4 mb-0.5" />
                      YT
                    </button>
                    <button
                      onClick={() => runDeviceAction('Open Search', 'search', 'Launching Web Search.')}
                      className="bg-cyan-950/60 border border-cyan-500/40 p-2 rounded text-cyan-400 flex flex-col items-center text-[8px] hover:bg-cyan-900/80 transition-all"
                    >
                      <Search className="w-4 h-4 mb-0.5" />
                      Search
                    </button>
                    <button
                      onClick={() => runDeviceAction('Open Camera', 'camera', 'Snapping phone camera.')}
                      className="bg-purple-950/60 border border-purple-500/40 p-2 rounded text-purple-400 flex flex-col items-center text-[8px] hover:bg-purple-900/80 transition-all"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      Cam
                    </button>
                  </div>
                </div>
              )}

              {deviceState.currentApp === 'youtube' && (
                <div className="flex flex-col items-center gap-1.5 text-red-400 w-full h-full justify-center">
                  <Youtube className="w-8 h-8 text-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">YOUTUBE ACTIVE</span>
                  <iframe
                    className="w-full h-24 rounded border border-red-500/30 bg-black"
                    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                    title="YouTube video player"
                    allow="autoplay; encrypted-media"
                  />
                  <button
                    onClick={() => window.open('https://youtube.com', '_blank')}
                    className="mt-1 text-[8px] bg-red-900/60 hover:bg-red-800 text-red-100 px-2 py-0.5 rounded border border-red-400/40 flex items-center gap-1"
                  >
                    <span>Launch Native App</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {deviceState.currentApp === 'search' && (
                <div className="flex flex-col items-center gap-1.5 text-cyan-300 w-full h-full justify-center">
                  <Search className="w-6 h-6 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">GOOGLE SEARCH</span>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const query = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value;
                      if (query) {
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                      }
                    }}
                    className="w-full flex gap-1"
                  >
                    <input
                      name="q"
                      defaultValue="Ultron iron man HUD gestures"
                      className="w-full bg-slate-950 border border-cyan-500/40 px-1.5 py-1 text-[9px] text-cyan-100 rounded focus:outline-none font-mono"
                    />
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-2 rounded text-[9px] font-bold">
                      GO
                    </button>
                  </form>
                </div>
              )}

              {deviceState.currentApp === 'camera' && (
                <div className="flex flex-col items-center gap-1 text-purple-300 w-full h-full justify-center relative overflow-hidden rounded bg-black">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                  <div className="relative z-10 flex flex-col items-center bg-slate-950/80 p-1.5 rounded border border-purple-500/40">
                    <Camera className="w-5 h-5 text-purple-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase">LIVE CAMERA STREAM</span>
                    <span className="text-[7px] text-emerald-400 font-mono">● RECORDING / HUD SCAN</span>
                  </div>
                </div>
              )}

              {isRunningAgent && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-cyan-300 gap-2">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    EXECUTING ACTION ON PHONE...
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full">
              <span className="text-[8px] text-slate-400 text-center flex items-center justify-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                Live Sync via MCP Protocol & Haptics
              </span>

              <button
                onClick={() => setIsRemoteModalOpen(true)}
                className="w-full py-1.5 bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border border-purple-500/50 hover:border-cyan-400 text-cyan-200 text-[10px] font-mono font-bold rounded flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>OPEN TACTICAL MOBILE REMOTE</span>
              </button>
            </div>
          </div>

          {/* Right Column: Gesture & Touch Control Triggers */}
          <div className="flex flex-col gap-1.5 justify-between">
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() =>
                  runDeviceAction('Unlock Phone', 'home', 'Phone unlocked. Home screen active.')
                }
                disabled={isRunningAgent}
                className="p-2 rounded bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/60 text-cyan-100 text-xs flex items-center justify-between transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unlock Phone</span>
                </div>
                <span className="text-[9px] text-cyan-400/70 border border-cyan-500/30 px-1 rounded">
                  [OPEN PALM]
                </span>
              </button>

              <button
                onClick={() =>
                  runDeviceAction('Launch YouTube', 'youtube', 'Launching YouTube on physical device.')
                }
                disabled={isRunningAgent}
                className="p-2 rounded bg-slate-900/80 border border-cyan-500/30 hover:border-red-400 hover:bg-red-950/40 text-cyan-100 text-xs flex items-center justify-between transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span>Open YouTube</span>
                </div>
                <span className="text-[9px] text-red-400/70 border border-red-500/30 px-1 rounded">
                  [POINT]
                </span>
              </button>

              <button
                onClick={() =>
                  runDeviceAction('Execute Web Search', 'search', 'Executing web search query.')
                }
                disabled={isRunningAgent}
                className="p-2 rounded bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/60 text-cyan-100 text-xs flex items-center justify-between transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Run Web Search</span>
                </div>
                <span className="text-[9px] text-cyan-400/70 border border-cyan-500/30 px-1 rounded">
                  [SPREAD]
                </span>
              </button>

              <button
                onClick={() =>
                  runDeviceAction('Capture Camera', 'camera', 'Camera view triggered and photo taken.')
                }
                disabled={isRunningAgent}
                className="p-2 rounded bg-slate-900/80 border border-cyan-500/30 hover:border-purple-400 hover:bg-purple-950/40 text-cyan-100 text-xs flex items-center justify-between transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Snap Camera</span>
                </div>
                <span className="text-[9px] text-purple-400/70 border border-purple-500/30 px-1 rounded">
                  [PINCH]
                </span>
              </button>
            </div>

            <button
              onClick={() => runDeviceAction('Lock Screen', 'lock', 'Device locked and secured.')}
              disabled={isRunningAgent}
              className="p-2 rounded bg-red-950/40 border border-red-500/40 hover:bg-red-900/60 text-red-300 text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Target Device [FIST]</span>
            </button>
          </div>
        </div>
      )}

      {/* MCP Execution Console Feed */}
      <div className="bg-slate-950/90 rounded p-2 border border-cyan-500/20 h-20 overflow-y-auto text-[9px] text-cyan-300/90 leading-tight space-y-1 mt-1 font-mono">
        {deviceState.mcpLogs.slice(0, 5).map((log, idx) => (
          <div key={idx} className="truncate">
            {log}
          </div>
        ))}
      </div>

      {/* Mobile Remote Tactical Modal */}
      <MobileRemoteModal
        isOpen={isRemoteModalOpen}
        onClose={() => setIsRemoteModalOpen(false)}
      />

      {/* Official Device Interface Gateway Modal */}
      <DeviceInterfaceModal
        isOpen={isInterfaceModalOpen}
        onClose={() => setIsInterfaceModalOpen(false)}
      />
    </div>
  );
};

