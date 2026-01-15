import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
    try {
        console.log("🔍 Inspiration Lab API called");

        const session = await getSession();
        if (!session?.user) {
            console.error("❌ No session found");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { url } = await request.json();
        console.log("📍 URL received:", url);

        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        // 1. Simple Scraping (Metadata & Structure)
        console.log("🌐 Fetching URL...");
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        if (!response.ok) {
            console.error("❌ Failed to fetch URL:", response.status);
            return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: 500 });
        }

        const html = await response.text();
        console.log("✅ HTML fetched, length:", html.length);

        // Extract title, description, and some "hints" of the tech stack/design
        const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "Target Site";
        const metaDesc = html.match(/<meta name="description" content="(.*?)"/)?.[1] || "";
        console.log("📄 Title:", title);

        // 2. AI Deconstruction
        const prompt = `
            You are a Senior Design Strategist. I will provide you with the HTML metadata of a website.
            Your job is to deconstruct its design language and provide a strategy for a designer to emulate its "vibe".

            Site Title: ${title}
            Description: ${metaDesc}
            RAW Snippet: ${html.substring(0, 1000)}

            Provide your response in STRICT JSON format with these EXACT keys:
            {
                "vibe": "A 3-word summary of the aesthetic",
                "designPrinciples": ["Principle 1", "Principle 2", "Principle 3"],
                "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
                "uxStrategy": "How does it handle user attention and flow?",
                "advice": ["Specific instruction 1", "Specific instruction 2"]
            }
        `;

        console.log("🤖 Calling Groq AI...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        console.log("✅ AI response received");
        const designStrategy = JSON.parse(completion.choices[0].message.content || "{}");
        console.log("📊 Parsed strategy:", designStrategy);

        const result = {
            success: true,
            url,
            title,
            ...designStrategy
        };

        console.log("✅ Sending response:", result);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error("❌ Scraper Error:", error);
        console.error("Stack:", error.stack);
        return NextResponse.json({
            error: "Failed to analyze site",
            details: error.message
        }, { status: 500 });
    }
}
