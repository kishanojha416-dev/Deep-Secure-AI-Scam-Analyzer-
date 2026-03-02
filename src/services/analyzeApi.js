const API_URL = import.meta.env.VITE_API_URL;

export async function analyzeMessage(message) {
  if (!API_URL) {
    const missingEnvError = new Error('VITE_API_URL is not configured. Add it to your frontend .env file.');
    missingEnvError.status = 0;
    throw missingEnvError;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;

  try {
    response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout = error.name === 'AbortError';
    const messageText = isTimeout
      ? 'Analysis timed out. Please try again in a few seconds.'
      : 'Cannot reach analysis server. Please check your VITE_API_URL and backend deployment.';
    const networkError = new Error(messageText);
    networkError.status = 0;
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const messageText = payload?.error?.message || 'Unable to analyze message right now. Please try again.';
    const error = new Error(messageText);
    error.status = response.status;
    throw error;
  }

  return {
    risk: payload.riskLevel,
    confidence: payload.confidence,
    explanation: payload.explanation || '',
    reasons: payload.reasons,
    actions: payload.actions,
  };
}
