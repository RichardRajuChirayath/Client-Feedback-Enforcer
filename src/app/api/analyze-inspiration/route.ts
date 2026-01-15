import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { url } = await request.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        // 1. Simple Scraping (Metadata & Structure)
        // In a real production environment, we'd use a headless browser, but for speed 
        // we'll fetch the HTML and parse key design indicators.
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const html = await response.text();

        // Extract title, description, and some "hints" of the tech stack/design
        const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "Target Site";
        const metaDesc = html.match(/<meta name="description" content="(.*?)"/)?.[1] || "";

        // 2. AI Deconstruction
        const prompt = `
            You are a Senior Design Strategist. I will provide you with the HTML metadata of a website.
            Your job is to deconstruct its design language and provide a strategy for a designer to emulate its "vibe".

            Site Title: ${title}
            Description: ${metaDesc}
            RAW Snippet: ${html.substring(0, 1000)}

            Provide your response in JSON format with:
            1. "vibe": A 3-word summary of the aesthetic.
            2. "designPrinciples": Array of 3 core principles used (e.g., "Glassmorphism", "High-Contrast Typography").
            3. "colorPalette": Suggested HEX codes to match this vibe.
            4. "uxStrategy": How does it handle user attention?
            5. "advice": 2 specific instructions for a designer working on a similar project.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const designStrategy = JSON.parse(completion.choices[0].message.content || "{}");

        return NextResponse.json({
            success: true,
            url,
            title,
            ...designStrategy
        });

    } catch (error) {
        console.error("Scraper Error:", error);
        return NextResponse.json({ error: "Failed to analyze site" }, { status: 500 });
    }
}
