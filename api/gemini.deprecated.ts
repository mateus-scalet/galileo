export const config = {
  runtime: "edge",
};

const MODEL = "models/gemini-flash-latest";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "Missing GEMINI_API_KEY",
        details: "Configure GEMINI_API_KEY no Vercel (Production) e faça redeploy.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const dataText = await r.text();

    if (!r.ok) {
      return new Response(
        JSON.stringify({
          error: "Erro ao chamar Gemini",
          status: r.status,
          details: dataText,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(dataText);

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text || "")
        .join("") || "";

    return new Response(JSON.stringify({ text, model: MODEL }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "FUNCTION_INVOCATION_FAILED",
        details: error?.message || String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
