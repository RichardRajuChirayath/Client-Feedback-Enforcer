import { NextRequest, NextResponse } from "next/server";
import { generateMagicToken, sendMagicLinkEmail } from "@/lib/magic-link";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || "unknown";

        // Check IP-based rate limit first
        const ipKey = getRateLimitKey("ip", ip);
        const ipRateLimit = checkRateLimit(ipKey);

        if (!ipRateLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Too many requests. Please try again later.",
                    retryAfter: ipRateLimit.remainingTime
                },
                { status: 429 }
            );
        }

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

        // Check email-based rate limit
        const emailKey = getRateLimitKey("email", email);
        const emailRateLimit = checkRateLimit(emailKey);

        if (!emailRateLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Too many login attempts for this email. Please try again later.",
                    retryAfter: emailRateLimit.remainingTime
                },
                { status: 429 }
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
