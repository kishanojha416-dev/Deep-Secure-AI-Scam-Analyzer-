import { validateAnalyzeInput } from '../validators/analyzeValidator.js';
import { analyzeMessageWithAI } from '../services/openaiService.js';

export async function analyzeController(req, res, next) {
  try {
    const validation = validateAnalyzeInput(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: validation.error,
        },
      });
    }

    const result = await analyzeMessageWithAI(validation.message);

    return res.status(200).json({
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      reasons: result.reasons,
      actions: result.actions,
    });
  } catch (error) {
    return next(error);
  }
}
