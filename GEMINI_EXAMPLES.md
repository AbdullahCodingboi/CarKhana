# Gemini Integration - Code Examples & Patterns

This file provides copy-paste ready code examples for extending Gemini AI throughout the rent-a-car application.

---

## 1. Enhanced Smart Search with Multi-turn Conversations

**Location:** `src/lib/gemini-search.ts`

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface SearchContext {
  interactionId?: string;
  previousQueries?: string[];
  userLocation?: string;
}

export async function enhancedSmartSearch(
  query: string,
  context: SearchContext
) {
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: `You are a car rental assistant. Convert this query into filters.
Query: "${query}"
Previous queries: ${context.previousQueries?.join(", ") || "none"}
User location: ${context.userLocation || "unknown"}

Return JSON with: search, city, brand, model, carType, fuelType, transmission, condition, driverOption, seatingCapacity, priceMin, priceMax`,
      previous_interaction_id: context.interactionId, // Maintain conversation history
    });

    return {
      filters: JSON.parse(interaction.output_text!),
      interactionId: interaction.id,
      usage: interaction.usage,
    };
  } catch (error) {
    console.error("Gemini search error:", error);
    throw error;
  }
}
```

**Usage in API route:**
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const { query, city, previousInteractionId } = body;

  const result = await enhancedSmartSearch(query, {
    interactionId: previousInteractionId,
    userLocation: city,
  });

  return Response.json(result.filters);
}
```

---

## 2. Car Listing Optimizer (For Host Listings)

**Location:** `src/app/api/optimize-listing/route.ts`

```typescript
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const body = await request.json();
  const { brand, model, year, description, condition, fuelType } = body;

  const api = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const prompt = `I'm listing a car for rent. Help me optimize my listing.

Car Details:
- Brand: ${brand}
- Model: ${model}
- Year: ${year}
- Condition: ${condition}
- Fuel Type: ${fuelType}
- Current Description: "${description}"

Provide JSON with:
{
  "suggestedTitle": "Compelling title (max 10 words)",
  "improvedDescription": "2-3 sentences, focus on appeal",
  "keySellingPoints": ["point1", "point2", "point3"],
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "priceRangeSuggestion": { "min": number, "max": number },
  "whyThesePoints": "brief explanation"
}`;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const suggestions = JSON.parse(interaction.output_text!);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to optimize listing" },
      { status: 500 }
    );
  }
}
```

**Frontend usage:**
```typescript
// In car listing form
const optimizeListing = async () => {
  const response = await axios.post("/api/optimize-listing", {
    brand: formData.brand,
    model: formData.model,
    year: formData.year,
    description: formData.description,
    condition: formData.condition,
    fuelType: formData.fuelType,
  });

  const { suggestions } = response.data;
  setFormData((prev) => ({
    ...prev,
    title: suggestions.suggestedTitle,
    description: suggestions.improvedDescription,
    tags: suggestions.suggestedTags,
  }));

  setSuggestions(suggestions);
};
```

---

## 3. Image-based Car Analysis

**Location:** `src/app/api/analyze-car-image/route.ts`

```typescript
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const body = await request.json();
  const { imageBase64, mimeType = "image/jpeg" } = body;

  const api = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const prompt = `Analyze this car image and extract information.

Return JSON with:
{
  "carType": "SUV|Sedan|Hatchback|Truck|Van|Pickup|Coupe",
  "estimatedCondition": "New|Like New|Good|Fair",
  "visibleDamage": ["none" or list issues],
  "exteriorColor": "color",
  "interiorType": "Leather|Fabric|Mixed",
  "features": ["list of visible features"],
  "confidence": 0-100,
  "notes": "additional observations"
}`;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: [
        { type: "text", text: prompt },
        {
          type: "image",
          data: imageBase64,
          mime_type: mimeType,
        },
      ],
    });

    const analysis = JSON.parse(interaction.output_text!);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze image" },
      { status: 500 }
    );
  }
}
```

**Frontend usage:**
```typescript
const analyzeCarPhoto = async (file: File) => {
  const base64 = await fileToBase64(file);

  const response = await axios.post("/api/analyze-car-image", {
    imageBase64: base64,
    mimeType: file.type,
  });

  const { analysis } = response.data;
  
  // Auto-fill form fields
  setFormData((prev) => ({
    ...prev,
    carType: analysis.carType,
    condition: analysis.estimatedCondition,
    exteriorColor: analysis.exteriorColor,
  }));

  setAnalysisResults(analysis);
};
```

---

## 4. Review Summary & Sentiment Analysis

**Location:** `src/app/api/summarize-reviews/route.ts`

```typescript
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface Review {
  rating: number;
  text: string;
  author: string;
  date: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { carId, reviews }: { carId: string; reviews: Review[] } = body;

  if (!reviews.length) {
    return NextResponse.json({ error: "No reviews to analyze" }, { status: 400 });
  }

  const api = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const reviewsText = reviews
    .map((r) => `Rating: ${r.rating}/5\n"${r.text}"`)
    .join("\n\n");

  const prompt = `Analyze these car rental reviews and provide insights.

Reviews:
${reviewsText}

Return JSON with:
{
  "averageRating": 0-5,
  "totalReviews": number,
  "sentiment": "positive|neutral|negative",
  "pros": ["top positive aspects"],
  "cons": ["top negative aspects"],
  "commonThemes": {
    "positive": ["theme1", "theme2"],
    "negative": ["theme1", "theme2"]
  },
  "reliabilityScore": 0-100,
  "recommendationRate": "High|Medium|Low",
  "summary": "1-2 sentence summary"
}`;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const analysis = JSON.parse(interaction.output_text!);

    return NextResponse.json({
      success: true,
      carId,
      analysis,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to summarize reviews" },
      { status: 500 }
    );
  }
}
```

