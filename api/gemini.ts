import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY",
      details:
        "A variável GEMINI_API_KEY não está disponível neste deploy. Verifique Environment Variables e faça redeploy.",
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // ✅ Endpoint para listar modelos disponíveis
  if (req.method === "GET" && req.query?.listModels === "1") {
    try {
      const modelsResponse = await (genAI as any).listModels();
      return res.status(200).json(modelsResponse);
    } catch (error: any) {
      console.error("Erro listModels:", error);
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
    const { prompt, model: modelFromBody } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // ✅ Vamos deixar configurável:
    // 1) body.model
    // 2) env GEMINI_MODEL
    // 3) fallback
    const modelName =
      (typeof modelFromBody === "string" && modelFromBody.trim()) ||
      (process.env.GEMINI_MODEL || "").trim() ||
      "gemini-1.5-pro-latest";

    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    return res.status(200).json({ text: result.response.text(), model: modelName });
  } catch (error: any) {
    console.error("Erro Gemini API:", error);
    return res.status(500).json({
      error: "Erro ao chamar Gemini",
      details: error?.message || "Erro desconhecido",
    });
  }
}
