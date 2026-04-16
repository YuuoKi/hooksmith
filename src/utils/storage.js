const PREFIX = 'hooksmith_';

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently fail
  }
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function loadConfig() {
  return load('config', {
    mode: 'gemini',
    geminiKey: '',
    proxyUrl: '',
    proxyModel: 'kimi',
    proxyKey: '',
    lang: 'zh',
  });
}

export function saveConfig(config) {
  save('config', config);
}
