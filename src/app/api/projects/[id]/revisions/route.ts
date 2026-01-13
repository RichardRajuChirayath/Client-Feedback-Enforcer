import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
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
        const { tasks, questions, summary, rawFeedback } = body;

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: id, userId: session.user.id },
            include: { revisions: { select: { revisionNumber: true }, orderBy: { revisionNumber: 'desc' }, take: 1 } }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const nextRevisionNumber = project.revisions.length > 0
            ? project.revisions[0].revisionNumber + 1
            : 1;

        // Create revision and feedback items in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            const revision = await tx.revision.create({
                data: {
                    projectId: id,
                    revisionNumber: nextRevisionNumber,
                    rawFeedback,
                    revisionSummary: summary,
                    status: 'IN_PROGRESS'
                }
            });

            // Map AI tasks to FeedbackItems
            if (tasks && tasks.length > 0) {
                await tx.feedbackItem.createMany({
                    data: tasks.map((t: string, index: number) => ({
                        revisionId: revision.id,
                        feedbackId: `FB-${String(index + 1).padStart(3, '0')}`,
                        content: t,
                        category: 'GENERAL',
                        priority: 'MEDIUM',
                        status: 'PENDING'
                    }))
                });
            }

            return revision;
        });

        // Update project updatedAt timestamp
        await prisma.project.update({
            where: { id: id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Save revision error:", error);
        return NextResponse.json({ error: "Failed to save revision" }, { status: 500 });
    }
}
