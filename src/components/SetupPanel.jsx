import { useState } from 'react';
import { validateConfig } from '../utils/llm';

const PROXY_MODELS = [
  { value: 'kimi', label: 'Kimi K2.5' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'deepseek', label: 'DeepSeek V3' },
  { value: 'claude', label: 'Claude Sonnet' },
];

export default function SetupPanel({ config, setConfig, onReady, t }) {
  const [mode, setMode] = useState(config.mode || 'gemini');
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || '');
  const [proxyUrl, setProxyUrl] = useState(config.proxyUrl || '');
  const [proxyModel, setProxyModel] = useState(config.proxyModel || 'kimi');
  const [proxyKey, setProxyKey] = useState(config.proxyKey || '');
  const [status, setStatus] = useState('idle'); // idle | validating | error
  const [error, setError] = useState('');

  const canSubmit =
    mode === 'gemini' ? geminiKey.trim().length > 0 : proxyUrl.trim().length > 0 && proxyKey.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const newConfig = {
      ...config,
      mode,
      geminiKey: mode === 'gemini' ? geminiKey.trim() : config.geminiKey,
      proxyUrl: mode === 'proxy' ? proxyUrl.trim() : config.proxyUrl,
      proxyModel: mode === 'proxy' ? proxyModel : config.proxyModel,
      proxyKey: mode === 'proxy' ? proxyKey.trim() : config.proxyKey,
    };

    setStatus('validating');
    setError('');

    try {
      await validateConfig(newConfig);
      setConfig(newConfig);
      onReady(newConfig);
    } catch (err) {
      setStatus('error');
      setError(err.message || t.setup.invalidKey);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C16 4 20 8 20 14C20 20 16 28 16 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 4C16 4 12 8 12 14C12 17 13 20 14 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="4" r="2.5" fill="currentColor" />
              <path d="M10 26C12 24 14 25 16 28C18 25 20 24 22 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-100">HookSmith</h1>
          <p className="text-sm text-neutral-500 mt-1">{t.tagline}</p>
        </div>

        {/* Setup Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5"
        >
          <div>
            <h2 className="text-lg font-semibold text-neutral-200">{t.setup.title}</h2>
            <p className="text-xs text-neutral-500 mt-1">{t.setup.subtitle}</p>
          </div>

          {/* Mode selector */}
          <div className="space-y-3">
            {/* Gemini */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                mode === 'gemini'
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="gemini"
                checked={mode === 'gemini'}
                onChange={() => setMode('gemini')}
                className="mt-0.5 accent-emerald-500"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-200">
                  {t.setup.geminiLabel}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">{t.setup.geminiHint}</div>
              </div>
            </label>

            {/* Proxy */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                mode === 'proxy'
                  ? 'border-blue-500/40 bg-blue-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="proxy"
                checked={mode === 'proxy'}
                onChange={() => setMode('proxy')}
                className="mt-0.5 accent-blue-500"
              />
              <div className="text-sm font-medium text-neutral-200">
                {t.setup.proxyLabel}
              </div>
            </label>
          </div>

          {/* Gemini key input */}
          {mode === 'gemini' && (
            <div className="space-y-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={t.setup.apiKeyPlaceholder}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {t.setup.geminiLink}
              </a>
            </div>
          )}

          {/* Proxy inputs */}
          {mode === 'proxy' && (
            <div className="space-y-3">
              <input
                type="url"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                placeholder={t.setup.proxyUrlPlaceholder}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">{t.setup.modelLabel}</label>
                <select
                  value={proxyModel}
                  onChange={(e) => setProxyModel(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                >
                  {PROXY_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="password"
                value={proxyKey}
                onChange={(e) => setProxyKey(e.target.value)}
                placeholder={t.setup.apiKeyPlaceholder}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || status === 'validating'}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {status === 'validating' ? t.setup.validating : t.setup.start}
          </button>

          {/* Footer */}
          <p className="text-[10px] text-neutral-600 text-center">{t.footer}</p>
        </form>
      </div>
    </div>
  );
}
