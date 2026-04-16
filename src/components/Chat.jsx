import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { streamChat } from '../utils/llm';

export default function Chat({ config, lang, t, onReset, onSettings }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t.chat.greeting },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update greeting when language changes (only if chat hasn't started)
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: t.chat.greeting }]);
    }
  }, [t.chat.greeting]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setStreaming(true);

    // Build history for API (skip the greeting)
    const apiMessages = updatedMessages
      .slice(1) // skip greeting
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      let accumulated = '';
      const assistantMsg = { role: 'assistant', content: '' };

      setMessages([...updatedMessages, assistantMsg]);

      for await (const chunk of streamChat(config, apiMessages, lang, controller.signal)) {
        accumulated += chunk;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: accumulated };
          return next;
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          next[next.length - 1] = {
            role: 'assistant',
            content: `Error: ${err.message}`,
          };
        } else {
          next.push({ role: 'assistant', content: `Error: ${err.message}` });
        }
        return next;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([{ role: 'assistant', content: t.chat.greeting }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-neutral-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C16 4 20 8 20 14C20 20 16 28 16 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M16 4C16 4 12 8 12 14C12 17 13 20 14 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <circle cx="16" cy="4" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-neutral-200">HookSmith</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
            >
              {t.chat.reset}
            </button>
            <button
              onClick={onSettings}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
            >
              {t.chat.settings}
            </button>
            <button
              onClick={onReset}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
            >
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} lang={lang} t={t} />
          ))}
          {streaming && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-neutral-500">
                {t.chat.thinking}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/10 bg-neutral-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.placeholder}
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/40 resize-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              {t.chat.send}
            </button>
          </div>
          <p className="text-[10px] text-neutral-600 text-center mt-2">{t.footer}</p>
        </div>
      </div>
    </div>
  );
}
