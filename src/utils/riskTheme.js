export function getTheme(result) {
  const riskLevel = String(result?.risk || '').toLowerCase();
  const confidenceValue = Number(result?.confidence);
  const confidence = Number.isFinite(confidenceValue) ? confidenceValue : 50;

  if (riskLevel === 'high risk' || riskLevel === 'scam' || confidence >= 80) {
    return 'danger';
  }

  if (riskLevel === 'needs verification' || riskLevel === 'uncertain' || (confidence >= 40 && confidence <= 79)) {
    return 'warning';
  }

  if (riskLevel === 'likely safe' || confidence < 40) {
    return 'safe';
  }

  return 'warning';
}

export const themeClassMap = {
  safe: {
    wrapper: 'bg-slate-50',
    accentBorder: 'border-l-green-400',
    topTint: 'bg-green-50',
    badge: 'bg-green-100 text-green-700 border-green-300',
    progress: 'bg-green-500',
    dangerButtonRing: '',
    cardShadow: 'shadow-soft',
  },
  warning: {
    wrapper: 'bg-slate-50',
    accentBorder: 'border-l-amber-400',
    topTint: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    progress: 'bg-amber-500',
    dangerButtonRing: '',
    cardShadow: 'shadow-soft',
  },
  danger: {
    wrapper: 'bg-slate-50',
    accentBorder: 'border-l-red-400',
    topTint: 'bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-300',
    progress: 'bg-red-500',
    dangerButtonRing: '',
    cardShadow: 'shadow-soft',
  },
};
