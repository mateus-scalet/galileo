import type { VercelRequest, VercelResponse } from '@vercel/node';
import { evaluateAnswers } from './lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Missing GEMINI_API_KEY',
      details: 'Configure GEMINI_API_KEY no Vercel (Preview + Production) e redeploy.',
    });
  }

  try {
    const {
      jobDetails,
      interviewScript,
      answers,
      evaluationPromptTemplate,
      originalityPromptTemplate,
      feedbackPromptTemplate,
    } = req.body || {};

    if (
      !jobDetails ||
      !interviewScript ||
      !answers ||
      !evaluationPromptTemplate ||
      !originalityPromptTemplate ||
      !feedbackPromptTemplate
    ) {
      return res.status(400).json({
        error: 'Payload incompleto para avaliar entrevista',
        receivedKeys: Object.keys(req.body || {}),
      });
    }

    const evaluation = await evaluateAnswers(
      jobDetails,
      interviewScript,
      answers,
      evaluationPromptTemplate,
      originalityPromptTemplate,
      feedbackPromptTemplate
    );

    return res.status(200).json({ evaluation });
  } catch (error: any) {
    console.error('❌ Erro evaluate-interview:', error);
    return res.status(500).json({
      error: 'Erro ao avaliar entrevista',
      details: error?.message || String(error),
    });
  }
}
