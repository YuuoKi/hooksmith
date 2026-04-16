import { useState, useMemo } from 'react';
import ScriptCard from './ScriptCard';
import { parseScripts } from '../utils/parseScripts';

export default function MessageBubble({ message, lang, t }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const scriptData = useMemo(
    () => (!isUser ? parseScripts(message.content) : null),
    [isUser, message.content]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10" strokeLinecap="round" />
            <path d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        {/* Text content (before scripts) */}
        {scriptData ? (
          <>
            {scriptData.textBefore && (
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap mb-3">
                {scriptData.textBefore}
              </div>
            )}

            {/* Script cards */}
            <div className="space-y-3">
              {scriptData.scripts.map((script, i) => (
                <ScriptCard
                  key={i}
                  script={script}
                  index={i}
                  lang={lang}
                  t={t}
                />
              ))}
            </div>

            {/* Text after scripts (summary) */}
            {scriptData.textAfter && (
              <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap mt-3">
                {scriptData.textAfter}
              </div>
            )}
          </>
        ) : (
          <div
            className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? 'bg-blue-600/20 border border-blue-500/30 text-neutral-100'
                : 'bg-white/5 text-neutral-200'
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Copy button for assistant messages */}
        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="mt-1.5 text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            {copied ? t.chat.copied : t.chat.copy}
          </button>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
