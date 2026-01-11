import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { user: null },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                image: session.user.image,
            },
        });
    } catch (error) {
        console.error("Get session error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
