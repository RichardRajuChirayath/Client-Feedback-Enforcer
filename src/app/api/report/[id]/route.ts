import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - no session check (secured by ID)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const revision = await prisma.revision.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        name: true,
                        clientName: true
                    }
                },
                feedbackItems: {
                    select: {
                        id: true,
                        category: true,
                        priority: true,
                        status: true,
                        content: true
                    },
                    orderBy: [
                        { status: 'asc' }, // Pending first
                        { priority: 'desc' }
                    ]
                },
                complianceReport: true
            }
        });

        if (!revision) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json(revision);
    } catch (error) {
        console.error("Fetch report error:", error);
        return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
    }
}
