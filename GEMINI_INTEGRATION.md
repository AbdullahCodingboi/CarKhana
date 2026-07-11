# Gemini API Integration Guide

This document explains how the Google Gemini API is integrated into the Rent-a-Car application for AI-powered smart search.

## 📋 Overview

The Gemini API is used to power the **Smart Search** feature, which converts natural language queries into structured car rental filters. Instead of users manually selecting filters, they can type conversational queries like:
- "SUV for 5 people near airport"
- "cheap manual car in Karachi"
- "luxury automatic sedan with driver"

The Gemini model parses these queries and extracts structured filters that match your database.

---

## 🔧 Setup

### 1. Install Dependencies

The Gemini API SDK is already installed:
```bash
npm install @google/genai
```

### 2. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **"Get API Key"**
3. Create a new API key (or use existing)
4. Copy the key

### 3. Set Environment Variable

Create a `.env.local` file in the project root:
```
GEMINI_API_KEY=your_api_key_here
```

**Never commit this file to git!** Add to `.gitignore`:
```
.env.local
```

---

## 🔌 How It Works

### Architecture Flow

```
User Query (Frontend)
    ↓
POST /api/ai-search
    ↓
Gemini 3.5 Flash Model
    ↓
Parse & Extract Filters
    ↓
Return JSON with structured filters
    ↓
Apply filters to car listings
    ↓
Display results
```

### File Structure

```
src/
├── app/
│   ├── page.tsx                 # Main page with smart search handler
│   └── api/
│       └── ai-search/
│           └── route.ts         # Gemini API endpoint
├── components/
│   └── HeroSearch.tsx           # Search UI with "Smart search" button
└── lib/
    └── api.ts                   # Car fetching utilities
```

### Key Files

#### 1. **[src/app/api/ai-search/route.ts](src/app/api/ai-search/route.ts)** — The Brain
This is where Gemini is called. It:
- Receives a natural language query
- Sends it to Gemini 3.5 Flash
- Extracts structured JSON filters
- Returns them to the frontend

**Prompt sent to Gemini:**
```
Convert the user's request into a JSON object with fields:
- search, city, brand, model, carType, fuelType, transmission
- condition, driverOption, priceMin, priceMax
Return ONLY valid JSON.
```

#### 2. **[src/app/page.tsx](src/app/page.tsx)** — The Handler
The `handleSmartSearch()` function:
```typescript
const handleSmartSearch = async () => {
  const response = await axios.post("/api/ai-search", {
    query: search,      // User's natural language input
    city,               // City context (optional)
  });
  
  const parsed = response.data;
  // Apply extracted filters to search
  setFilters((prev) => ({
    ...prev,
    brand: parsed.brand,
    carType: parsed.carType,
    priceMin: parsed.priceMin,
    // ... other filters
  }));
};
```

#### 3. **[src/components/HeroSearch.tsx](src/components/HeroSearch.tsx)** — The UI
The "Smart search" button triggers `onSmartSearch()` callback:
```typescript
<button
  type="button"
  onClick={onSmartSearch}
  disabled={!search.trim() || aiSearching}
>
  {aiSearching ? "Thinking..." : "Smart search"}
</button>
```

---

## 💡 Example Usage

### User Types:
```
"luxury SUV for 4 people this weekend"
```

### Gemini Parses to:
```json
{
  "search": "luxury SUV",
  "carType": "SUV",
  "seatingCapacity": 4,
  "condition": "New",
  "priceMin": 5000,
  "city": null
}
```

### Result:
Filters applied → SUV with 4+ seats, luxury condition, ≥5000/day shown

---

## 📊 Filter Fields Extracted

| Field | Type | Examples |
|-------|------|----------|
| `search` | string | Brand, model, type keywords |
| `brand` | string | Honda, Toyota, Hyundai |
| `model` | string | Corolla, CR-V, i10 |
| `carType` | string | SUV, Sedan, Hatchback, Truck, Van, Pickup, Coupe |
| `fuelType` | string | Petrol, Diesel, CNG, Electric, Hybrid |
| `transmission` | string | Automatic, Manual |
| `condition` | string | New, Like New, Good, Fair |
| `driverOption` | string | with-driver, without-driver |
| `city` | string | City name |
| `seatingCapacity` | number | 2-8 passengers |
| `priceMin` | number | Minimum daily rate (₨) |
| `priceMax` | number | Maximum daily rate (₨) |

---

## 🚀 How Gemini Understands Intent

Gemini is instructed to be smart about parsing:

