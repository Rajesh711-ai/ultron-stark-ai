export type UltronMode =
  | 'IDLE'
  | 'SCANNING'
  | 'CHARGING'
  | 'ATTACK'
  | 'SLEEP'
  | 'WARNING'
  | 'ALERT'
  | 'SHUTDOWN'
  | 'STANDBY'
  | 'ACTIVE';

export type UltronTheme =
  | 'neon-cyan'
  | 'iron-red'
  | 'electric-purple'
  | 'emerald-green'
  | 'stealth-white'
  | 'amber-gold';

export type ActiveHUDPanel =
  | 'ai'
  | 'diagnostics'
  | 'files'
  | 'weather'
  | 'terminal'
  | 'settings'
  | 'music'
  | 'notes'
  | 'camera'
  | 'devices';

export type GestureType =
  | 'OPEN_PALM'
  | 'CLOSED_FIST'
  | 'PINCH'
  | 'SPREAD_FINGERS'
  | 'POINT'
  | 'SWIPE_LEFT'
  | 'SWIPE_RIGHT'
  | 'CIRCLE_MOTION'
  | 'TWO_HANDS_APART'
  | 'TWO_HANDS_TOGETHER'
  | 'HOLD_PALM'
  | 'NONE';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface HandLandmarkData {
  landmarks: Point3D[];
  gesture: GestureType;
  confidence: number;
  handSide: 'Left' | 'Right';
  isPinching: boolean;
  pinchPos: { x: number; y: number };
  wristPos: { x: number; y: number };
  spreadDistance: number;
}

export interface OrbPhysics {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  velocity: [number, number, number];
  stretch: number;
  targetScale: number;
  targetPos: [number, number, number];
}

export interface AudioData {
  isListening: boolean;
  bass: number;
  treble: number;
  volume: number;
  beatDetected: boolean;
  frequencyData: number[];
}

export interface SystemHealthAlert {
  id: string;
  timestamp: string;
  level: 'optimal' | 'warning' | 'alert';
  message: string;
  source: 'Thermal' | 'Network' | 'Gaze' | 'Head' | 'Gesture' | 'Voice';
}

export interface DiagnosticMetrics {
  cpuUsage: number;
  ramUsage: number;
  gpuLoad: number;
  temperature: number;
  fps: number;
  neuralActivity: number[];
  orbitalTargetDistance: number;
  quantumFlux: number;
  latencyMs: number;
  latencyJitter: number;
  healthAlerts: SystemHealthAlert[];
  headGesture: {
    pitch: number;
    yaw: number;
    roll: number;
    reticleVector: string;
    isPanning: boolean;
  };
  gazeFixation: {
    targetId: string;
    targetName: string;
    gazeX: number;
    gazeY: number;
    isLocked: boolean;
    zoomLevel: number;
  };
  manualGesture: {
    activeGesture: string;
    pinchScale: number;
    rotationAngle: number;
    mapScale: number;
  };
  voiceIntegration: {
    isListening: boolean;
    lastTandemCommand: string;
    gazeVoiceSynced: boolean;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ultron' | 'system';
  text: string;
  timestamp: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  glow: string;
  bgGlass: string;
  borderGlow: string;
  accent: string;
  orbCoreHex: string;
  orbPlasmaHex: string;
}

export type DeviceAppType = 'home' | 'youtube' | 'search' | 'camera' | 'lock';

export interface DeviceState {
  isLocked: boolean;
  currentApp: DeviceAppType;
  batteryLevel: number;
  deviceConnected: boolean;
  connectedDeviceName: string;
  mcpLogs: string[];
  lastActionTimestamp: number;
}
