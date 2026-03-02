import OpenAI from 'openai';
import { env } from '../config/env.js';
import { normalizeAnalysis } from '../utils/normalizeAnalysis.js';

const SYSTEM_PROMPT = `You are a cybersecurity fraud analyst focused on scam patterns targeting people in India.
Analyze user messages like an expert in phishing, UPI/payment fraud, KYC scams, bank impersonation, government impersonation, OTP theft, fake job offers, investment scams, courier scams, and WhatsApp/SMS fraud.
Respond ONLY in valid JSON with this exact shape:
{
  "riskLevel": "Likely Safe" | "Uncertain" | "High Risk",
  "confidence": number,
  "reasons": ["short bullet reason", "short bullet reason"],
  "actions": ["clear protective action", "clear protective action"]
}
Rules:
- Return 1-3 reasons and 1-3 actions.
- Use a professional tone.
- Confidence must be 0-100.
- Do not mark transaction alerts as scams unless they contain links, phone numbers, or instructions to take action.
- If message is a transaction alert with no action request, keep it "Likely Safe" or "Uncertain".
- AI must not override strong rule decisions for clear safe transaction alerts or clear danger signals.
- Do not include markdown or extra keys.`;

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRiskLevelFromScore(score, hasActionRequest) {
  if (!hasActionRequest) {
    return score <= 35 ? 'Likely Safe' : 'Uncertain';
  }

  if (score <= 35) return 'Likely Safe';
  if (score <= 70) return 'Uncertain';
  return 'High Risk';
}

function isTransactionAlert(text) {
  const lower = text.toLowerCase();

  const hasCreditOrDebit = /\b(credited|debited)\b/.test(lower);
  const hasCurrencyAmount = /\b(rs\.?|inr|₹)\s?\d[\d,]*(?:\.\d{1,2})?\b/.test(lower);
  const hasAccountMask = /\b(a\/c|account)\b/.test(lower) && /\b[x*]{2,}\d{2,}\b/i.test(text);
  const hasReference = /\b(ref|utr|txn|imps|upi)\b/.test(lower);
  const hasDate = /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/.test(lower);

  const indicators = [hasCreditOrDebit, hasCurrencyAmount, hasAccountMask, hasReference, hasDate];
  const matchedCount = indicators.reduce((count, matched) => (matched ? count + 1 : count), 0);

  return matchedCount >= 3;
}

function containsActionRequest(text) {
  const lower = text.toLowerCase();

  const hasUrlPattern =
    /https?:\/\//.test(lower) ||
    /www\./.test(lower) ||
    /\b(?:bit\.ly|tinyurl\.com|[\w-]+\.com|[\w-]+\.in)\b/.test(lower);

  const hasActionWords = /\b(click|verify|update|kyc|refund|claim|urgent|blocked|suspended)\b/.test(lower);
  const hasSensitiveKeywords = /\b(otp|pin|password|cvv|upi\s*pin)\b/.test(lower);
  const hasContactPrompt = /\b(call|contact|whatsapp)\b/.test(lower);
  const hasPhoneNumber = /(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){10,}/.test(text);

  return hasUrlPattern || hasActionWords || hasSensitiveKeywords || hasContactPrompt || hasPhoneNumber;
}

function hasStrongDangerSignals(text) {
  const lower = text.toLowerCase();

  const hasUrlPattern =
    /https?:\/\//.test(lower) ||
    /www\./.test(lower) ||
    /\b(?:bit\.ly|tinyurl\.com|[\w-]+\.com|[\w-]+\.in)\b/.test(lower);
  const hasSensitiveKeywords = /\b(otp|pin|upi\s*pin|password|cvv)\b/.test(lower);
  const hasContactPrompt = /\b(call|contact|whatsapp)\b/.test(lower);
  const hasVerifyPrompt = /\b(click|verify)\b/.test(lower);

  return hasUrlPattern || hasSensitiveKeywords || hasContactPrompt || hasVerifyPrompt;
}