---

## 5. Smart Price Recommendation Engine

**Location:** `src/app/api/price-suggestion/route.ts`

```typescript
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface CarData {
  brand: string;
  model: string;
  year: number;
  condition: string;
  mileage: number;
  carType: string;
  transmission: string;
  fuelType: string;
  city: string;
  features: string[];
}

export async function POST(request: Request) {
  const body = await request.json();
  const carData: CarData = body;

  const api = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const prompt = `Based on this car data, suggest optimal daily rental prices in PKR.

Car Details:
- Brand: ${carData.brand}
- Model: ${carData.model}
- Year: ${carData.year}
- Condition: ${carData.condition}
- Mileage: ${carData.mileage}
- Type: ${carData.carType}
- Transmission: ${carData.transmission}
- Fuel: ${carData.fuelType}
- City: ${carData.city}
- Features: ${carData.features.join(", ")}

Consider:
1. Market demand in ${carData.city}
2. Seasonality (peak seasons = higher prices)
3. Condition & age
4. Competition
5. Demand for this car type

Return JSON with:
{
  "pricePerDay": {
    "min": number,
    "suggested": number,
    "max": number
  },
  "priceWithDriver": {
    "min": number,
    "suggested": number,
    "max": number
  },
  "reasoning": "brief explanation",
  "seasonalAdjustment": {
    "peak": "% increase",
    "offPeak": "% decrease"
  },
  "competitorAnalysis": "how this price compares to similar cars"
}`;

  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
    });

    const pricing = JSON.parse(interaction.output_text!);

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to suggest pricing" },
      { status: 500 }
    );
  }
}
```

---

## 6. Automated Chat Support

**Location:** `src/app/api/chat/route.ts`

```typescript
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { message, conversationId, history = [] } = body;

  const api = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const systemPrompt = `You are CarKhana support assistant. You help users with:
1. Finding cars (suggest smart search)
2. Booking inquiries
3. Policy questions
4. WhatsApp contact info
5. General car rental help

Keep responses concise (2-3 sentences). Be friendly and professional.`;

  try {
    let interaction: any;

    if (conversationId) {
      // Continue existing conversation (stateful)
      interaction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        input: message,
        previous_interaction_id: conversationId,
      });
    } else {
      // Start new conversation
      interaction = await api.interactions.create({
        model: "gemini-3.5-flash",
        input: message,
      });
    }

    const response = interaction.output_text!;

    return NextResponse.json({
      success: true,
      response,
      conversationId: interaction.id,
      usage: interaction.usage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
```

**Frontend React Hook:**
```typescript
import { useState } from "react";

export function useCarChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/chat", {
        message: userMessage,
        conversationId,
      });

      const assistantMessage = response.data.response;
      
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "assistant", content: assistantMessage },
      ]);

      setConversationId(response.data.conversationId);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
```

---

## 7. Gemini Utility Library

**Location:** `src/lib/gemini.ts`

```typescript
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY not set");
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

export interface GeminiOptions {
  model?: string;
  temperature?: number;
  streaming?: boolean;
}

/**
 * Generic Gemini interaction
 */
export async function geminiInteract(
  input: string | any[],
  options: GeminiOptions = {}
) {
  const { model = "gemini-3.5-flash", streaming = false } = options;

  try {
    if (streaming) {
      return await ai.interactions.create({
        model,
        input,
        stream: true,
      });
    } else {
      const interaction = await ai.interactions.create({
        model,
        input,
      });
      return interaction.output_text;
    }
  } catch (error) {
    console.error("Gemini error:", error);
    throw error;
  }
}

/**
 * Parse natural language to JSON
 */
export async function parseToJSON(
  text: string,
  schema: string,
  examples?: any
) {
  const prompt = `Extract data from this text and return as JSON.

Text: "${text}"

Schema: ${schema}
${examples ? `Examples: ${JSON.stringify(examples)}` : ""}

Return ONLY valid JSON.`;

  const response = await geminiInteract(prompt);
  return JSON.parse(response);
}

/**
 * Summarize long text
 */
export async function summarize(text: string, maxLength: number = 200) {
  const prompt = `Summarize this in ${maxLength} characters:

${text}`;

  return await geminiInteract(prompt);
}

/**
 * Classify text
 */
export async function classify(
  text: string,
  categories: string[]
) {
  const prompt = `Classify this text into one of: ${categories.join(", ")}

Text: "${text}"

Return JSON: { category: "...", confidence: 0-100 }`;

  const response = await geminiInteract(prompt);
  return JSON.parse(response);
}

/**
 * Generate options
 */
export async function generate(
  prompt: string,
  count: number = 3
) {
  const request = `${prompt}

Generate exactly ${count} options. Return as JSON array: ["option1", "option2", ...]`;

  const response = await geminiInteract(request);
  return JSON.parse(response);
}
```

---

## Integration Checklist

- [ ] Add `GEMINI_API_KEY` to `.env.local`
- [ ] Choose which features to implement (start with smart search)
- [ ] Copy relevant API route file
- [ ] Test in browser/Postman
- [ ] Add frontend component if needed
- [ ] Monitor API usage & costs
- [ ] Add error handling & logging

---

**Note:** These are production-ready patterns. Customize prompts based on your specific needs!
