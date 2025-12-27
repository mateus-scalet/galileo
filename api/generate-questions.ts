import type { VercelRequest, VercelResponse } from '@vercel/node';

// IMPORTANT: ESM runtime no Vercel pode exigir extensão .js no import relativo
import { generateQuestions } from './lib/gemini.js';

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
    const { jobDetails, questionPromptTemplate, baselineAnswerPromptTemplate } = req.body || {};

    if (!jobDetails || !questionPromptTemplate || !baselineAnswerPromptTemplate) {
      return res.status(400).json({
        error: 'Payload incompleto para geração de perguntas',
        receivedKeys: Object.keys(req.body || {}),
      });
    }

    const questions = await generateQuestions(
      jobDetails,
      questionPromptTemplate,
      baselineAnswerPromptTemplate
    );

    return res.status(200).json({ questions });
  } catch (error: any) {
    console.error('❌ Erro generate-questions:', error);
    return res.status(500).json({
      error: 'Erro ao gerar perguntas',
      details: error?.message || String(error),
    });
  }
}
