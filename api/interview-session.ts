import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const audio = req.body;

  if (!audio) {
    return res.status(400).json({ error: 'No audio received' });
  }

  console.log('🎧 Áudio recebido no backend');

  // Por enquanto: NÃO chama IA
  return res.status(200).json({
    ok: true,
    message: 'Áudio recebido com sucesso',
  });
}