function buildRuleBasedSignals(message) {
  const lower = message.toLowerCase();
  let riskScore = 50;
  const reasons = [];
  const actions = [];

  const transactionAlert = isTransactionAlert(message);
  const actionRequest = containsActionRequest(message);
  const strongDanger = hasStrongDangerSignals(message);

  if (strongDanger) {
    return {
      ruleScore: 85,
      riskLevel: 'High Risk',
      reasons: ['Message contains link, credential, contact, or verification request', 'This pattern is common in scam attempts'],
      actions: ['Do not click links or verify from message prompts', 'Do not share OTP, PIN, password, or CVV', 'Use official app or website to verify'],
      isSafeTransactionRule: false,
      isDangerRule: true,
      hasActionRequest: true,
    };
  }

  if (transactionAlert && !actionRequest) {
    return {
      ruleScore: 20,
      riskLevel: 'Likely Safe',
      reasons: ['Looks like a transaction alert', 'No link or action request found'],
      actions: ['If unsure, check your bank app transaction history', 'Never share OTP/UPI PIN'],
      isSafeTransactionRule: true,
      isDangerRule: false,
      hasActionRequest: false,
    };
  }

  const hasUrl =
    /https?:\/\//.test(lower) ||
    /www\./.test(lower) ||
    /\b(?:bit\.ly|tinyurl\.com|[\w-]+\.com|[\w-]+\.in)\b/.test(lower);

  if (hasUrl) {
    riskScore += 35;
    reasons.push('Message contains a link that may redirect to untrusted pages');
    actions.push('Do not open unknown links from messages');
  }

  const hasActionWords = /\b(click|verify|update|kyc|refund|claim|urgent|blocked|suspended)\b/.test(lower);
  if (hasActionWords) {
    riskScore += 20;
    reasons.push('Message uses action-oriented or pressure words');
    actions.push('Verify requests using the official bank app or website');
  }

  const asksSensitiveInfo = /\b(otp|pin|upi\s*pin|password|cvv)\b/.test(lower);
  if (asksSensitiveInfo) {
    riskScore += 40;
    reasons.push('Message references sensitive credentials like OTP, PIN, or password');
    actions.push('Never share OTP, PIN, UPI PIN, or password');
  }

  const hasPhoneOrWhatsappInstruction = /\b(call|contact|whatsapp)\b/.test(lower);
  const hasPhoneNumber = /(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){10,}/.test(message);
  if (hasPhoneOrWhatsappInstruction) {
    riskScore += 15;
    reasons.push('Message asks you to contact through call or WhatsApp');
    actions.push('Contact your bank only through verified official channels');
  }

  if (hasPhoneNumber) {
    riskScore += 15;
    reasons.push('Message includes a phone number for follow-up action');
  }

  const hasCreditedOrDebited = /\b(credited|debited)\b/.test(lower);
  const hasClickVerifyUpdate = /\b(click|verify|update|kyc)\b/.test(lower);
  if (hasCreditedOrDebited && !hasUrl && !hasClickVerifyUpdate) {
    riskScore -= 30;
    reasons.push('Looks like a standard transaction notification');
  }

  const hasAmount = /\b(rs\.?|inr|₹)\s?\d+/.test(lower);
  const hasDate = /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/.test(lower);
  const hasRef = /\b(ref|utr|txn|transaction\s*id)\b/.test(lower);
  const hasActionRequest = /\b(click|verify|update|call|contact|whatsapp|login|pay|send)\b/.test(lower);

  if (hasAmount && hasDate && hasRef && !hasActionRequest && !hasUrl) {
    riskScore -= 20;
    reasons.push('Contains normal transaction details without action request');
  }

  const finalRuleScore = clampScore(riskScore);
  const riskLevel = getRiskLevelFromScore(finalRuleScore, actionRequest);

  if (reasons.length === 0) {
    reasons.push('Message has mixed indicators and needs verification');
  }

  if (actions.length === 0) {
    actions.push('Verify details from official sources before taking action');
  }

  return {
    ruleScore: finalRuleScore,
    riskLevel,
    reasons: reasons.slice(0, 3),
    actions: actions.slice(0, 3),
    isSafeTransactionRule: false,
    isDangerRule: false,
    hasActionRequest: actionRequest,
  };
}