```javascript
// These phrases are understood:
"cheap" → low priceMax
"luxury" → high priceMin
"budget" → low priceMax
"5-seater" → seatingCapacity: 5
"4 passengers" → seatingCapacity: 4
"with driver" → driverOption: "with-driver"
"without driver" → driverOption: "without-driver"
"petrol" → fuelType: "Petrol"
"diesel" → fuelType: "Diesel"
"automatic" → transmission: "Automatic"
"manual" → transmission: "Manual"
"new" → condition: "New"
"used" → condition: "Fair" or "Good"
```

---

## ⚙️ API Endpoint

### POST `/api/ai-search`

**Request:**
```json
{
  "query": "SUV for 4 people near airport",
  "city": "Karachi"
}
```

**Response:**
```json
{
  "search": "SUV",
  "city": "Karachi",
  "brand": null,
  "model": null,
  "carType": "SUV",
  "fuelType": null,
  "transmission": null,
  "condition": null,
  "driverOption": null,
  "seatingCapacity": 4,
  "priceMin": null,
  "priceMax": null
}
```

**Error Response:**
```json
{
  "error": "Missing Gemini API key on server. Add GEMINI_API_KEY to your environment."
}
```

---

## 🌍 Environment Variables

### Required
- `GEMINI_API_KEY` — Your Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Optional (not yet used, but prepared)
- None at the moment

---

## 📈 Model Used

- **Model:** `gemini-3.5-flash`
- **Why:** Fast, cost-effective, excellent for structured output
- **Temperature:** Default (0.7)
- **Max Tokens:** Unlimited (prompt is small)

---

## 💰 Pricing

Gemini API is **free** for development (1000 free calls/day). After that:
- **Gemini 1.5 Flash:** $0.075 per 1M input tokens, $0.30 per 1M output tokens

Each search query is ~100-200 tokens, so you can run ~5000 searches for $1.

---

## 🔮 Future Enhancements

### 1. **Conversation History** (Multi-turn)
Currently, each search is independent. Add conversation history:
```typescript
const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: userQuery,
  previous_interaction_id: previousId  // Use stateful conversations
});
```

### 2. **Image Processing**
Users upload a car photo → Gemini describes it → Auto-fill listing form
```typescript
const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: [
    { type: "text", text: "Describe this car's type and condition" },
    { type: "image", data: imageBase64, mime_type: "image/jpeg" }
  ]
});
```

### 3. **Listing Optimization**
When a host creates a listing, Gemini suggests:
- Better title
- Better description
- Recommended tags
- Price range

```typescript
const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: `Improve this car listing:
Brand: ${brand}
Model: ${model}
Description: ${description}

Suggest:
1. Better title (10 words max)
2. Key selling points (3-5)
3. Recommended tags
4. Typical price range for this type`,
});
```

### 4. **Review Analysis & Sentiment**
Summarize reviews using Gemini to identify common issues:
```typescript
const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: `Analyze these reviews:
${reviews.join("\n")}

Return JSON:
{ pros: [...], cons: [...], avgRating: X/5, commonIssues: [...] }`,
});
```

### 5. **Personalized Recommendations**
Based on user's search history, recommend similar cars:
```typescript
const interaction = await ai.interactions.create({
  model: "gemini-3.5-flash",
  input: `User searched for: ${userSearches.join(", ")}
Available cars: ${availableCars}
Recommend 3 cars this user might like (JSON with carIds)`,
});
```

### 6. **Real-time Availability Predictions**
Predict which cars will be booked soon based on trends.

---

## 🐛 Troubleshooting

### Error: "Missing Gemini API key"
→ Check `.env.local` exists with `GEMINI_API_KEY=...`

### Error: "Response could not be parsed"
→ Gemini might return non-JSON. Check browser console for raw response.

### Smart Search button disabled
→ Enter a query in the search box first (minimum 1 character).

### Slow response
→ Normal for the first request (~2-3 seconds). Subsequent calls are cached.

---

## 📚 Resources

- **Gemini API Docs:** https://ai.google.dev/
- **Interactions API Guide:** https://ai.google.dev/docs/interactions
- **Function Calling:** https://ai.google.dev/docs/function_calling
- **Structured Output:** https://ai.google.dev/docs/structured_output

---

## ✅ Checklist

- [x] Gemini SDK installed
- [x] API endpoint created (`/api/ai-search`)
- [x] Frontend integration (Smart search button)
- [x] Environment variable setup
- [ ] Add Gemini API key to `.env.local`
- [ ] Test smart search in browser
- [ ] Set up billing (optional, for high usage)

---

**Last Updated:** July 2026
