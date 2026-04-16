export const HOOK_ANGLES = [
  {
    key: 'Emotional',
    label: { zh: '情感共鸣', en: 'Emotional' },
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.3)',
    description: {
      zh: '角色故事、剧情向、情怀牌',
      en: 'Character stories, narrative, nostalgia',
    },
  },
  {
    key: 'Gameplay',
    label: { zh: '玩法展示', en: 'Gameplay' },
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    description: {
      zh: '核心玩法loop、操作展示',
      en: 'Core gameplay loop, action showcase',
    },
  },
  {
    key: 'UGC',
    label: { zh: 'UGC 口播', en: 'UGC' },
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.3)',
    description: {
      zh: '伪用户推荐、口播种草',
      en: 'Fake user reviews, word-of-mouth',
    },
  },
  {
    key: 'Contrast',
    label: { zh: '强对比', en: 'Contrast' },
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
    description: {
      zh: 'Before/After、新手vs大佬',
      en: 'Before/After, noob vs pro',
    },
  },
  {
    key: 'Challenge',
    label: { zh: '挑战/争议', en: 'Challenge' },
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
    description: {
      zh: '"99%做不到""你能过算我输"',
      en: '"99% can\'t do this" "Beat this level, I dare you"',
    },
  },
  {
    key: 'PlotTwist',
    label: { zh: '反转/悬念', en: 'Plot Twist' },
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.3)',
    description: {
      zh: '短剧式叙事、反转打脸',
      en: 'Short drama narrative, plot twists',
    },
  },
];

export function getAngleByKey(key) {
  return HOOK_ANGLES.find(
    (a) => a.key.toLowerCase() === key?.toLowerCase?.()
      || a.key.replace(/\s+/g, '').toLowerCase() === key?.replace?.(/\s+/g, '').toLowerCase()
  );
}
