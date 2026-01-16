import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "missing_key" });

export async function POST(request: NextRequest) {
    try {
        console.log("🔍 Inspiration Lab API called");

        // 1. Validate Environment
        if (!process.env.GROQ_API_KEY) {
            console.error("❌ GROQ_API_KEY is missing in production environment");
            return NextResponse.json({
                error: "Server Misconfiguration",
                details: "GROQ_API_KEY is missing from Railway/Environment variables."
            }, { status: 500 });
        }

        const session = await getSession();
        if (!session?.user) {
            console.error("❌ No session found");
            return NextResponse.json({ error: "Unauthorized", details: "You must be logged in." }, { status: 401 });
        }

        const { url } = await request.json();
        console.log("📍 URL received:", url);

        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        // 2. Simple Scraping with Smart Fallback
        console.log("🌐 Fetching URL...");
        let html = "";
        let scrapingSuccess = false;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                next: { revalidate: 3600 }
            });

            if (response.ok) {
                html = await response.text();
                scrapingSuccess = true;
                console.log("✅ HTML fetched, length:", html.length);
            } else {
                console.warn(`⚠️ Scraping failed (Status ${response.status}), switching to AI Knowledge Fallback.`);
            }
        } catch (fetchError: any) {
            console.warn("⚠️ Scraping blocked/failed, switching to AI Knowledge Fallback.");
        }

        // Extract or Fallback
        const title = scrapingSuccess ? (html.match(/<title>(.*?)<\/title>/)?.[1] || "Target Site") : url;
        const metaDesc = scrapingSuccess ? (html.match(/<meta name="description" content="(.*?)"/)?.[1] || "") : "Analysis based on public brand knowledge.";

        // 3. AI Deconstruction (Adaptive Prompt)
        const prompt = scrapingSuccess
            ? `
            You are a Senior Design Strategist. I have scraped the HTML of a website.
            Deconstruct its design language based on this metadata:
            
            URL: ${url}
            Site Title: ${title}
            Description: ${metaDesc}
            RAW Snippet: ${html.substring(0, 1500)}
            `
            : `
            You are a Senior Design Strategist. 
            I tried to scrape the website "${url}" but was blocked by security.
            
            HOWEVER, you likely know this brand or can infer the expected style for this type of domain/industry.
            Please generate a highly probable design strategy based on your training data for this specific URL/Brand.
            
            Target URL: ${url}
            `;

        const finalPrompt = `
            ${prompt}

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
            messages: [{ role: "user", content: finalPrompt }],
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
