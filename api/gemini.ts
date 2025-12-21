import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "models/gemini-flash-latest";

export default async function handler(req: any, res: any) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY",
      details:
        "A variável GEMINI_API_KEY não está disponível neste deploy. Verifique Environment Variables e faça redeploy.",
    });
  }

  // (opcional) manter o listModels pra debug
  if (req.method === "GET" && req.query?.listModels === "1") {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey
      )}`;
      const r = await fetch(url);
      const text = await r.text();
      return res.status(r.ok ? 200 : r.status).send(text);
    } catch (error: any) {
      return res.status(500).json({
        error: "Erro ao listar modelos",
        details: error?.message || "Erro desconhecido",
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ fixado no modelo disponível no seu projeto
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const result = await model.generateContent(prompt);
    return res.status(200).json({ text: result.response.text(), model: DEFAULT_MODEL });
  } catch (error: any) {
    console.error("Erro Gemini API:", error);
    return res.status(500).json({
      error: "Erro ao chamar Gemini",
      details: error?.message || "Erro desconhecido",
    });
  }
}
