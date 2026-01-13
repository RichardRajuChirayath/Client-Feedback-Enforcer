import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: id,
                userId: session.user.id
            },
            include: {
                revisions: {
                    orderBy: {
                        revisionNumber: 'desc'
                    },
                    include: {
                        feedbackItems: true,
                        complianceReport: true
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Calculate Stats
        let totalFeedback = 0;
        let addressed = 0;
        let totalResolutionTimeMs = 0;
        let resolvedCount = 0;

        project.revisions.forEach((rev: any) => {
            rev.feedbackItems.forEach((item: any) => {
                totalFeedback++;
                if (item.status === 'ADDRESSED') {
                    addressed++;
                    if (item.completedAt) {
                        const duration = new Date(item.completedAt).getTime() - new Date(item.createdAt).getTime();
                        if (duration > 0) {
                            totalResolutionTimeMs += duration;
                            resolvedCount++;
                        }
                    }
                }
            });
        });

        const pending = totalFeedback - addressed;

        let avgResolutionTime = null;
        if (resolvedCount > 0) {
            const avgMs = totalResolutionTimeMs / resolvedCount;
            const hours = avgMs / (1000 * 60 * 60);
            if (hours < 1) {
                avgResolutionTime = `${Math.round(hours * 60)} mins`;
            } else if (hours < 24) {
                avgResolutionTime = `${hours.toFixed(1)} hrs`;
            } else {
                avgResolutionTime = `${(hours / 24).toFixed(1)} days`;
            }
        }

        return NextResponse.json({
            ...project,
            stats: {
                totalFeedback,
                addressed,
                pending,
                avgResolutionTime
            }
        });
    } catch (error) {
        console.error("Fetch project detail error:", error);
        return NextResponse.json({ error: "Failed to fetch project details" }, { status: 500 });
    }
}

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
        const { name, clientName, description } = body;

        const updatedProject = await prisma.project.update({
            where: {
                id: id,
                userId: session.user.id
            },
            data: {
                name,
                clientName,
                description
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("Update project error:", error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.project.delete({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete project error:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
