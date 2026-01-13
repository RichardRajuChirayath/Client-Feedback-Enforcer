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
        let users = await prisma.$queryRaw<any[]>`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`;
        let user: any = users[0];

        if (!user) {
            const id = crypto.randomUUID();
            const name = email.split("@")[0];

            // Create new user (default to AGENCY role implicitly by DB default if column exists, or just ignore role)
            // We use raw SQL to avoid type issues with the stale client
            await prisma.$executeRaw`
                INSERT INTO "User" (id, email, name, "createdAt", "updatedAt")
                VALUES (${id}, ${email}, ${name}, NOW(), NOW())
            `;

            // Re-fetch
            users = await prisma.$queryRaw<any[]>`SELECT * FROM "User" WHERE id = ${id}`;
            user = users[0];
        }

        // Create session
        await createSession(user.id);

        // Redirect to dashboard (Standard logic)
        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
        console.error("Verify magic link error:", error);
        return NextResponse.redirect(new URL("/?error=verification_failed", request.url));
    }
}
