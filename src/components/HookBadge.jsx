import { getAngleByKey } from '../constants/hookAngles';

export default function HookBadge({ angleKey, lang = 'zh' }) {
  const angle = getAngleByKey(angleKey);
  if (!angle) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        color: angle.color,
        backgroundColor: angle.bg,
        border: `1px solid ${angle.border}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: angle.color }}
      />
      {angle.label[lang] || angle.label.en}
    </span>
  );
}
