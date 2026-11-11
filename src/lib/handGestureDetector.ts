import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useUltronStore } from '../store/useUltronStore';
import { GestureType, HandLandmarkData, Point3D } from '../types';

export class HandGestureEngine {
  private handLandmarker: HandLandmarker | null = null;
  private isLoaded = false;
  private lastVideoTime = -1;
  private gestureHistory: GestureType[] = [];
  private prevWristPos: { x: number; y: number } | null = null;
  private prevHandsLandmarks: Map<number, Point3D[]> = new Map();

  public async initialize(): Promise<boolean> {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      this.isLoaded = true;
      console.log('[MediaPipe HandLandmarker initialized successfully]');
      return true;
    } catch (err) {
      console.warn('Failed to initialize MediaPipe HandLandmarker:', err);
      return false;
    }
  }

  public detect(video: HTMLVideoElement, timestamp: number) {
    if (!this.isLoaded || !this.handLandmarker) return;

    if (video.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = video.currentTime;

    try {
      const results = this.handLandmarker.detectForVideo(video, timestamp);
      const handsData: HandLandmarkData[] = [];

      if (results.landmarks && results.landmarks.length > 0) {
        results.landmarks.forEach((rawLandmarks, handIdx) => {
          const handSide =
            results.handedness && results.handedness[handIdx]
              ? (results.handedness[handIdx][0].categoryName as 'Left' | 'Right')
              : 'Right';

          // EMA position smoothing
          const smoothedLandmarks = this.smoothLandmarks(
            handIdx,
            rawLandmarks as Point3D[]
          );

          // Calculate gesture
          const { gesture, confidence, isPinching, pinchPos, spreadDist } =
            this.recognizeGesture(smoothedLandmarks);

          handsData.push({
            landmarks: smoothedLandmarks,
            gesture,
            confidence,
            handSide,
            isPinching,
            pinchPos,
            wristPos: {
              x: smoothedLandmarks[0].x,
              y: smoothedLandmarks[0].y,
            },
            spreadDistance: spreadDist,
          });
        });

        // Evaluate two-hand gestures if 2 hands present
        let primaryGesture = handsData[0].gesture;
        let primaryConfidence = handsData[0].confidence;

        if (handsData.length >= 2) {
          const wristDist = Math.hypot(
            handsData[0].wristPos.x - handsData[1].wristPos.x,
            handsData[0].wristPos.y - handsData[1].wristPos.y
          );

          if (wristDist > 0.6) {
            primaryGesture = 'TWO_HANDS_APART';
            primaryConfidence = 0.95;
          } else if (wristDist < 0.2) {
            primaryGesture = 'TWO_HANDS_TOGETHER';
            primaryConfidence = 0.92;
          }
        }

        // Apply history smoothing to reduce flickers
        const finalGesture = this.smoothGestureHistory(primaryGesture);

        useUltronStore.getState().updateHands(handsData);
        useUltronStore.getState().setGesture(finalGesture, primaryConfidence);

        // React to gesture in store
        this.applyGestureEffects(finalGesture, handsData);
      } else {
        useUltronStore.getState().updateHands([]);
        useUltronStore.getState().setGesture('NONE', 0);
      }
    } catch (e) {
      console.warn('Detection error:', e);
    }
  }

  private smoothLandmarks(handIdx: number, current: Point3D[]): Point3D[] {
    const prev = this.prevHandsLandmarks.get(handIdx);
    if (!prev || prev.length !== current.length) {
      this.prevHandsLandmarks.set(handIdx, current);
      return current;
    }

    const alpha = 0.45; // EMA weight
    const smoothed = current.map((pt, i) => ({
      x: prev[i].x + alpha * (pt.x - prev[i].x),
      y: prev[i].y + alpha * (pt.y - prev[i].y),
      z: prev[i].z + alpha * (pt.z - prev[i].z),
    }));

    this.prevHandsLandmarks.set(handIdx, smoothed);
    return smoothed;
  }

  private recognizeGesture(lm: Point3D[]): {
    gesture: GestureType;
    confidence: number;
    isPinching: boolean;
    pinchPos: { x: number; y: number };
    spreadDist: number;
  } {
    const wrist = lm[0];
    const thumbTip = lm[4];
    const indexTip = lm[8];
    const middleTip = lm[12];
    const ringTip = lm[16];
    const pinkyTip = lm[20];

    const indexPip = lm[6];
    const middlePip = lm[10];
    const ringPip = lm[14];
    const pinkyPip = lm[18];

    // Distance helpers
    const dist = (p1: Point3D, p2: Point3D) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);

    // Pinch check (Thumb tip to Index tip)
    const pinchDist = dist(thumbTip, indexTip);
    const isPinching = pinchDist < 0.08;
    const pinchPos = {
      x: (thumbTip.x + indexTip.x) / 2,
      y: (thumbTip.y + indexTip.y) / 2,
    };

    // Finger extensions
    const isIndexExt = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.15;
    const isMiddleExt = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.15;
    const isRingExt = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.15;
    const isPinkyExt = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.15;

    // Finger spread distance
    const spreadDist =
      dist(indexTip, middleTip) +
      dist(middleTip, ringTip) +
      dist(ringTip, pinkyTip);

    // Swipe detection via wrist velocity
    let isSwipeLeft = false;
    let isSwipeRight = false;
    if (this.prevWristPos) {
      const dx = wrist.x - this.prevWristPos.x;
      if (dx > 0.08) isSwipeRight = true;
      else if (dx < -0.08) isSwipeLeft = true;
    }
    this.prevWristPos = { x: wrist.x, y: wrist.y };

    let gesture: GestureType = 'NONE';
    let confidence = 0.8;

    if (isSwipeLeft) {
      gesture = 'SWIPE_LEFT';
      confidence = 0.9;
    } else if (isSwipeRight) {
      gesture = 'SWIPE_RIGHT';
      confidence = 0.9;
    } else if (isPinching) {
      gesture = 'PINCH';
      confidence = 0.95;
    } else if (isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt) {
      gesture = 'POINT';
      confidence = 0.92;
    } else if (isIndexExt && isMiddleExt && isRingExt && isPinkyExt) {
      if (spreadDist > 0.35) {
        gesture = 'SPREAD_FINGERS';
        confidence = 0.9;
      } else {
        gesture = 'OPEN_PALM';
        confidence = 0.88;
      }
    } else if (!isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt) {
      gesture = 'CLOSED_FIST';
      confidence = 0.9;
    }

    return { gesture, confidence, isPinching, pinchPos, spreadDist };
  }

  private smoothGestureHistory(current: GestureType): GestureType {
    this.gestureHistory.push(current);
    if (this.gestureHistory.length > 5) this.gestureHistory.shift();

    const counts: Record<string, number> = {};
    this.gestureHistory.forEach((g) => {
      counts[g] = (counts[g] || 0) + 1;
    });

    let topGesture = current;
    let maxCount = 0;
    Object.entries(counts).forEach(([g, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topGesture = g as GestureType;
      }
    });

    return topGesture;
  }

  private applyGestureEffects(
    gesture: GestureType,
    hands: HandLandmarkData[]
  ) {
    const store = useUltronStore.getState();

    switch (gesture) {
      case 'OPEN_PALM':
        if (store.mode === 'SLEEP' || store.mode === 'SHUTDOWN') {
          store.setMode('IDLE');
        }
        if (store.deviceState.isLocked) {
          store.triggerDeviceAction('Hand Gesture: Open Palm', 'home', 'Open Palm recognized. Unlocking mobile device.');
        }
        break;

      case 'CLOSED_FIST':
        if (store.mode !== 'SLEEP') {
          store.setMode('SLEEP');
        }
        if (!store.deviceState.isLocked) {
          store.triggerDeviceAction('Hand Gesture: Closed Fist', 'lock', 'Closed Fist recognized. Locking mobile device.');
        }
        break;

      case 'PINCH':
        // Grab & drag orb to hand coordinates
        if (hands.length > 0) {
          const hand = hands[0];
          // Map hand coords [0..1] to world space [-2..2, -2..2]
          const targetX = (hand.pinchPos.x - 0.5) * -4;
          const targetY = (0.5 - hand.pinchPos.y) * 3;
          store.updateOrbPhysics({
            targetPos: [targetX, targetY, 0],
            stretch: 1.25,
          });
        }
        if (store.deviceState.currentApp !== 'camera' && !store.deviceState.isLocked) {
          store.triggerDeviceAction('Hand Gesture: Pinch', 'camera', 'Pinch gesture recognized. Snapping photo on mobile camera.');
        }
        break;

      case 'SPREAD_FINGERS':
        // Expand orb
        store.updateOrbPhysics({ targetScale: 1.5 });
        store.setEnergyLevel((e) => Math.min(100, e + 0.5));
        if (store.deviceState.currentApp === 'home' && !store.deviceState.isLocked) {
          store.triggerDeviceAction('Hand Gesture: Spread Fingers', 'search', 'Spread fingers recognized. Launching search on mobile.');
        }
        break;

      case 'TWO_HANDS_APART':
        store.updateOrbPhysics({ targetScale: 1.8 });
        break;

      case 'TWO_HANDS_TOGETHER':
        store.updateOrbPhysics({ targetScale: 0.65 });
        break;

      case 'POINT':
        // Highlight active HUD panel
        store.toggleTargetLock(true);
        if (store.deviceState.currentApp === 'home' && !store.deviceState.isLocked) {
          store.triggerDeviceAction('Hand Gesture: Point', 'youtube', 'Point gesture recognized. Opening YouTube on connected mobile.');
        }
        break;

      default:
        // Decay target pos back to center gradually
        store.updateOrbPhysics({
          stretch: 1.0,
        });
        break;
    }
  }
}

export const handGestureEngine = new HandGestureEngine();
