import { useUltronStore } from '../store/useUltronStore';

export class AudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animFrame: number | null = null;
  private isRunning = false;

  public async startMicrophone(): Promise<boolean> {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      this.audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;

      this.source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.source.connect(this.analyser);

      this.isRunning = true;
      useUltronStore.getState().updateAudioData({ isListening: true });
      this.analyzeLoop();
      return true;
    } catch (err) {
      console.warn('Microphone permission or audio setup failed:', err);
      // Fallback to synthetic audio pulse loop if mic unavailable
      this.startSyntheticAudio();
      return false;
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    useUltronStore.getState().updateAudioData({
      isListening: false,
      bass: 0,
      treble: 0,
      volume: 0,
      beatDetected: false,
      frequencyData: new Array(32).fill(0),
    });
  }

  private analyzeLoop = () => {
    if (!this.isRunning || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate Bass (low frequencies 0..5)
    let bassSum = 0;
    for (let i = 0; i < 6; i++) {
      bassSum += dataArray[i];
    }
    const bass = bassSum / (6 * 255);

    // Calculate Treble (high frequencies 18..31)
    let trebleSum = 0;
    for (let i = 18; i < bufferLength; i++) {
      trebleSum += dataArray[i];
    }
    const treble = trebleSum / ((bufferLength - 18) * 255);

    // Volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const volume = sum / (bufferLength * 255);

    const beatDetected = bass > 0.68;

    useUltronStore.getState().updateAudioData({
      bass,
      treble,
      volume,
      beatDetected,
      frequencyData: Array.from(dataArray),
    });

    this.animFrame = requestAnimationFrame(this.analyzeLoop);
  };

  private startSyntheticAudio() {
    this.isRunning = true;
    useUltronStore.getState().updateAudioData({ isListening: true });

    const synthLoop = () => {
      if (!this.isRunning) return;
      const t = Date.now() * 0.003;
      const bass = (Math.sin(t * 3) + 1) * 0.35 + (Math.sin(t * 8) > 0.8 ? 0.3 : 0);
      const treble = (Math.cos(t * 5) + 1) * 0.3;
      const volume = (bass + treble) * 0.5;
      const freq = Array.from({ length: 32 }, (_, i) =>
        Math.floor(
          128 + 120 * Math.sin(t * 4 + i * 0.3) * (i < 8 ? bass : treble)
        )
      );

      useUltronStore.getState().updateAudioData({
        bass,
        treble,
        volume,
        beatDetected: bass > 0.6,
        frequencyData: freq,
      });

      this.animFrame = requestAnimationFrame(synthLoop);
    };

    synthLoop();
  }
}

export const audioAnalyzer = new AudioAnalyzer();