function parseAiRiskLevel(value) {
  if (typeof value !== 'string') return 'Uncertain';
  const normalized = value.trim().toLowerCase();

  if (normalized === 'likely safe' || normalized === 'safe') return 'Likely Safe';
  if (normalized === 'high risk' || normalized === 'scam') return 'High Risk';
  return 'Uncertain';
}

function getAiAdjustment(aiRiskLevel, baseRiskLevel) {
  if (aiRiskLevel === baseRiskLevel) return 0;
  if (aiRiskLevel === 'Likely Safe') return -10;
  if (aiRiskLevel === 'High Risk') return 10;
  return 0;
}

function mergeReasonsAndActions(ruleBased, aiParsed) {
  const mergedReasons = [...ruleBased.reasons, ...(Array.isArray(aiParsed?.reasons) ? aiParsed.reasons : [])]
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .slice(0, 3);

  const mergedActions = [...ruleBased.actions, ...(Array.isArray(aiParsed?.actions) ? aiParsed.actions : [])]
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .slice(0, 3);

  return {
    reasons: mergedReasons,
    actions: mergedActions,
  };
}

export async function analyzeMessageWithAI(message) {
  const ruleBased = buildRuleBasedSignals(message);

  if (!env.nvidiaApiKey) {
    return normalizeAnalysis({
      riskLevel: ruleBased.riskLevel,
      confidence: ruleBased.ruleScore,
      reasons: ruleBased.reasons,
      actions: ruleBased.actions,
    });
  }

  if (ruleBased.isSafeTransactionRule || ruleBased.isDangerRule) {
    return normalizeAnalysis({
      riskLevel: ruleBased.riskLevel,
      confidence: ruleBased.ruleScore,
      reasons: ruleBased.reasons,
      actions: ruleBased.actions,
    });
  }

  const client = new OpenAI({
    apiKey: env.nvidiaApiKey,
    baseURL: env.nvidiaBaseUrl,
  });

  let completion;

  try {
    completion = await client.chat.completions.create({
      model: env.nvidiaModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this message for scam risk in India:\n\n"""${message}"""`,
        },
      ],
    });
  } catch (apiError) {
    const statusCode = apiError?.status || 503;
    const error = new Error(
      statusCode === 401
        ? 'Invalid NVIDIA_API_KEY in backend/.env. Please update it and restart backend.'
        : 'NVIDIA AI service is temporarily unavailable. Please try again shortly.'
    );
    error.statusCode = statusCode === 401 ? 503 : statusCode;
    throw error;
  }

  const rawContent = completion.choices?.[0]?.message?.content;
  let parsed;

  try {
    parsed = JSON.parse(rawContent || '{}');
  } catch {
    parsed = {
      riskLevel: 'Uncertain',
      confidence: 50,
      reasons: ['Contains some risk signals', 'Sender identity is not fully verified'],
      actions: ['Verify the sender before taking action', 'Avoid sharing personal or financial details'],
    };
  }

  const aiRiskLevel = parseAiRiskLevel(parsed?.riskLevel);
  const aiAdjustment = getAiAdjustment(aiRiskLevel, ruleBased.riskLevel);
  const adjustedScore = clampScore(ruleBased.ruleScore + aiAdjustment);
  const boundedAdjustedScore = clampScore(
    Math.max(ruleBased.ruleScore - 10, Math.min(ruleBased.ruleScore + 10, adjustedScore))
  );

  const finalRiskLevel = ruleBased.riskLevel;
  const finalConfidence = finalRiskLevel === 'Likely Safe' ? Math.min(35, boundedAdjustedScore) : boundedAdjustedScore;
  const merged = mergeReasonsAndActions(ruleBased, parsed);

  return normalizeAnalysis({
    riskLevel: finalRiskLevel,
    confidence: finalConfidence,
    reasons: merged.reasons,
    actions: merged.actions,
  });
}
