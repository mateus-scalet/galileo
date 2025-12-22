export const config = {
  runtime: "edge",
};

const MODEL = "models/gemini-flash-latest";

// Remove ```json / ``` e tenta extrair JSON de um texto
function extractJson(text: string) {
  const cleaned = (text || "").replace(/```json/gi, "").replace(/```/g, "").trim();

  // tenta direto
  try {
    return JSON.parse(cleaned);
  } catch {}

  // tenta objeto {...}
  const fo = cleaned.indexOf("{");
  const lo = cleaned.lastIndexOf("}");
  if (fo !== -1 && lo !== -1 && lo > fo) {
    const slice = cleaned.slice(fo, lo + 1);
    return JSON.parse(slice);
  }

  // tenta array [...]
  const fa = cleaned.indexOf("[");
  const la = cleaned.lastIndexOf("]");
  if (fa !== -1 && la !== -1 && la > fa) {
    const slice = cleaned.slice(fa, la + 1);
    return JSON.parse(slice);
  }

  throw new Error("Resposta não contém JSON válido.");
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: { code: "METHOD_NOT_ALLOWED" } }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "MISSING_API_KEY",
          message: "Missing GEMINI_API_KEY",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: { code: "BAD_REQUEST", message: "prompt is required" },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    // Pedimos explicitamente JSON, mas ainda assim tratamos caso venha com ```json
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await r.text();

    if (!r.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: { code: "GEMINI_HTTP_ERROR", message: "Gemini request failed", details: raw },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiResponse = JSON.parse(raw);
    const text =
      apiResponse?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") || "";

    const data = extractJson(text);

    return new Response(JSON.stringify({ ok: true, data, model: MODEL }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: { code: "INTERNAL_ERROR", message: err?.message || String(err) },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
