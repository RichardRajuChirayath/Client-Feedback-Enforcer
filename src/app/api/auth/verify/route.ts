import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/magic-link";
import { createSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(new URL("/?error=missing_token", request.url));
        }

        // Verify the magic token
        const email = await verifyMagicToken(token);

        if (!email) {
            return NextResponse.redirect(new URL("/?error=invalid_token", request.url));
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split("@")[0], // Default name from email
                },
            });
        }

        // Create session
        await createSession(user.id);

        // Redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
        console.error("Verify magic link error:", error);
        return NextResponse.redirect(new URL("/?error=verification_failed", request.url));
    }
}
