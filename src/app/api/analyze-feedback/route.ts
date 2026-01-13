import { NextRequest, NextResponse } from "next/server";
import { analyzeFeedback } from "@/lib/ai";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    // Ensure user is authenticated
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const result = await analyzeFeedback(text);

        if (!result) {
            return NextResponse.json({ error: "Failed to analyze feedback" }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Analysis route error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
