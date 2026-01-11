import { NextRequest, NextResponse } from "next/server";
import { generateMagicToken, sendMagicLinkEmail } from "@/lib/magic-link";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Generate magic token
        const token = await generateMagicToken(email.toLowerCase());

        // Send magic link email
        const sent = await sendMagicLinkEmail(email.toLowerCase(), token);

        if (!sent) {
            return NextResponse.json(
                { error: "Failed to send magic link email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Magic link sent! Check your email.",
        });
    } catch (error) {
        console.error("Send magic link error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
