import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// Ensure this route runs in the Node.js runtime (not the Edge runtime),
// because the @google/genai SDK requires Node APIs.
export const runtime = "nodejs";

function parseJson(content: string) {
  const cleaned = content.trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  const jsonText = jsonStart >= 0 && jsonEnd >= 0 ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned;
  return JSON.parse(jsonText);
}

function normalizeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : undefined;
}

export async function POST(request: Request) {
  const body = await request.json();
  const query = String(body.query || "").trim();
  const city = String(body.city || "").trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Gemini API key on server. Add GEMINI_API_KEY to your environment." },
      { status: 500 }
    );
  }

  const prompt = `You are a search assistant for a car listings site.
Convert the user's request into a JSON object with the following fields:
- search: main search term
- city: city/location
- brand: car brand
- model: car model
- carType: type of car (SUV, Sedan, Hatchback, Truck, Van, Pickup, Coupe)
- fuelType: fuel type (Petrol, Diesel, CNG, Electric, Hybrid)
- transmission: Automatic or Manual
- condition: New, Like New, Good, Fair
- driverOption: with-driver or without-driver
- priceMin: minimum daily rental price
- priceMax: maximum daily rental price

Return ONLY valid JSON. Use null for any unknown or irrelevant fields.

User query: "${query}"
City hint: "${city || "none"}"
`;

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const content = interaction.output_text || "";
    console.log("Gemini API Response:", content);

    let parsed;
    try {
      parsed = parseJson(content);
    } catch (err) {
      return NextResponse.json(
        { error: "Gemini response could not be parsed. Please try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({
      search: parsed.search ?? query,
      city: parsed.city ?? city,
      brand: parsed.brand ?? null,
      model: parsed.model ?? null,
      carType: parsed.carType ?? null,
      fuelType: parsed.fuelType ?? null,
      transmission: parsed.transmission ?? null,
      condition: parsed.condition ?? null,
      driverOption: parsed.driverOption ?? null,
      priceMin: normalizeNumber(parsed.priceMin),
      priceMax: normalizeNumber(parsed.priceMax),
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process AI search" },
      { status: 500 }
    );
  }
}
