import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY",
      details:
        "A variável GEMINI_API_KEY não está disponível neste deploy. Verifique Environment Variables e faça redeploy.",
    });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Modelo recomendado e amplamente suportado para generateContent
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    return res.status(200).json({ text: result.response.text() });
  } catch (error: any) {
    console.error("Erro Gemini API:", error);
    return res.status(500).json({
      error: "Erro ao chamar Gemini",
      details: error?.message || "Erro desconhecido",
    });
  }
}
