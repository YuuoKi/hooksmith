import { useState } from 'react';
import HookBadge from './HookBadge';
import { getAngleByKey } from '../constants/hookAngles';

export default function ScriptCard({ script, index, lang = 'zh', t }) {
  const [expanded, setExpanded] = useState(true);
  const angle = getAngleByKey(script.hookAngle);
  const borderColor = angle?.border || 'rgba(255,255,255,0.1)';

  const sections = [
    { key: 'hook', icon: '🎣', label: t.script.hook },
    { key: 'body', icon: '📝', label: t.script.body },
    { key: 'cta', icon: '🎯', label: t.script.cta },
  ];

  const meta = [
    { key: 'duration', label: t.script.duration },
    { key: 'assetRequirements', label: t.script.assets },
    { key: 'whyThisWorks', label: t.script.why },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium text-neutral-500 shrink-0">
            #{index + 1}
          </span>
          <HookBadge angleKey={script.hookAngle} lang={lang} />
          <span className="text-sm font-semibold text-neutral-100 truncate">
            {script.title}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {sections.map(({ key, icon, label }) =>
            script[key] ? (
              <div key={key}>
                <div className="text-xs font-medium text-neutral-500 mb-1.5">
                  {icon} {label}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {script[key]}
                </p>
              </div>
            ) : null
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
            {meta.map(({ key, label }) =>
              script[key] ? (
                <div key={key} className="text-xs text-neutral-500">
                  <span className="text-neutral-400 font-medium">{label}:</span>{' '}
                  <span className="text-neutral-300">{script[key]}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
