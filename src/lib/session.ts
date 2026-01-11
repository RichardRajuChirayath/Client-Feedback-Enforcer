import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { randomBytes, createHash } from "crypto";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string) {
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_MAX_AGE);

    await prisma.session.create({
        data: {
            sessionToken,
            userId,
            expires,
        },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires,
        path: "/",
    });

    return sessionToken;
}

export async function getSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return null;
    }

    const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
    });

    if (!session || session.expires < new Date()) {
        // Session expired or doesn't exist
        if (session) {
            await prisma.session.delete({ where: { id: session.id } });
        }
        return null;
    }

    return session;
}

export async function deleteSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
        await prisma.session.deleteMany({ where: { sessionToken } });
        cookieStore.delete(SESSION_COOKIE_NAME);
    }
}

export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
