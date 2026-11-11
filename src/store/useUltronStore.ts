export { type UltronTheme } from '../types';
import { create } from 'zustand';
import { mcpSyncManager } from '../lib/mcpSync';
import {
  UltronMode,
  UltronTheme,
  ActiveHUDPanel,
  GestureType,
  HandLandmarkData,
  OrbPhysics,
  AudioData,
  DiagnosticMetrics,
  ChatMessage,
  ThemeColors,
  DeviceState,
  DeviceAppType,
} from '../types';

export const THEME_PRESETS: Record<UltronTheme, ThemeColors> = {
  'neon-cyan': {
    primary: '#00f0ff',
    secondary: '#0088ff',
    glow: 'rgba(0, 240, 255, 0.6)',
    bgGlass: 'rgba(5, 20, 35, 0.75)',
    borderGlow: 'rgba(0, 240, 255, 0.4)',
    accent: '#7000ff',
    orbCoreHex: '#ffffff',
    orbPlasmaHex: '#00f0ff',
  },
  'iron-red': {
    primary: '#ff2a2a',
    secondary: '#ff9900',
    glow: 'rgba(255, 42, 42, 0.6)',
    bgGlass: 'rgba(35, 5, 5, 0.75)',
    borderGlow: 'rgba(255, 42, 42, 0.4)',
    accent: '#ffd700',
    orbCoreHex: '#fff5ea',
    orbPlasmaHex: '#ff2a2a',
  },
  'electric-purple': {
    primary: '#b026ff',
    secondary: '#e056fd',
    glow: 'rgba(176, 38, 255, 0.6)',
    bgGlass: 'rgba(25, 5, 35, 0.75)',
    borderGlow: 'rgba(176, 38, 255, 0.4)',
    accent: '#00f0ff',
    orbCoreHex: '#fbf0ff',
    orbPlasmaHex: '#b026ff',
  },
  'emerald-green': {
    primary: '#00ff88',
    secondary: '#00b894',
    glow: 'rgba(0, 255, 136, 0.6)',
    bgGlass: 'rgba(5, 35, 20, 0.75)',
    borderGlow: 'rgba(0, 255, 136, 0.4)',
    accent: '#0984e3',
    orbCoreHex: '#e8fff5',
    orbPlasmaHex: '#00ff88',
  },
  'stealth-white': {
    primary: '#e2e8f0',
    secondary: '#94a3b8',
    glow: 'rgba(226, 232, 240, 0.6)',
    bgGlass: 'rgba(15, 23, 42, 0.8)',
    borderGlow: 'rgba(226, 232, 240, 0.3)',
    accent: '#38bdf8',
    orbCoreHex: '#ffffff',
    orbPlasmaHex: '#cbd5e1',
  },
  'amber-gold': {
    primary: '#ffb703',
    secondary: '#fb8500',
    glow: 'rgba(255, 183, 3, 0.6)',
    bgGlass: 'rgba(35, 25, 5, 0.75)',
    borderGlow: 'rgba(255, 183, 3, 0.4)',
    accent: '#ff0055',
    orbCoreHex: '#fffdf0',
    orbPlasmaHex: '#ffb703',
  },
};

interface UltronStoreState {
  mode: UltronMode;
  theme: UltronTheme;
  energyLevel: number;
  activePanel: ActiveHUDPanel | null;
  isWebcamActive: boolean;
  isAudioReactive: boolean;
  isVoiceActive: boolean;
  isTargetLocked: boolean;
  isBooting: boolean;
  isDebugMode: boolean;
  isSoundEffectsEnabled: boolean;
  particleCount: number;
  shaderSpeed: number;

  orbPhysics: OrbPhysics;
  hands: HandLandmarkData[];
  lastDetectedGesture: GestureType;
  gestureConfidence: number;
  audioData: AudioData;
  diagnostics: DiagnosticMetrics;
  chatMessages: ChatMessage[];
  deviceState: DeviceState;

  // Actions
  setMode: (mode: UltronMode) => void;
  setTheme: (theme: UltronTheme) => void;
  setEnergyLevel: (level: number | ((prev: number) => number)) => void;
  setActivePanel: (panel: ActiveHUDPanel | null) => void;
  toggleWebcam: (active?: boolean) => void;
  toggleAudioReactive: (active?: boolean) => void;
  toggleVoice: (active?: boolean) => void;
  toggleTargetLock: (locked?: boolean) => void;
  setBooting: (booting: boolean) => void;
  toggleDebugMode: () => void;
  toggleSoundEffects: () => void;
  setParticleCount: (count: number) => void;
  setShaderSpeed: (speed: number) => void;

