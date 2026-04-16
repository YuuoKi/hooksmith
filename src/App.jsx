import { useState, useCallback } from 'react';
import SetupPanel from './components/SetupPanel';
import Chat from './components/Chat';
import { loadConfig, saveConfig } from './utils/storage';
import { T } from './constants/i18n';

export default function App() {
  const [config, setConfig] = useState(loadConfig);
  const [ready, setReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [lang, setLang] = useState(config.lang || 'zh');

  const t = T[lang];

  const handleConfigChange = useCallback(
    (newConfig) => {
      const updated = { ...newConfig, lang };
      setConfig(updated);
      saveConfig(updated);
    },
    [lang]
  );

  const handleReady = useCallback(
    (newConfig) => {
      handleConfigChange(newConfig);
      setReady(true);
      setShowSetup(false);
    },
    [handleConfigChange]
  );

  const toggleLang = useCallback(() => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    const updated = { ...config, lang: newLang };
    setConfig(updated);
    saveConfig(updated);
  }, [lang, config]);

  if (!ready || showSetup) {
    return (
      <SetupPanel
        config={config}
        setConfig={handleConfigChange}
        onReady={handleReady}
        t={t}
      />
    );
  }

  return (
    <Chat
      config={config}
      lang={lang}
      t={t}
      onReset={toggleLang}
      onSettings={() => setShowSetup(true)}
    />
  );
}
