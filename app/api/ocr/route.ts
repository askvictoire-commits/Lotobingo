import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server" },
        { status: 500 }
      );
    }

    const prompt =
      "This image shows a French loto/bingo card. It has 3 rows and 9 columns of numbers. " +
      "Some cells may be empty or contain 0. Extract all numbers row by row. " +
      'Return ONLY this raw JSON (no markdown, no explanation): { "lines": [[r1c1,r1c2,...,r1c9],[r2c1,...,r2c9],[r3c1,...,r3c9]] }. ' +
      "Use 0 for empty cells. All numbers are integers between 0 and 100.";

    // Utilise les modèles existants listés par l'API (gemini 1.5 est déprécié/inaccessible ici)
    const models = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest"
    ];
    let geminiRes: Response | null = null;
    const errors: string[] = [];
    let lastErrText = "";

    for (const model of models) {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: mimeType || "image/jpeg", data: image } },
                ],
              },
            ],
            generationConfig: { temperature: 0, maxOutputTokens: 2048 },
          }),
        }
      );
      if (geminiRes.ok) break;
      lastErrText = await geminiRes.text();
      errors.push(`${model}: ${lastErrText}`);
      console.error(`Model ${model} failed:`, lastErrText);
    }

    if (!geminiRes || !geminiRes.ok) {
      // Return the error from the first model (usually the most preferred one)
      let friendlyError = "Gemini API error";
      try {
        const firstErr = errors[0] || "Unknown Error";
        const parsed = JSON.parse(firstErr.substring(firstErr.indexOf('{')));
        friendlyError = parsed?.error?.message || friendlyError;
      } catch { /* ignore */ }
      return NextResponse.json({ error: friendlyError, details: errors }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    console.log("Gemini raw response:", rawText);

    if (!rawText) {
      return NextResponse.json({ error: "Empty response from Gemini" }, { status: 422 });
    }

    // Nettoyage agressif : enlève les quotes Markdown et espace autour
    const cleaned = rawText.replace(/```(json)?/gi, "").replace(/```/g, "").trim();

    let parsed: { lines?: unknown[] } = {};
    try {
      // Première tentative : parser le json nettoyé directement
      parsed = JSON.parse(cleaned) as { lines?: unknown[] };
    } catch {
      // Deuxième tentative : extraction via regex pour trouver le premier { et le dernier }
      const startIndex = cleaned.indexOf("{");
      const endIndex = cleaned.lastIndexOf("}");
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        try {
           parsed = JSON.parse(cleaned.substring(startIndex, endIndex + 1));
        } catch {
           return NextResponse.json({ error: `Erreur de lecture JSON. Début extrait: ${cleaned.substring(startIndex, startIndex + 50)}...` }, { status: 422 });
        }
      } else {
         // Peut-être qu'il a juste renvoyé le tableau [ [...] ] ?
         const startArr = cleaned.indexOf("[");
         const endArr = cleaned.lastIndexOf("]");
         if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
            try {
               const arrayParsed = JSON.parse(cleaned.substring(startArr, endArr + 1));
               parsed = { lines: arrayParsed };
            } catch {
               return NextResponse.json({ error: `JSON incomplet/illisible: ${cleaned.slice(0, 100)}...` }, { status: 422 });
            }
         } else {
            return NextResponse.json({ error: `JSON introuvable dans la réponse: ${cleaned.slice(0, 100)}...` }, { status: 422 });
         }
      }
    }

    const parsedLines = parsed.lines;
    if (!parsedLines || !Array.isArray(parsedLines) || parsedLines.length === 0) {
      return NextResponse.json({ error: "Structure invalide (pas de lignes)" }, { status: 422 });
    }

    // Normalize: ensure exactly 3 rows of 9 (pad/truncate as needed)
    const lines: number[][] = [0, 1, 2].map((i) => {
      const row: unknown[] = Array.isArray(parsedLines[i]) ? (parsedLines[i] as unknown[]) : [];
      const normalized = Array.from({ length: 9 }, (_, j) => {
        const n = Number(row[j]);
        return isNaN(n) ? 0 : Math.min(100, Math.max(0, Math.round(n)));
      });
      return normalized;
    });

    return NextResponse.json({ lines });

  } catch (err) {
    console.error("OCR route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