  updateOrbPhysics: (physics: Partial<OrbPhysics>) => void;
  updateHands: (hands: HandLandmarkData[]) => void;
  setGesture: (gesture: GestureType, confidence: number) => void;
  updateAudioData: (audio: Partial<AudioData>) => void;
  updateDiagnostics: (diag: Partial<DiagnosticMetrics>) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setDeviceConnected: (connected: boolean, deviceName?: string) => void;
  triggerDeviceAction: (
    actionName: string,
    targetApp: DeviceAppType,
    speechText: string
  ) => void;
  resetOrb: () => void;
}

export const useUltronStore = create<UltronStoreState>((set) => ({
  mode: 'IDLE',
  theme: 'neon-cyan',
  energyLevel: 88,
  activePanel: 'ai',
  isWebcamActive: false,
  isAudioReactive: false,
  isVoiceActive: false,
  isTargetLocked: false,
  isBooting: true,
  isDebugMode: false,
  isSoundEffectsEnabled: true,
  particleCount: 1500,
  shaderSpeed: 1.0,

  orbPhysics: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1.0,
    velocity: [0, 0, 0],
    stretch: 1.0,
    targetScale: 1.0,
    targetPos: [0, 0, 0],
  },

  hands: [],
  lastDetectedGesture: 'NONE',
  gestureConfidence: 0,

  audioData: {
    isListening: false,
    bass: 0,
    treble: 0,
    volume: 0,
    beatDetected: false,
    frequencyData: new Array(32).fill(0),
  },

  diagnostics: {
    cpuUsage: 28,
    ramUsage: 42,
    gpuLoad: 61,
    temperature: 46,
    fps: 60,
    neuralActivity: [30, 45, 80, 65, 90, 75, 40, 85, 95, 60],
    orbitalTargetDistance: 1.42,
    quantumFlux: 98.4,
    latencyMs: 18,
    latencyJitter: 2.1,
    healthAlerts: [
      {
        id: '1',
        timestamp: new Date().toLocaleTimeString(),
        level: 'optimal',
        message: 'Thermal state nominal (46°C). Latency 18ms via MCP protocol.',
        source: 'Thermal',
      },
      {
        id: '2',
        timestamp: new Date().toLocaleTimeString(),
        level: 'optimal',
        message: 'Head Gesture reticle locked on Vector Alpha-9.',
        source: 'Head',
      },
    ],
    headGesture: {
      pitch: 0,
      yaw: 0,
      roll: 0,
      reticleVector: 'AZ: 0° / EL: 0°',
      isPanning: false,
    },
    gazeFixation: {
      targetId: 'core_1',
      targetName: 'Orbital Arc Reactor Core',
      gazeX: 50,
      gazeY: 50,
      isLocked: true,
      zoomLevel: 1.0,
    },
    manualGesture: {
      activeGesture: 'HOVER',
      pinchScale: 1.0,
      rotationAngle: 0,
      mapScale: 1.0,
    },
    voiceIntegration: {
      isListening: false,
      lastTandemCommand: 'Diagnostics status query',
      gazeVoiceSynced: true,
    },
  },

  chatMessages: [
    {
      id: '1',
      sender: 'system',
      text: 'ULTRON PROTOCOL v9.4 INITIALIZED. Hand tracking & Voice matrix online.',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: '2',
      sender: 'ultron',
      text: 'Greetings. I am ULTRON. Point or gesture at the energy core to command system modules.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ],

  deviceState: {
    isLocked: true,
    currentApp: 'lock',
    batteryLevel: 94,
    deviceConnected: true,
    connectedDeviceName: 'STARK PHONE MARK 85 (Android 15)',
    mcpLogs: [
      '[MCP CORE]: Model Context Protocol device bridge online.',
      '[RACK LINK]: Connected to STARK PHONE MARK 85 (Wireless ADB / MCP)',
      '[STATUS]: Ready for voice, chat, or bare-hand gesture control.',
    ],
    lastActionTimestamp: 0,
  },

  setMode: (mode) =>
    set((state) => {
      let energy = state.energyLevel;
      let speed = state.shaderSpeed;
      if (mode === 'ATTACK') {
        energy = 100;
        speed = 2.5;
      } else if (mode === 'CHARGING') {
        speed = 1.8;
      } else if (mode === 'SLEEP' || mode === 'SHUTDOWN') {
        speed = 0.2;
      }
      return { mode, energyLevel: energy, shaderSpeed: speed };
    }),

  setTheme: (theme) => set({ theme }),

  setEnergyLevel: (level) =>
    set((state) => ({
      energyLevel:
        typeof level === 'function' ? level(state.energyLevel) : level,
    })),

  setActivePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? null : panel,
    })),

  toggleWebcam: (active) =>
    set((state) => ({
      isWebcamActive: active !== undefined ? active : !state.isWebcamActive,
    })),

  toggleAudioReactive: (active) =>
    set((state) => ({
      isAudioReactive:
        active !== undefined ? active : !state.isAudioReactive,
    })),

  toggleVoice: (active) =>
    set((state) => ({
      isVoiceActive: active !== undefined ? active : !state.isVoiceActive,
    })),

  toggleTargetLock: (locked) =>
    set((state) => ({
      isTargetLocked:
        locked !== undefined ? locked : !state.isTargetLocked,
    })),

  setBooting: (booting) => set({ isBooting: booting }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  toggleSoundEffects: () =>
    set((state) => ({ isSoundEffectsEnabled: !state.isSoundEffectsEnabled })),
  setParticleCount: (particleCount) => set({ particleCount }),
  setShaderSpeed: (shaderSpeed) => set({ shaderSpeed }),

  updateOrbPhysics: (physics) =>
    set((state) => ({
      orbPhysics: { ...state.orbPhysics, ...physics },
    })),

  updateHands: (hands) => set({ hands }),

  setGesture: (lastDetectedGesture, gestureConfidence) =>
    set({ lastDetectedGesture, gestureConfidence }),

  updateAudioData: (audio) =>
    set((state) => ({
      audioData: { ...state.audioData, ...audio },
    })),

  updateDiagnostics: (diag) =>
    set((state) => ({
      diagnostics: { ...state.diagnostics, ...diag },
    })),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          ...msg,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    })),

  setDeviceConnected: (connected, deviceName) =>
    set((state) => {
      const targetName = deviceName || state.deviceState.connectedDeviceName;
      if (connected) {
        mcpSyncManager.init();
        mcpSyncManager.broadcastPair(targetName);
      }
      return {
        deviceState: {
          ...state.deviceState,
          deviceConnected: connected,
          connectedDeviceName: targetName,
          mcpLogs: [
            `[MCP BRIDGE]: Device status updated: ${connected ? 'CONNECTED' : 'DISCONNECTED'} (${new Date().toLocaleTimeString()})`,
            ...state.deviceState.mcpLogs,
          ].slice(0, 25),
        },
      };
    }),

  triggerDeviceAction: (actionName, targetApp, speechText) =>
    set((state) => {
      const now = Date.now();
      // Throttle rapid gesture triggers (minimum 750ms between actions)
      if (now - state.deviceState.lastActionTimestamp < 750) {
        return state;
      }

      // Initialize cross-device sync engine
      mcpSyncManager.init();
      // Broadcast action to connected mobile devices / windows
      mcpSyncManager.broadcastAction(actionName, targetApp, speechText);

      // Perform haptic vibration feedback on real devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([120, 60, 120]);
        } catch (e) {
          // ignore
        }
      }

      const isLocking = targetApp === 'lock';
      const timestamp = new Date().toLocaleTimeString();
      const logMessage = `[MCP EXECUTOR]: Executed '${actionName}' -> Target State: ${targetApp.toUpperCase()} (${timestamp})`;

      if (speechText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = 1.05;
          utterance.pitch = 0.85;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          // ignore
        }
      }

      return {
        deviceState: {
          ...state.deviceState,
          isLocked: isLocking,
          currentApp: targetApp,
          lastActionTimestamp: now,
          mcpLogs: [logMessage, ...state.deviceState.mcpLogs].slice(0, 25),
        },
        chatMessages: speechText
          ? [
              ...state.chatMessages,
              {
                id: Math.random().toString(36).substring(2, 9),
                sender: 'ultron',
                text: `[MCP DEVICE]: ${speechText}`,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]
          : state.chatMessages,
      };
    }),

  resetOrb: () =>
    set({
      mode: 'IDLE',
      energyLevel: 88,
      orbPhysics: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1.0,
        velocity: [0, 0, 0],
        stretch: 1.0,
        targetScale: 1.0,
        targetPos: [0, 0, 0],
      },
    }),
}));
