const allowedRiskLevels = ['Likely Safe', 'Uncertain', 'High Risk'];

const fallbackDetailsByRisk = {
  'High Risk': {
    reasons: [
      'Uses urgent language',
      'Mentions bank account blockage',
      'Asks you to click a verification link',
    ],
    actions: [
      'Do NOT click the link',
      'Do NOT share OTP or login details',
      'Contact your bank directly through the official website or app',
    ],
  },
  Uncertain: {
    reasons: ['Contains some risk signals', 'Sender identity is not fully verified'],
    actions: ['Verify the sender before taking action', 'Avoid sharing personal or financial details'],
  },
  'Likely Safe': {
    reasons: ['No suspicious links detected', 'No urgency or impersonation patterns found'],
    actions: ['Still verify sensitive requests through official sources'],
  },
};

function normalizeRiskLevel(value) {
  if (typeof value !== 'string') return 'Uncertain';
  const formatted = value.trim().toLowerCase();

  if (formatted === 'likely safe' || formatted === 'safe') return 'Likely Safe';
  if (formatted === 'high risk' || formatted === 'scam') return 'High Risk';
  return 'Uncertain';
}

function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\b(might|probably|possibly|typical(?:ly)?)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeList(listValue, fallbackList) {
  if (!Array.isArray(listValue)) return fallbackList;

  const cleaned = listValue
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 0)
    .slice(0, 3);

  return cleaned.length > 0 ? cleaned : fallbackList;
}

export function normalizeAnalysis(raw) {
  const riskLevel = normalizeRiskLevel(raw?.riskLevel);
  const confidenceValue = Number(raw?.confidence);
  const confidence = Number.isFinite(confidenceValue)
    ? Math.min(100, Math.max(0, Math.round(confidenceValue)))
    : 50;

  const fallbackDetails = fallbackDetailsByRisk[riskLevel] || fallbackDetailsByRisk.Uncertain;

  const explanation = normalizeText(raw?.explanation)
    ? normalizeText(raw?.explanation).slice(0, 220)
    : fallbackDetails.reasons.join('. ');

  const reasons = normalizeList(raw?.reasons, fallbackDetails.reasons);
  const actions = normalizeList(raw?.actions, fallbackDetails.actions);

  return {
    riskLevel: allowedRiskLevels.includes(riskLevel) ? riskLevel : 'Uncertain',
    confidence,
    explanation,
    reasons,
    actions,
  };
}
