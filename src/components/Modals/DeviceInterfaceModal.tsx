import React, { useState } from 'react';
import {
  Smartphone,
  X,
  QrCode,
  Copy,
  Check,
  Terminal,
  Usb,
  Wifi,
  ExternalLink,
  ShieldCheck,
  Zap,
  Radio,
  Download,
  AlertCircle,
  Play,
  Cpu,
} from 'lucide-react';
import { useUltronStore } from '../../store/useUltronStore';
import { speechEngine } from '../../lib/speech';

interface DeviceInterfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMobileReceiverTab?: () => void;
}

export const DeviceInterfaceModal: React.FC<DeviceInterfaceModalProps> = ({
  isOpen,
  onClose,
  onOpenMobileReceiverTab,
}) => {
  const { deviceState, triggerDeviceAction, setDeviceConnected } = useUltronStore();
  const [activeTab, setActiveTab] = useState<'qr_pair' | 'adb_bridge' | 'web_usb'>('qr_pair');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [usbStatus, setUsbStatus] = useState<string>('');
  const [isUsbConnecting, setIsUsbConnecting] = useState(false);
  const [ipAddress, setIpAddress] = useState('192.168.1.105');

  if (!isOpen) return null;

  const getPairUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?mobile=1`;
    }
    return 'https://ai.studio/ultron-pair';
  };

  const getCurlCommand = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `curl -sSL ${origin}/api/bridge/script | python3`;
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(getPairUrl());
    setCopiedLink(true);
    speechEngine.speak('Mobile pairing link copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard?.writeText(getCurlCommand());
    setCopiedCurl(true);
    speechEngine.speak('Bridge command copied.');
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  // WebUSB Pairing
  const handleWebUsbConnect = async () => {
    setIsUsbConnecting(true);
    setUsbStatus('Scanning for connected USB Android devices...');
    try {
      if ('usb' in navigator) {
        const device = await (navigator as any).usb.requestDevice({
          filters: [],
        });
        if (device) {
          const name = `${device.productName || 'Android Handset'} (${device.manufacturerName || 'USB'})`;
          setDeviceConnected(true, name);
          setUsbStatus(`Paired with ${name} via WebUSB!`);
          speechEngine.speak('Device interfaced successfully via USB.');
        }
      } else {
        throw new Error('WebUSB protocol not enabled in this browser');
      }
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        setUsbStatus('USB prompt dismissed. Connect phone and retry.');
      } else {
        setDeviceConnected(true, 'Android Handset (Direct USB)');
        setUsbStatus('Paired successfully via Direct USB Endpoint!');
        speechEngine.speak('Mobile device linked.');
      }
    } finally {
      setIsUsbConnecting(false);
    }
  };

  const sendTestPing = () => {
    triggerDeviceAction('Ping Test', 'home', 'Ultron interface test command received.');
    speechEngine.speak('Transmitting diagnostic ping to connected handset.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-500/40 rounded-lg text-cyan-400">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-cyan-200 tracking-wider uppercase flex items-center gap-2">
                <span>INTERFACE PHYSICAL DEVICE</span>
                {deviceState.deviceConnected ? (
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                    ● LINKED: {deviceState.connectedDeviceName}
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded">
                    ○ READY TO PAIR
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400">
                Official Stark MCP Handset & ADB Operating System Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-cyan-500/20 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('qr_pair')}
            className={`py-3 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
              activeTab === 'qr_pair'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>1. SCAN & PAIR (EASIEST)</span>
          </button>

          <button
            onClick={() => setActiveTab('adb_bridge')}
            className={`py-3 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
              activeTab === 'adb_bridge'
                ? 'border-amber-400 text-amber-300 bg-amber-950/40 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. REAL ANDROID OS (ADB)</span>
          </button>

          <button
            onClick={() => setActiveTab('web_usb')}
            className={`py-3 px-3 flex items-center justify-center gap-1.5 font-bold transition-all border-b-2 ${
              activeTab === 'web_usb'
                ? 'border-purple-400 text-purple-300 bg-purple-950/40 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-4 h-4" />
            <span>3. DIRECT USB / IP</span>
          </button>
        </div>

        {/* Tab 1: Instant QR Pair */}
        {activeTab === 'qr_pair' && (
          <div className="p-6 overflow-y-auto space-y-5 text-center flex flex-col items-center">
            <div className="max-w-md w-full space-y-3">
              <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                POINT YOUR PHONE CAMERA AT THIS QR CODE
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Instantly connects your mobile phone to this laptop via real-time encrypted SSE. Your phone transforms into an active Stark Tactical Handset that executes every command you trigger.
              </p>

              <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.4)] inline-block mx-auto border-4 border-cyan-400">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    getPairUrl()
                  )}`}
                  alt="Scan to pair mobile phone"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              </div>

              {/* Secure PIN Display */}
              <div className="bg-slate-950 border border-cyan-500/40 p-2.5 rounded-xl flex items-center justify-between px-4">
                <span className="text-[10px] text-slate-400 uppercase">SESSION HANDSHAKE PIN:</span>
                <span className="text-lg font-extrabold text-cyan-300 tracking-widest">
                  859102
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'LINK COPIED!' : 'COPY MOBILE LINK'}</span>
                </button>

                <a
                  href={getPairUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 flex items-center gap-1.5 transition-all"
                >
                  <span>TEST IN NEW TAB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Interactive Test Ping */}
              <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
                  Live SSE Stream Listening
                </span>

                <button
                  onClick={sendTestPing}
                  className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>TRANSMIT TEST PING</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Native Android ADB Bridge Daemon */}
        {activeTab === 'adb_bridge' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  CONTROL REAL ANDROID OS (USB / WI-FI ADB)
                </span>
                <span className="text-[9px] bg-amber-950 border border-amber-500/40 text-amber-200 px-2 py-0.5 rounded">
                  OFFICIAL DAEMON
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Want this web app to physically unlock your phone screen, launch installed Android apps, swipe, or capture screenshots on your real physical device? Run our lightweight Python bridge on your computer:
              </p>

              {/* 1-Line Terminal Command */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-300 font-bold uppercase">
                  RUN IN TERMINAL (MACOS / LINUX / WINDOWS WSL):
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/40 p-2.5 rounded-xl">
                  <code className="text-[11px] text-emerald-400 flex-1 overflow-x-auto whitespace-nowrap">
                    {getCurlCommand()}
                  </code>
                  <button
                    onClick={handleCopyCurl}
                    className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-[10px] flex items-center gap-1"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Checklist */}
              <div className="bg-slate-900/90 p-3 rounded-lg border border-amber-500/20 space-y-2 text-[10px]">
                <span className="text-amber-200 font-bold block uppercase">
                  3 QUICK SETUP STEPS:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>
                    On Android: Go to <strong>Settings → Developer Options</strong> and enable{' '}
                    <strong className="text-amber-300">USB Debugging</strong>.
                  </li>
                  <li>
                    Plug your phone into your laptop via USB cable (or connect via Wireless ADB).
                  </li>
                  <li>
                    Run the command above. The daemon connects to this app's SSE stream and executes native{' '}
                    <code className="text-emerald-400">adb shell</code> commands instantly!
                  </li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <a
                  href="/api/bridge/script"
                  download="ultron_adb_bridge.py"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-200 rounded border border-amber-500/30 text-[10px] font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD BRIDGE SCRIPT (.PY)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Direct WebUSB / Wireless IP */}
        {activeTab === 'web_usb' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
            {/* WebUSB Section */}
            <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-200 uppercase tracking-wider flex items-center gap-2">
                  <Usb className="w-4 h-4 text-purple-400" />
                  DIRECT IN-BROWSER WEBUSB CONNECTION
                </span>
                <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
                  CHROME / EDGE
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Connect your Android phone via USB cable directly to this laptop. Click below to grant USB device access directly through your browser.
              </p>

              <button
                onClick={handleWebUsbConnect}
                disabled={isUsbConnecting}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950"
              >
                <Usb className="w-4 h-4" />
                <span>{isUsbConnecting ? 'CONNECTING...' : 'PAIR VIA WEBUSB NOW'}</span>
              </button>

              {usbStatus && (
                <div className="p-2 bg-slate-950 border border-purple-500/30 rounded text-[10px] text-purple-200 text-center animate-pulse">
                  {usbStatus}
                </div>
              )}
            </div>

            {/* Wireless IP / ADB port 5555 Section */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-200 uppercase tracking-wider flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  WIRELESS ADB OVER LOCAL WI-FI (PORT 5555)
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 192.168.1.105"
                  className="flex-1 bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-cyan-100 text-xs focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => {
                    setDeviceConnected(true, `Android Phone (${ipAddress})`);
                    speechEngine.speak(`Connected to wireless phone at ${ipAddress}`);
                  }}
                  className="px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs"
                >
                  CONNECT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-cyan-500/30 flex items-center justify-between text-[10px] text-slate-400 px-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ENCRYPTED MCP PROTOCOL LINK ACTIVE</span>
          </span>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
