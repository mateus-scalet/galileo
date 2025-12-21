import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "models/gemini-flash-latest";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      return res.json({ error: "Method not allowed" });
    }

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      res.statusCode = 500;
      return res.json({
        error: "Missing GEMINI_API_KEY",
        details:
          "Configure GEMINI_API_KEY no Vercel (Production) e faça redeploy.",
      });
    }

    const body = req.body || {};
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      res.statusCode = 400;
      return res.json({ error: "Prompt is required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.statusCode = 200;
    return res.json({ text, model: MODEL });
  } catch (error: any) {
    console.error("FUNCTION_ERROR /api/gemini:", error);

    // tenta devolver algo útil mesmo quando dá crash
    res.statusCode = 500;
    return res.json({
      error: "FUNCTION_INVOCATION_FAILED",
      details: error?.message || String(error),
      stack: error?.stack || null,
    });
  }
}
