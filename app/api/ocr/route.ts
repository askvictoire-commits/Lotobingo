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

    // Try gemini-2.0-flash first, fall back to gemini-1.5-flash
    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    let geminiRes: Response | null = null;
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
            generationConfig: { temperature: 0, maxOutputTokens: 512 },
          }),
        }
      );
      if (geminiRes.ok) break;
      lastErrText = await geminiRes.text();
      console.error(`Model ${model} failed:`, lastErrText);
    }

    if (!geminiRes || !geminiRes.ok) {
      // Try to extract a readable error message from Gemini's response
      let friendlyError = "Gemini API error";
      try {
        const parsed = JSON.parse(lastErrText);
        friendlyError = parsed?.error?.message || parsed?.error?.status || friendlyError;
      } catch { /* ignore */ }
      return NextResponse.json({ error: friendlyError }, { status: 502 });
    }

    const geminiData = await geminiRes.json();

    const rawText: string =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    console.log("Gemini raw response:", rawText);

    if (!rawText) {
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 422 }
      );
    }

    // Strip markdown code blocks if present
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: `JSON introuvable dans: ${cleaned.slice(0, 100)}` },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.lines || !Array.isArray(parsed.lines) || parsed.lines.length === 0) {
      return NextResponse.json(
        { error: "Structure invalide (pas de lignes)" },
        { status: 422 }
      );
    }

    // Normalize: ensure exactly 3 rows of 9 (pad/truncate as needed)
    const lines: number[][] = [0, 1, 2].map((i) => {
      const row: unknown[] = Array.isArray(parsed.lines[i]) ? parsed.lines[i] : [];
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
