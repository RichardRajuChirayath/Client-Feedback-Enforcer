import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

enum FeedbackStatus {
    PENDING = "PENDING",
    ADDRESSED = "ADDRESSED",
    MISSED = "MISSED",
    NEEDS_CLARIFICATION = "NEEDS_CLARIFICATION",
    PARTIALLY_ADDRESSED = "PARTIALLY_ADDRESSED"
}

// Next.js 15/16 requires params to be a Promise
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (!Object.values(FeedbackStatus).includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Verify ownership through the chain: FeedbackItem -> Revision -> Project -> User
        const feedbackItem = await prisma.feedbackItem.findUnique({
            where: { id: id },
            include: {
                revision: {
                    include: {
                        project: true
                    }
                }
            }
        });

        if (!feedbackItem || feedbackItem.revision.project.userId !== session.user.id) {
            return NextResponse.json({ error: "Feedback item not found or unauthorized" }, { status: 404 });
        }

        const updatedItem = await prisma.feedbackItem.update({
            where: { id: id },
            data: {
                status,
                completedAt: status === "ADDRESSED" ? new Date() : null
            }
        });

        // Simply return the updated item. The frontend can recalculate compliance locally or refresh.
        return NextResponse.json(updatedItem);

    } catch (error) {
        console.error("Update feedback error:", error);
        return NextResponse.json({ error: "Failed to update feedback item" }, { status: 500 });
    }
}
