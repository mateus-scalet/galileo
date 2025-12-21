import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: "edge",
};

const MODEL = "models/gemini-flash-latest";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Missing GEMINI_API_KEY",
        details: "Configure a variável no Vercel (Production) e faça redeploy.",
      }),
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(
      JSON.stringify({ text, model: MODEL }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Erro ao chamar Gemini",
        details: error?.message || String(error),
      }),
      { status: 500 }
    );
  }
}
