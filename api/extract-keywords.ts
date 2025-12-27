import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractKeywordsFromJobDescription } from './lib/gemini';

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
    const { jobDetails, keywordPromptTemplate } = req.body || {};

    if (!jobDetails || !keywordPromptTemplate) {
      return res.status(400).json({
        error: 'Payload incompleto para extração de keywords',
        receivedKeys: Object.keys(req.body || {}),
      });
    }

    const keywords = await extractKeywordsFromJobDescription(jobDetails, keywordPromptTemplate);

    return res.status(200).json({ keywords });
  } catch (error: any) {
    console.error('❌ Erro extract-keywords:', error);
    return res.status(500).json({
      error: 'Erro ao extrair keywords',
      details: error?.message || String(error),
    });
  }
}
