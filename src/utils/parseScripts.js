/**
 * Extract script JSON blocks from LLM response text.
 * Returns { scripts: [...], textBefore, textAfter } or null if no scripts found.
 */
export function parseScripts(text) {
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
  let match;
  let parsed = null;

  while ((match = jsonBlockRegex.exec(text)) !== null) {
    try {
      const obj = JSON.parse(match[1].trim());
      if (obj.status === 'SCRIPT_READY' && Array.isArray(obj.scripts)) {
        parsed = obj;
        break;
      }
    } catch {
      // not valid JSON, skip
    }
  }

  if (!parsed) return null;

  const jsonStart = match.index;
  const jsonEnd = jsonStart + match[0].length;

  return {
    game: parsed.game || '',
    category: parsed.category || '',
    scripts: parsed.scripts,
    textBefore: text.slice(0, jsonStart).trim(),
    textAfter: text.slice(jsonEnd).trim(),
  };
}
