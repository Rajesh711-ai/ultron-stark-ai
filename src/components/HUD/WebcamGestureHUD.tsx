import React, { useRef, useEffect, useState } from 'react';
import { Camera, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { handGestureEngine } from '../../lib/handGestureDetector';

export const WebcamGestureHUD: React.FC = () => {
  const {
    theme,
    isWebcamActive,
    toggleWebcam,
    hands,
    lastDetectedGesture,
    gestureConfidence,
  } = useUltronStore();

  const themeColors = THEME_PRESETS[theme];

  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    let animId: number;

    const startCamera = async () => {
      if (!isWebcamActive) return;
      setIsInitializing(true);
      setCameraError(null);

      // Initialize MediaPipe engine
      await handGestureEngine.initialize();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          const processFrame = (time: number) => {
            if (videoRef.current && isWebcamActive) {
              handGestureEngine.detect(videoRef.current, time);
              drawSkeleton();
            }
            animId = requestAnimationFrame(processFrame);
          };

          animId = requestAnimationFrame(processFrame);
        }
      } catch (err: any) {
        console.warn('Webcam access error:', err);
        setCameraError('Webcam unavailable. Mouse controls active.');
      } finally {
        setIsInitializing(false);
      }
    };

    startCamera();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isWebcamActive]);

  const drawSkeleton = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!hands || hands.length === 0) return;

    // Connections between landmarks
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [0, 17], // Palm base
    ];

    hands.forEach((hand) => {
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;

      connections.forEach(([i1, i2]) => {
        const p1 = hand.landmarks[i1];
        const p2 = hand.landmarks[i2];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
      });

      // Draw Joint Points
      hand.landmarks.forEach((pt, idx) => {
        ctx.fillStyle = idx === 4 || idx === 8 ? '#00ff88' : '#00f0ff';
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  if (!isWebcamActive) {
    return (
      <div className="pointer-events-auto absolute bottom-4 left-4 z-20">
        <button
          onClick={() => toggleWebcam(true)}
          className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:text-white px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>ENABLE WEBCAM HAND TRACKING</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex flex-col gap-2 font-mono text-xs">
      <div
        className="relative w-52 h-36 bg-slate-950/90 rounded-xl border overflow-hidden shadow-2xl backdrop-blur-md"
        style={{ borderColor: themeColors.borderGlow }}
      >
        {/* Hidden HTML Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform -scale-x-100 opacity-60"
          playsInline
          muted
        />

        {/* Skeleton Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
        />

        {/* HUD Frame Overlay */}
        <div className="absolute inset-0 border border-cyan-500/30 rounded-xl pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-2 left-2 bg-slate-950/80 border border-cyan-500/40 px-2 py-0.5 rounded text-[9px] text-cyan-300 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>MEDIAPIPE GESTURE CAM</span>
        </div>

        {/* Toggle Off Button */}
        <button
          onClick={() => toggleWebcam(false)}
          className="absolute top-2 right-2 text-slate-400 hover:text-white bg-slate-950/80 p-1 rounded border border-cyan-500/30"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 p-3 flex flex-col items-center justify-center text-center text-amber-400 text-[10px]">
            <AlertTriangle className="w-5 h-5 mb-1" />
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* Active Gesture Banner */}
      <div className="bg-slate-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-cyan-200 text-[11px] flex items-center justify-between">
        <span>DETECTED:</span>
        <span className="font-bold text-cyan-400 uppercase">
          {lastDetectedGesture}
        </span>
      </div>
    </div>
  );
};
