import { useUltronStore } from '../store/useUltronStore';

export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;
  private synthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const lastIndex = event.results.length - 1;
          const transcript = event.results[lastIndex][0].transcript
            .trim()
            .toLowerCase();
          console.log('[ULTRON Speech Command Detected]:', transcript);
          this.handleCommand(transcript);
        };

        this.recognition.onend = () => {
          // Keep continuous wake word listener running automatically
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {
              // ignore
            }
          }
        };

        this.recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
        };
      }

      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        useUltronStore.getState().toggleVoice(true);
        this.speak('Ultron wake word listener online. Say "Hey Ultron" or "Wake Up".');
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      useUltronStore.getState().toggleVoice(false);
      this.speak('Voice wake word listener offline.');
    }
  }

  public speak(text: string) {
    if (!this.synthesis) return;

    this.synthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.85; // Low cybernetic pitch

    // Find a cool robotic/English voice if available
    const voices = this.synthesis.getVoices();
    const roboticVoice =
      voices.find(
        (v) =>
          v.name.includes('Google') ||
          v.name.includes('Daniel') ||
          v.name.includes('Natural') ||
          v.lang.startsWith('en')
      ) || voices[0];

    if (roboticVoice) utterance.voice = roboticVoice;

    this.synthesis.speak(utterance);
  }

  private handleCommand(cmd: string) {
    const store = useUltronStore.getState();

    store.addChatMessage({
      sender: 'user',
      text: `Voice Command: "${cmd}"`,
    });

    // Check for Wake Word phrases to switch to ACTIVE mode
    const wakePhrases = [
      'hey ultron',
      'ultron',
      'wake up',
      'wake up ultron',
      'activate ultron',
      'hey assistant',
      'jarvis',
      'active mode',
      'switch to active',
      'wake',
    ];

    // Check for Standby phrases to switch to STANDBY mode
    const standbyPhrases = [
      'standby',
      'standby mode',
      'go to sleep',
      'sleep mode',
      'deactivate',
      'enter standby',
      'sleep',
      'power down',
      'shut down',
      'shutdown',
    ];

    const isWakeWord = wakePhrases.some((phrase) => cmd.includes(phrase));
    const isStandbyCmd = standbyPhrases.some((phrase) => cmd.includes(phrase));

    if (isWakeWord) {
      store.setMode('ACTIVE');
      store.addChatMessage({
        sender: 'ultron',
        text: `[WAKE WORD DETECTED]: "${cmd}" -> Interface switched to ACTIVE mode.`,
      });
      this.speak('Ultron active and listening. How can I assist you?');
      return;
    }

    if (isStandbyCmd) {
      store.setMode('STANDBY');
      store.addChatMessage({
        sender: 'ultron',
        text: `[STANDBY COMMAND]: "${cmd}" -> Interface switched to STANDBY mode.`,
      });
      this.speak('Ultron entering standby mode. Say "Hey Ultron" or "Wake Up" to reactivate.');
      return;
    }

    if (cmd.includes('unlock') && (cmd.includes('phone') || cmd.includes('device') || cmd.includes('screen') || cmd.includes('mobile'))) {
      store.triggerDeviceAction('Voice: Unlock Phone', 'home', 'Unlocking mobile phone screen.');
    } else if (cmd.includes('lock') && (cmd.includes('phone') || cmd.includes('device') || cmd.includes('screen') || cmd.includes('mobile'))) {
      store.triggerDeviceAction('Voice: Lock Phone', 'lock', 'Target mobile device locked.');
    } else if (cmd.includes('youtube') || cmd.includes('video') || (cmd.includes('open') && cmd.includes('yt'))) {
      store.triggerDeviceAction('Voice: Open YouTube', 'youtube', 'Opening YouTube on paired mobile device.');
    } else if (cmd.includes('search') || cmd.includes('google') || cmd.includes('web search')) {
      store.triggerDeviceAction('Voice: Web Search', 'search', 'Launching Google search on connected phone.');
    } else if (cmd.includes('camera') || cmd.includes('photo') || cmd.includes('picture') || cmd.includes('snap')) {
      store.triggerDeviceAction('Voice: Camera Snap', 'camera', 'Activating camera on connected mobile device.');
    } else if (cmd.includes('rotate') || cmd.includes('spin')) {
      store.updateOrbPhysics({
        rotation: [
          store.orbPhysics.rotation[0],
          store.orbPhysics.rotation[1] + Math.PI,
          store.orbPhysics.rotation[2],
        ],
      });
      this.speak('Rotating orb alignment.');
    } else if (cmd.includes('zoom') || cmd.includes('expand')) {
      store.updateOrbPhysics({ targetScale: 1.6 });
      this.speak('Expanding energy focal field.');
    } else if (cmd.includes('increase energy') || cmd.includes('overdrive')) {
      store.setEnergyLevel((e) => Math.min(100, e + 15));
      store.setMode('CHARGING');
      this.speak('Energy core boosted to max density.');
    } else if (cmd.includes('decrease energy') || cmd.includes('dim')) {
      store.setEnergyLevel((e) => Math.max(10, e - 20));
      this.speak('Reducing core energy dissipation.');
    } else if (cmd.includes('reset')) {
      store.resetOrb();
      this.speak('Orb state reset to baseline coordinates.');
    } else if (cmd.includes('scan') || cmd.includes('diagnostics')) {
      store.setMode('SCANNING');
      store.setActivePanel('diagnostics');
      this.speak('Running full diagnostic scan.');
    } else if (cmd.includes('attack') || cmd.includes('launch mode')) {
      store.setMode('ATTACK');
      this.speak('Tactical offense protocol engaged.');
    } else if (cmd.includes('cyan') || cmd.includes('default theme')) {
      store.setTheme('neon-cyan');
      this.speak('Theme set to Neon Cyan.');
    } else if (cmd.includes('red') || cmd.includes('stark')) {
      store.setTheme('iron-red');
      this.speak('Theme set to Stark Iron Red.');
    } else if (cmd.includes('purple')) {
      store.setTheme('electric-purple');
      this.speak('Theme set to Electric Purple.');
    } else {
      // General voice query -> call Gemini
      this.speak('Processing prompt through Ultron neural matrix.');
      fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cmd,
          mode: store.mode,
          systemState: { energy: store.energyLevel },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.response) {
            store.addChatMessage({ sender: 'ultron', text: data.response });
            this.speak(data.response);
          }
        })
        .catch(() => {
          this.speak('Neural link query timeout.');
        });
    }
  }
}

export const speechEngine = new SpeechEngine();
