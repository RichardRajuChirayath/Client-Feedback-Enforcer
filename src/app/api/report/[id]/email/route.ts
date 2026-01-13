import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
        const { clientEmail } = body;

        if (!clientEmail) {
            return NextResponse.json({ error: "Client email is required" }, { status: 400 });
        }

        // Fetch revision details to allow referencing in the email
        const revision = await prisma.revision.findUnique({
            where: { id: id },
            include: { project: true }
        });

        if (!revision) {
            return NextResponse.json({ error: "Revision not found" }, { status: 404 });
        }

        const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${id}`;

        // Send email via Brevo
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY!,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL },
                to: [{ email: clientEmail }],
                subject: `Feedback Update: ${revision.project.name} (Round #${revision.revisionNumber})`,
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
                        <h2 style="color: #6366f1;">Feedback Enforcer Report</h2>
                        <p>Hi,</p>
                        <p>We've addressed your feedback for <strong>${revision.project.name}</strong>.</p>
                        <p>Please check the compliance report below to verify all items have been resolved.</p>
                        <div style="margin: 30px 0;">
                            <a href="${reportUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Compliance Report</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Or copy this link: <br/>${reportUrl}</p>
                    </div>
                `,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Brevo API Error:", errorText);
            throw new Error("Failed to send email");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email sending error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
