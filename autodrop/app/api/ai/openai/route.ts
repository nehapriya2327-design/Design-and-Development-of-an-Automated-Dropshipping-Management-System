
import openai from '@/lib/server/openai';
import { generateText } from 'ai';
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { text } = await generateText({
            model: openai('gpt-4-turbo'),
            prompt: 'Write a vegetarian lasagna recipe for 4 people.',
        });

        return NextResponse.json({ text })
    } catch (error) {
        console.error("Error in GET request:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}