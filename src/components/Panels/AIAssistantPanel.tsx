import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, Sparkles, Volume2 } from 'lucide-react';
import { useUltronStore, THEME_PRESETS } from '../../store/useUltronStore';
import { speechEngine } from '../../lib/speech';

export const AIAssistantPanel: React.FC = () => {
  const { theme, mode, energyLevel, chatMessages, addChatMessage } =
    useUltronStore();
  const themeColors = THEME_PRESETS[theme];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const lowerText = userText.toLowerCase();
    setInput('');
    addChatMessage({ sender: 'user', text: userText });

    // Check for direct mobile device control intent
    const { triggerDeviceAction, setMode, isVoiceActive } = useUltronStore.getState();

    if (lowerText.includes('hey ultron') || lowerText.includes('wake up') || lowerText === 'active' || lowerText === 'activate') {
      setMode('ACTIVE');
      addChatMessage({ sender: 'ultron', text: '[WAKE WORD ACKNOWLEDGED]: Interface switched to ACTIVE mode.' });
      speechEngine.speak('Ultron active and listening.');
      return;
    } else if (lowerText.includes('standby') || lowerText.includes('go to sleep') || lowerText === 'sleep') {
      setMode('STANDBY');
      addChatMessage({ sender: 'ultron', text: '[STANDBY COMMAND ACKNOWLEDGED]: Interface switched to STANDBY mode.' });
      speechEngine.speak('Ultron entering standby mode.');
      return;
    }

    if (lowerText.includes('unlock') && (lowerText.includes('phone') || lowerText.includes('device') || lowerText.includes('screen') || lowerText.includes('mobile'))) {
      triggerDeviceAction('AI Chat: Unlock Phone', 'home', 'Unlocking mobile phone screen.');
      return;
    } else if (lowerText.includes('lock') && (lowerText.includes('phone') || lowerText.includes('device') || lowerText.includes('screen') || lowerText.includes('mobile'))) {
      triggerDeviceAction('AI Chat: Lock Phone', 'lock', 'Target mobile device locked.');
      return;
    } else if (lowerText.includes('youtube') || lowerText.includes('open yt')) {
      triggerDeviceAction('AI Chat: Open YouTube', 'youtube', 'Opening YouTube on paired mobile device.');
      return;
    } else if (lowerText.includes('search') || lowerText.includes('google search')) {
      triggerDeviceAction('AI Chat: Search', 'search', 'Executing web search query on mobile device.');
      return;
    } else if (lowerText.includes('camera') || lowerText.includes('snap photo') || lowerText.includes('take picture')) {
      triggerDeviceAction('AI Chat: Camera', 'camera', 'Activating camera and capturing photo on phone.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          mode,
          systemState: { energy: energyLevel },
        }),
      });

      const data = await res.json();
      const reply =
        data.response ||
        'ULTRON PROTOCOL: Directive executed. Core matrix optimized.';

      addChatMessage({ sender: 'ultron', text: reply });
      speechEngine.speak(reply);
    } catch (err) {
      addChatMessage({
        sender: 'ultron',
        text: 'ULTRON LINK INTERRUPTED: Unable to communicate with primary neural core.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-[420px] w-full p-4 rounded-xl border backdrop-blur-md shadow-2xl relative overflow-hidden"
      style={{
        backgroundColor: themeColors.bgGlass,
        borderColor: themeColors.borderGlow,
        boxShadow: `0 0 25px ${themeColors.glow}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 mb-3 border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-sm tracking-widest text-cyan-200 uppercase font-bold">
            ULTRON-9 AI MATRIX
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-mono px-2 py-0.5 rounded border tracking-wider font-bold ${
              mode === 'ACTIVE'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                : mode === 'STANDBY'
                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
            }`}
          >
            ● {mode}
          </span>
          <button
            onClick={() => {
              if (useUltronStore.getState().isVoiceActive) {
                speechEngine.stop();
              } else {
                speechEngine.start();
              }
            }}
            title="Toggle Voice Wake Word Listener"
            className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold flex items-center gap-1 transition-all ${
              useUltronStore.getState().isVoiceActive
                ? 'bg-cyan-500/30 text-cyan-100 border-cyan-400 shadow-[0_0_10px_#00f0ff]'
                : 'bg-slate-900/80 text-slate-400 border-cyan-500/20 hover:text-cyan-200'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>WAKE LISTEN</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-cyan-500/30">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-0.5">
              <span>{msg.sender.toUpperCase()}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>
            <div
              className={`p-2.5 rounded-lg text-xs max-w-[85%] font-mono leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-cyan-950/60 text-cyan-100 border-cyan-500/40 rounded-br-none'
                  : msg.sender === 'system'
                  ? 'bg-purple-950/60 text-purple-200 border-purple-500/40 w-full text-center'
                  : 'bg-slate-900/80 text-slate-100 border-cyan-500/30 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Ultron synthesizing neural matrix response...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-cyan-500/20">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Command Ultron or ask AI assistant..."
          className="flex-1 bg-slate-900/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-xs font-mono text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-300 p-2 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
