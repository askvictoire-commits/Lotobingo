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
      'This image is a bingo grid. Extract all numbers organized in exactly 3 rows of 9 numbers each. Return only a raw JSON, no markdown: { "lines": [[n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n],[n,n,n,n,n,n,n,n,n]] }. All values are between 0 and 100.';

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        { error: "Gemini API error" },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText: string =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

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
        { error: "Could not find JSON in response" },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure: must have exactly 3 rows of 9
    if (
      !parsed.lines ||
      !Array.isArray(parsed.lines) ||
      parsed.lines.length !== 3 ||
      parsed.lines.some(
        (row: unknown) => !Array.isArray(row) || (row as unknown[]).length !== 9
      )
    ) {
      return NextResponse.json(
        { error: "Grid structure invalid (expected 3×9)" },
        { status: 422 }
      );
    }

    // Clamp values to 0–100
    const lines: number[][] = parsed.lines.map((row: unknown[]) =>
      row.map((n) => {
        const num = Number(n);
        return isNaN(num) ? 0 : Math.min(100, Math.max(0, Math.round(num)));
      })
    );

    return NextResponse.json({ lines });
  } catch (err) {
    console.error("OCR route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
