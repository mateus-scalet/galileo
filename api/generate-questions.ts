import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  generateQuestions
} from './_lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      jobDetails,
      questionPromptTemplate,
      baselineAnswerPromptTemplate
    } = req.body;

    if (!jobDetails || !questionPromptTemplate || !baselineAnswerPromptTemplate) {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    const questions = await generateQuestions(
      jobDetails,
      questionPromptTemplate,
      baselineAnswerPromptTemplate
    );

    return res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Erro em /api/generate-questions:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao gerar perguntas'
    });
  }
}
