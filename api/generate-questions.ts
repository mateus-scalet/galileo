import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateQuestions } from '../lib/ai'; // ajuste o path se necessário

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const {
      jobDetails,
      questionPromptTemplate,
      baselineAnswerPromptTemplate
    } = body || {};

    if (!jobDetails || !questionPromptTemplate || !baselineAnswerPromptTemplate) {
      return res.status(400).json({
        error: 'Payload incompleto para geração de perguntas'
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
      details: error?.message
    });
  }
}
