# Gemini API Setup - Quick Start

Get Gemini AI search working in 5 minutes.

---

## ✅ Already Done

- [x] Gemini SDK installed (`npm install @google/genai`)
- [x] API route created (`src/app/api/ai-search/route.ts`)
- [x] Frontend integrated (Smart search button in HeroSearch)
- [x] Documentation ready

---

## 🚀 What You Need To Do

### Step 1: Get Your Gemini API Key (2 minutes)

1. Go to https://aistudio.google.com/
2. Click **"Get API Key"** in top-left
3. Select **"Create API key in new Google Cloud project"**
4. Copy your API key

### Step 2: Add Environment Variable (30 seconds)

Create file `.env.local` in project root:

```
GEMINI_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with your actual key.

**Make sure `.env.local` is in `.gitignore`:**
```
.env.local
```

### Step 3: Restart Dev Server (1 minute)

```bash
npm run dev
```

Kill the server (Ctrl+C) and restart it so it reads the `.env.local` file.

### Step 4: Test It (1 minute)

1. Go to http://localhost:3000
2. Type in search box: **"SUV for 4 people near airport"**
3. Click **"Smart search"** button
4. Should say "Thinking..." for 2-3 seconds, then apply filters

✅ **Done!** Gemini is now processing your searches.

---

## 📝 Troubleshooting

### "Smart search" button doesn't work?
- Make sure you typed something in the search box
- Check browser console (F12) for errors
- Check server logs for `GEMINI_API_KEY` error

### Error: "Missing GEMINI_API_KEY"
→ Add it to `.env.local` and restart dev server

### Error: "Response could not be parsed"
→ Check if Gemini returned valid JSON. Refresh page and try again.

### "Thinking..." never completes
→ Check:
  1. Internet connection
  2. API key is valid
  3. Server logs for errors
  4. Browser console (F12)

---

## 🔍 Verify It's Working

### Check 1: Environment Variable Loaded
Create `src/app/api/check-env/route.ts`:
```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    keyPreview: process.env.GEMINI_API_KEY?.slice(0, 10) + "...",
  });
}
```

Visit http://localhost:3000/api/check-env

Should show: `{ "hasGeminiKey": true, "keyPreview": "AIzaSyJ..." }`

### Check 2: API Call Direct
In browser console:
```javascript
const query = "Honda CR-V in Karachi";
fetch("/api/ai-search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query, city: "Karachi" })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

Should return filters JSON.

---

## 📊 Monitor Usage

1. Go to https://aistudio.google.com/
2. Click **"Dashboard"** → **"Usage"**
3. See your API calls count and costs

---

## 💰 Pricing

**Free Tier:**
- 1,000 requests/day
- Perfect for development

**Paid Tier:**
- $0.075 per 1M input tokens
- $0.30 per 1M output tokens
- Each search = ~100-200 tokens (~$0.000015)

---

## 🔐 Security Checklist

- [ ] API key is in `.env.local` (NOT in git)
- [ ] `.env.local` is in `.gitignore`
- [ ] Never log or expose the API key
- [ ] API calls are server-side only (safe)
- [ ] API key is NOT in client-side code

---

## 📚 Next Steps

After verifying it works:

1. **Customize the prompt** in `src/app/api/ai-search/route.ts` to match your exact filters
2. **Test with various queries** to see what works
3. **Add more AI features** (see `GEMINI_EXAMPLES.md`)
4. **Implement error handling** for production
5. **Set up monitoring** for API usage

---

## 🎯 Example Queries to Test

Try these in the search box:

```
"luxury SUV for 4 people"
"cheap sedan with driver"
"automatic transmission hatchback Karachi"
"new Toyota in Lahore under 3000"
"petrol Corolla manual transmission"
"electric car 2024"
```

Each should parse into appropriate filters.

---

## 📖 Documentation Files

- **GEMINI_INTEGRATION.md** — Full technical docs
- **GEMINI_EXAMPLES.md** — Code examples for advanced features
- **GEMINI_SETUP.md** — This file (quick start)

---

## 💬 Support

If something breaks:

1. Check browser console (F12) for errors
2. Check server logs (terminal running `npm run dev`)
3. Verify `.env.local` exists with correct key
4. Try `npm run dev` again
5. Check [Gemini API Status](https://status.cloud.google.com/)

---

**You're all set! 🎉**

Your rent-a-car app now has AI-powered search!
