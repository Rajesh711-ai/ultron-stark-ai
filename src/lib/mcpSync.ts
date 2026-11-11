import { useUltronStore } from '../store/useUltronStore';
import { DeviceAppType } from '../types';

export class MCPSyncManager {
  private channel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Initialize Real-Time SSE Stream with Express Server
    try {
      this.eventSource = new EventSource('/api/device/stream');

      this.eventSource.addEventListener('sync_state', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleServerSyncState(data);
        } catch (err) {
          // ignore
        }
      });

      this.eventSource.addEventListener('command_executed', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleServerCommandExecuted(data);
        } catch (err) {
          // ignore
        }
      });

      this.eventSource.addEventListener('device_paired', (e) => {
        try {
          const data = JSON.parse(e.data);
          this.handleServerDevicePaired(data);
        } catch (err) {
          // ignore
        }
      });

      this.eventSource.onerror = () => {
        console.warn('[MCP REAL-TIME SSE]: SSE connection reconnecting...');
      };

      console.log('[MCP REAL-TIME SSE]: Connected to /api/device/stream');
    } catch (e) {
      console.warn('[MCP REAL-TIME SSE]: EventSource init fallback:', e);
    }

    // 2. BroadcastChannel for local same-origin tabs
    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('ultron_mcp_sync');
        this.channel.onmessage = (event) => {
          this.handleIncomingSync(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel init error:', e);
      }
    }

    // 3. LocalStorage storage event fallback
    window.addEventListener('storage', (event) => {
      if ((event.key === 'ultron_mcp_action_event' || event.key === 'ultron_mcp_pair_event') && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this.handleIncomingSync(data);
        } catch (e) {
          // ignore parsing error
        }
      }
    });

    console.log('[MCP SYNC]: Cross-device real-time sync engine fully active.');
  }

  public broadcastPair(deviceName: string, pin: string = '859102') {
    const payload = {
      type: 'MCP_DEVICE_PAIR',
      deviceName,
      timestamp: Date.now(),
    };

    // Send to Server REST endpoint for server-wide broadcast
    fetch('/api/device/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, deviceName }),
    }).catch(() => {});

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {}
    }

    try {
      localStorage.setItem('ultron_mcp_pair_event', JSON.stringify(payload));
    } catch (e) {}
  }

  public broadcastAction(
    actionName: string,
    targetApp: DeviceAppType,
    speechText: string,
    extraParams?: Record<string, any>
  ) {
    const payload = {
      type: 'MCP_DEVICE_ACTION',
      actionName,
      targetApp,
      speechText,
      timestamp: Date.now(),
      ...extraParams,
    };

    // Post to Server for Real-Time SSE distribution across network
    fetch('/api/device/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: actionName,
        targetApp,
        speechText,
        ...extraParams,
      }),
    }).catch(() => {});

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {}
    }

    try {
      localStorage.setItem('ultron_mcp_action_event', JSON.stringify(payload));
    } catch (e) {}

    // Perform native device haptics if available on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }
  }

  private handleServerSyncState(serverState: any) {
    if (!serverState) return;
    useUltronStore.setState((state) => ({
      deviceState: {
        ...state.deviceState,
        deviceConnected: true,
        isLocked: serverState.isLocked ?? state.deviceState.isLocked,
        currentApp: serverState.currentApp || state.deviceState.currentApp,
        connectedDeviceName: `Stark Handset (${serverState.connectedDevicesCount || 1} Linked)`,
      },
    }));
  }

  private handleServerCommandExecuted(data: any) {
    if (!data) return;
    const { action, targetApp, theme, orientation, speechText, deepLink, adbCommand } = data;

    useUltronStore.setState((state) => {
      const isLocking = action === 'lock' || action === 'LOCK' || targetApp === 'lock';

      if (theme && theme !== state.theme) {
        state.setTheme(theme as any);
      }

      if (orientation?.beta !== undefined) {
        state.updateOrbPhysics({
          rotation: [
            (orientation.beta * Math.PI) / 180,
            (orientation.gamma * Math.PI) / 180,
            0,
          ],
        });
      }

      const logMessage = `[REAL-TIME SSE LINK]: Command '${action || targetApp}' executed.${deepLink ? ` DeepLink: ${deepLink}` : ''}`;
      const adbLog = adbCommand ? `[NATIVE ADB SHELL]: ${adbCommand}` : null;

      const newLogs = [logMessage, ...(adbLog ? [adbLog] : []), ...state.deviceState.mcpLogs].slice(0, 30);

      return {
        deviceState: {
          ...state.deviceState,
          deviceConnected: true,
          isLocked: isLocking,
          currentApp: targetApp || state.deviceState.currentApp,
          mcpLogs: newLogs,
        },
      };
    });

    if (deepLink && typeof window !== 'undefined' && window.innerWidth < 768) {
      try {
        window.open(deepLink, '_blank');
      } catch (e) {}
    }

    if (speechText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.05;
        utterance.pitch = 0.85;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }

  private handleServerDevicePaired(data: any) {
    const { deviceName } = data;
    const logMsg = `[SSE PAIR SUCCESS]: Linked handset "${deviceName || 'Mobile Device'}" via PIN`;
    useUltronStore.setState((state) => ({
      deviceState: {
        ...state.deviceState,
        deviceConnected: true,
        connectedDeviceName: deviceName || state.deviceState.connectedDeviceName,
        mcpLogs: [logMsg, ...state.deviceState.mcpLogs].slice(0, 30),
      },
    }));
  }

  private handleIncomingSync(data: any) {
    if (!data) return;

    if (data.type === 'MCP_DEVICE_PAIR') {
      const { deviceName, timestamp } = data;
      if (Date.now() - timestamp > 10000) return;

      const logMsg = `[MCP PAIR HANDSHAKE]: Paired with external mobile handset "${deviceName}"`;
      useUltronStore.setState((state) => ({
        deviceState: {
          ...state.deviceState,
          deviceConnected: true,
          connectedDeviceName: deviceName || state.deviceState.connectedDeviceName,
          mcpLogs: [logMsg, ...state.deviceState.mcpLogs].slice(0, 25),
        },
      }));
      return;
    }

    if (data.type !== 'MCP_DEVICE_ACTION') return;

    const { actionName, targetApp, speechText, timestamp } = data;
    if (Date.now() - timestamp > 5000) return;

    const isLocking = targetApp === 'lock';
    const logMessage = `[MCP REMOTE SYNC]: Received remote event '${actionName}' -> ${targetApp.toUpperCase()}`;

    useUltronStore.setState((state) => ({
      deviceState: {
        ...state.deviceState,
        deviceConnected: true,
        isLocked: isLocking,
        currentApp: targetApp,
        mcpLogs: [logMessage, ...state.deviceState.mcpLogs].slice(0, 25),
      },
    }));

    if (speechText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.05;
        utterance.pitch = 0.85;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }
}

export const mcpSyncManager = new MCPSyncManager();

