// import { groq } from '@ai-sdk/groq';
import groq from '@/lib/groq';
import prisma from '@/lib/prisma';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const sampleAspects = {
    "Storage Capacity": ["64 GB"],
    "Model": ["TestModel X"],
    "Color": ["Black"],
    "Brand": ["TestBrand"]
}

const samplePackageWeightAndSize = {
    "dimensions": {
        "height": 5,
        "length": 10,
        "width": 10,
        "unit": "CENTIMETER"
    },
    "weight": {
        "value": 0.5,
        "unit": "KILOGRAM"
    },
    "packageType": "PACKAGE_THICK_ENVELOPE",
    "shippingIrregular": false
}

// function cleanRawJson(text: string): string {
//     return text
//         // Remove Markdown code block tags
//         .replace(/^```(?:json)?\n?/i, "")
//         .replace(/```$/, "")
//         // Remove control characters
//         .replace(/[\u0000-\u001F]+/g, " ")
//         // Add quotes around unquoted keys (best-effort)
//         .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
//         // Remove trailing commas before object/array ends
//         .replace(/,(\s*[}\]])/g, '$1')
//         // Attempt to close open strings (very basic fix)
//         .replace(/:\s*"([^"]*)$/, (match, p1) => `: "${p1}"`);
// }

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const shopifyId = searchParams.get("shopifyId");

        if (!shopifyId) {
            return NextResponse.json({ error: 'shopifyId is required' }, { status: 400 });
        }

        // Fetch product and aspects (mimicking the provided response structure)
        const product = await prisma.product.findUnique({
            where: { shopifyId },
            include: {
                category: true,
                variants: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product) {
            return NextResponse.json({ error: 'Product already listed on eBay' }, { status: 400 });
        }

        // Construct prompt
        const prompt = `Can you generate a JSON object for an eBay listing based on the following product details?. create a aspects object based aspects available in the product Data. Take value from product details and if selection_only aspect then take the reliable value from the possible values.also add a packageWeightAndSize object with the following details: ${JSON.stringify(samplePackageWeightAndSize)}. The product details are as follows: ${JSON.stringify(product)}. The aspects are as follows: ${JSON.stringify(sampleAspects)}. Please ensure the JSON is valid and well-structured.`;
        const { text } = await generateText({
            model: groq('gemma2-9b-it'),
            prompt,
        });

        // const cleaned = cleanRawJson(text);
        // const repaired = jsonrepair(cleaned);
        // const decoded = JSON.parse(repaired);
        return NextResponse.json({ decoded: text })
    } catch (error) {
        console.error("Error in GET /api/chat:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }


    // return NextResponse.json({ text })
}
