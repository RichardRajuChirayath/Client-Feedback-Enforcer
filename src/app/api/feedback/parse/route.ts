import { NextRequest, NextResponse } from "next/server";

// Types
interface FeedbackItem {
    id: string;
    content: string;
    category: "DESIGN" | "COPY" | "UX" | "TECHNICAL" | "GENERAL";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    requiredAction: string;
    status: "PENDING";
}

// Helper: detect category from text
function detectCategory(text: string): FeedbackItem["category"] {
    const lower = text.toLowerCase();
    if (lower.includes("copy") || lower.includes("tone") || lower.includes("text") || lower.includes("wording") || lower.includes("content"))
        return "COPY";
    if (lower.includes("ux") || lower.includes("flow") || lower.includes("navigation") || lower.includes("usability") || lower.includes("confusing"))
        return "UX";
    if (lower.includes("bug") || lower.includes("error") || lower.includes("technical") || lower.includes("code") || lower.includes("broken"))
        return "TECHNICAL";
    if (lower.includes("design") || lower.includes("visual") || lower.includes("cta") || lower.includes("image") || lower.includes("color") || lower.includes("button") || lower.includes("hero"))
        return "DESIGN";
    return "GENERAL";
}

// Helper: detect priority from text
function detectPriority(text: string): FeedbackItem["priority"] {
    const lower = text.toLowerCase();
    if (lower.includes("urgent") || lower.includes("critical") || lower.includes("asap") || lower.includes("immediately") || lower.includes("broken"))
        return "CRITICAL";
    if (lower.includes("important") || lower.includes("must") || lower.includes("need") || lower.includes("not visible") || lower.includes("can't"))
        return "HIGH";
    if (lower.includes("consider") || lower.includes("maybe") || lower.includes("could") || lower.includes("minor"))
        return "LOW";
    return "MEDIUM";
}

// Helper: generate required action
function generateAction(text: string, category: string): string {
    const actionPrefixes: Record<string, string[]> = {
        DESIGN: ["Update design:", "Modify visual:", "Adjust:"],
        COPY: ["Revise copy:", "Update text:", "Rewrite:"],
        UX: ["Improve flow:", "Enhance usability:", "Fix navigation:"],
        TECHNICAL: ["Fix issue:", "Resolve bug:", "Address error:"],
        GENERAL: ["Address feedback:", "Review and update:", "Consider:"],
    };

    const prefix = actionPrefixes[category]?.[0] || "Address:";
    const shortContent = text.length > 60 ? text.substring(0, 57) + "..." : text;
    return `${prefix} ${shortContent}`;
}

export async function POST(request: NextRequest) {
    try {
        const { feedback } = await request.json();

        if (!feedback || typeof feedback !== "string") {
            return NextResponse.json(
                { error: "Feedback text is required" },
                { status: 400 }
            );
        }

        // Split feedback into individual items
        // Handle various formats: bullet points, numbered lists, newlines
        const lines = feedback
            .split(/[\n\r]+/)
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .map((line: string) => {
                // Remove common list prefixes
                return line
                    .replace(/^[-•*]\s*/, "")
                    .replace(/^\d+[.)]\s*/, "")
                    .replace(/^["']|["']$/g, "")
                    .trim();
            })
            .filter((line: string) => line.length > 5); // Filter out very short lines

        // Structure each feedback item
        const items: FeedbackItem[] = lines.map((content: string, index: number) => {
            const category = detectCategory(content);
            const priority = detectPriority(content);

            return {
                id: `FB-${String(index + 1).padStart(3, "0")}`,
                content,
                category,
                priority,
                requiredAction: generateAction(content, category),
                status: "PENDING" as const,
            };
        });

        return NextResponse.json({
            success: true,
            items,
            count: items.length,
        });
    } catch (error) {
        console.error("Error parsing feedback:", error);
        return NextResponse.json(
            { error: "Failed to parse feedback" },
            { status: 500 }
        );
    }
}
