export function validateAnalyzeInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required.' };
  }

  const { message } = body;

  if (typeof message !== 'string') {
    return { valid: false, error: '"message" must be a string.' };
  }

  const trimmed = message.trim();
  if (trimmed.length < 5) {
    return { valid: false, error: '"message" must be at least 5 characters long.' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: '"message" must be at most 5000 characters long.' };
  }

  return { valid: true, message: trimmed };
}
