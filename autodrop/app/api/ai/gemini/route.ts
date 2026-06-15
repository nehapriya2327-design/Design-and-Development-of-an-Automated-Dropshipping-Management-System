// /app/api/gemini/route.ts
import { success } from '@/lib/server/response';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';
import { NextResponse } from 'next/server';

function cleanRawJson(text: string): string {
    return text
        .replace(/^```(?:json)?\n?/i, '')
        .replace(/```$/, '')
        .replace(/[\u0000-\u001F]+/g, ' ')
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/:\s*"([^"]*)$/, (match, p1) => `: "${p1}"`);
}

export async function POST(req: Request) {
    const { productData, aspects } = await req.json();

    if (!productData) {
        return success({}, 'Missing productData', 400);
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return success({}, 'Missing Gemini API key', 500);
    }

    const instructions = `
You are an expert eBay Inventory API assistant.

Generate a valid JSON payload for the eBay 'createOrReplaceInventoryItem' API based on the given productData and required aspects.

Instructions:
- Use these required top-level keys:
  - availability.shipToLocationAvailability.quantity
  - condition: "NEW"
  - product: includes title, description, imageUrls, aspects
  - packageWeightAndSize: includes weight, dimensions, packageType, shippingIrregular

- Aspects:
  - Must match and choose exactly one from the provided aspect names if it has values if not then add form productData
  - Use the provided productData to fill in values
  - No aspect names should be empty
  - All values must be arrays of strings having only one value
  - Do not invent, rename, or omit any keys

- Example keys:
  - "Size Type" ≠ "Type"
  - "Brand", "Color", "Size", etc.

- Valid units:
  - weight.unit: ["POUND", "KILOGRAM", "OUNCE", "GRAM"]
  - dimensions.unit: ["INCH", "FEET", "CENTIMETER", "METER"]
  - packageType: one of ["LETTER", "BULKY_GOODS", ..., "WINE_PAK"]
  - shippingIrregular: boolean

- Return only JSON — no comments, no explanation
`;

    const payloadInput = JSON.stringify(
        {
            ...(productData && { productData }),
            ...(aspects && { aspects }),
        },
        null,
        2
    );

    const prompt = `${instructions}\n\nPayload:\n${payloadInput}`;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw = await response.text();

        const cleaned = cleanRawJson(raw);
        const repaired = jsonrepair(cleaned);
        const decoded = JSON.parse(repaired);

        return NextResponse.json({ decoded }, { status: 200 });
    } catch (err) {
        if (err instanceof Error) {
            console.error("Gemini JSON parsing error:", err.message);
        } else {
            console.error("Gemini JSON parsing error:", err);
        }
        return success({}, "Gemini failed to produce valid JSON", 500);
    }
}
