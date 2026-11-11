import React, { useState, useEffect } from 'react';
import { Smartphone, Zap, Monitor } from 'lucide-react';
import { UltronScene } from './components/3D/UltronScene';
import { IronManHUD } from './components/HUD/IronManHUD';
import { BootSequence } from './components/Modals/BootSequence';
import { GestureTutorial } from './components/Modals/GestureTutorial';
import { ScreenshotModal } from './components/Modals/ScreenshotModal';
import { MobileRemoteModal } from './components/Modals/MobileRemoteModal';
import { DeviceInterfaceModal } from './components/Modals/DeviceInterfaceModal';
import { MobileHandsetReceiver } from './components/Mobile/MobileHandsetReceiver';
import { useUltronStore } from './store/useUltronStore';
import { mcpSyncManager } from './lib/mcpSync';
import { speechEngine } from './lib/speech';

export default function App() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isScreenshotOpen, setIsScreenshotOpen] = useState(false);
  const [isMobileRemoteOpen, setIsMobileRemoteOpen] = useState(false);
  const [isDeviceInterfaceOpen, setIsDeviceInterfaceOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'handset_receiver'>('desktop');

  const { isDebugMode, mode, energyLevel, lastDetectedGesture, orbPhysics, setDeviceConnected, deviceState } =
    useUltronStore();

  useEffect(() => {
    // Initialize cross-device sync engine
    mcpSyncManager.init();

    // Check if app is accessed directly from a mobile phone or via mobile QR URL
    if (typeof window !== 'undefined') {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isMobileQuery = window.location.search.includes('mobile=1') || window.location.search.includes('mode=device');

      if (isMobileUA || isMobileQuery) {
        setViewMode('handset_receiver');
        const phoneType = navigator.userAgent.includes('iPhone')
          ? 'Apple iPhone Handset'
          : navigator.userAgent.includes('Android')
          ? 'Android Mobile Phone'
          : 'Tactical Handset (Linked)';

        setDeviceConnected(true, phoneType);
        speechEngine.speak('Mobile handset receiver online. Ready for laptop commands.');
      }
    }
  }, []);

  // If in Handset Receiver mode (e.g. on user's phone)
  if (viewMode === 'handset_receiver') {
    return (
      <MobileHandsetReceiver
        onSwitchToDesktopMode={() => setViewMode('desktop')}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Floating Instant Device Interface Bar */}
      <div className="pointer-events-auto absolute top-2 right-1/2 translate-x-1/2 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsDeviceInterfaceOpen(true)}
          className="px-3.5 py-1.5 bg-gradient-to-r from-purple-900/95 via-slate-900/95 to-cyan-900/95 hover:from-purple-800 hover:to-cyan-800 text-cyan-200 text-xs font-mono font-bold rounded-full border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.45)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Smartphone className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>
            {deviceState.deviceConnected
              ? `📱 ${deviceState.connectedDeviceName} [ONLINE]`
              : '⚡ INTERFACE PHYSICAL PHONE / ADB'}
          </span>
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        </button>

        <button
          onClick={() => setViewMode('handset_receiver')}
          title="Preview Handset Receiver Mode"
          className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-full border border-slate-700 flex items-center gap-1 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Phone Mode</span>
        </button>
      </div>

      {/* 3D Holographic WebGL Scene */}
      <UltronScene />

      {/* Iron Man HUD Overlay */}
      <IronManHUD
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenScreenshot={() => setIsScreenshotOpen(true)}
        onOpenDeviceInterface={() => setIsDeviceInterfaceOpen(true)}
      />

      {/* Startup Boot Sequence */}
      <BootSequence />

      {/* Gesture Tutorial Guide */}
      <GestureTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Screenshot Capture Modal */}
      <ScreenshotModal
        isOpen={isScreenshotOpen}
        onClose={() => setIsScreenshotOpen(false)}
      />

      {/* Interface Device Official Gateway Modal */}
      <DeviceInterfaceModal
        isOpen={isDeviceInterfaceOpen}
        onClose={() => setIsDeviceInterfaceOpen(false)}
        onOpenMobileReceiverTab={() => setViewMode('handset_receiver')}
      />

      {/* Mobile Tactical Remote Controller Modal */}
      <MobileRemoteModal
        isOpen={isMobileRemoteOpen}
        onClose={() => setIsMobileRemoteOpen(false)}
      />

      {/* Developer Debug Overlay */}
      {isDebugMode && (
        <div className="pointer-events-auto absolute top-16 left-4 z-40 bg-purple-950/90 border border-purple-500/50 p-3 rounded-xl text-[10px] font-mono text-purple-200 max-w-xs shadow-2xl backdrop-blur-md">
          <div className="font-bold border-b border-purple-500/30 pb-1 mb-2 text-purple-300">
            DEBUG STATE INSPECTOR
          </div>
          <div>MODE: {mode}</div>
          <div>ENERGY: {energyLevel.toFixed(1)}%</div>
          <div>GESTURE: {lastDetectedGesture}</div>
          <div>
            POSITION: [{orbPhysics.position.map((n) => n.toFixed(2)).join(', ')}]
          </div>
          <div>SCALE: {orbPhysics.scale.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
