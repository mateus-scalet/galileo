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

  // ✅ LISTAR MODELOS (via REST)
  // GET /api/gemini?listModels=1
  if (req.method === "GET" && req.query?.listModels === "1") {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        apiKey
      )}`;

      const r = await fetch(url, { method: "GET" });
      const text = await r.text();

      if (!r.ok) {
        return res.status(r.status).json({
          error: "Erro ao listar modelos",
          details: text,
        });
      }

      // retorna JSON bruto do Google (contém "models")
      return res.status(200).send(text);
    } catch (error: any) {
      console.error("Erro list models:", error);
      return res.status(500).json({
        error: "Erro ao listar modelos",
        details: error?.message || "Erro desconhecido",
      });
    }
  }

  // ✅ CHAMAR GEMINI
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, model: modelFromBody } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Você pode mandar model no body OU setar GEMINI_MODEL no Vercel.
    // Vamos deixar um fallback, mas você vai trocar depois de ver a lista.
    const modelName =
      (typeof modelFromBody === "string" && modelFromBody.trim()) ||
      (process.env.GEMINI_MODEL || "").trim() ||
      "models/gemini-1.5-flash";

    const genAI = new GoogleGenerativeAI(apiKey);

    // OBS: algumas listas retornam nomes no formato "models/xxxxx"
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
