import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeCv } from './lib/gemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Missing GEMINI_API_KEY',
      details: 'Configure GEMINI_API_KEY no Vercel e faça redeploy.',
    });
  }

  try {
    const { jobDetails, cvText, cvPromptTemplate, currentDate } = req.body || {};

    if (!jobDetails || !cvText || !cvPromptTemplate || !currentDate) {
      return res.status(400).json({
        error: 'Payload incompleto para análise de CV',
        receivedKeys: Object.keys(req.body || {}),
      });
    }

    const result = await analyzeCv(jobDetails, cvText, cvPromptTemplate, currentDate);

    return res.status(200).json({ result });
  } catch (error: any) {
    console.error('❌ Erro analyze-cv:', error);
    return res.status(500).json({
      error: 'Erro ao analisar CV',
      details: error?.message || String(error),
    });
  }
}
