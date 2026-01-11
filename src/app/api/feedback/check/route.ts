import { NextRequest, NextResponse } from "next/server";

// Types
interface FeedbackItem {
    id: string;
    content: string;
    category: string;
    priority: string;
    requiredAction: string;
    status: string;
}

interface ClarificationItem {
    item: FeedbackItem;
    question: string;
}

interface ComplianceResult {
    addressed: FeedbackItem[];
    missed: FeedbackItem[];
    needsClarification: ClarificationItem[];
    score: number;
}

// Helper: extract keywords from text
function extractKeywords(text: string): string[] {
    const stopWords = new Set([
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "shall", "can", "need", "dare",
        "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by",
        "from", "as", "into", "through", "during", "before", "after", "above",
        "below", "between", "under", "again", "further", "then", "once", "here",
        "there", "when", "where", "why", "how", "all", "each", "few", "more",
        "most", "other", "some", "such", "no", "nor", "not", "only", "own",
        "same", "so", "than", "too", "very", "just", "and", "but", "if", "or",
        "because", "until", "while", "it", "its", "this", "that", "these", "those",
        "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she",
        "her", "they", "them", "their", "what", "which", "who", "whom", "feel",
        "feels", "like", "looks", "seems", "think", "enough", "still", "also",
    ]);

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));
}

// Helper: calculate match score between feedback and revision
function calculateMatchScore(feedbackKeywords: string[], revisionKeywords: Set<string>): number {
    if (feedbackKeywords.length === 0) return 0;

    let matches = 0;
    for (const keyword of feedbackKeywords) {
        if (revisionKeywords.has(keyword)) {
            matches++;
        }
        // Also check for partial matches (e.g., "cta" matches "contrast")
        for (const revWord of revisionKeywords) {
            if (revWord.includes(keyword) || keyword.includes(revWord)) {
                matches += 0.5;
                break;
            }
        }
    }

    return matches / feedbackKeywords.length;
}

// Helper: generate clarifying question
function generateClarifyingQuestion(feedback: string): string {
    const lower = feedback.toLowerCase();

    if (lower.includes("more") || lower.includes("less") || lower.includes("too")) {
        return `What specific level of change would satisfy: "${feedback.substring(0, 50)}..."?`;
    }
    if (lower.includes("feel") || lower.includes("seems") || lower.includes("looks")) {
        return `Could you provide specific examples of what you're looking for regarding: "${feedback.substring(0, 50)}..."?`;
    }
    if (lower.includes("change") || lower.includes("update") || lower.includes("modify")) {
        return `What specific changes would you like to see for: "${feedback.substring(0, 50)}..."?`;
    }
    if (feedback.length < 30) {
        return `Could you elaborate on: "${feedback}"?`;
    }

    return `Need more details on: "${feedback.substring(0, 50)}..."`;
}

export async function POST(request: NextRequest) {
    try {
        const { feedback, revision } = await request.json();

        if (!feedback || !Array.isArray(feedback)) {
            return NextResponse.json(
                { error: "Feedback array is required" },
                { status: 400 }
            );
        }

        if (!revision || typeof revision !== "string") {
            return NextResponse.json(
                { error: "Revision summary is required" },
                { status: 400 }
            );
        }

        // Extract keywords from revision
        const revisionKeywords = new Set(extractKeywords(revision));

        // Analyze each feedback item
        const addressed: FeedbackItem[] = [];
        const missed: FeedbackItem[] = [];
        const needsClarification: ClarificationItem[] = [];

        for (const item of feedback) {
            const feedbackKeywords = extractKeywords(item.content);
            const matchScore = calculateMatchScore(feedbackKeywords, revisionKeywords);

            // Threshold-based classification
            if (matchScore >= 0.4) {
                // Good match - addressed
                addressed.push({ ...item, status: "ADDRESSED" });
            } else if (matchScore >= 0.15 || item.content.length < 25) {
                // Partial match or vague feedback - needs clarification
                needsClarification.push({
                    item: { ...item, status: "NEEDS_CLARIFICATION" },
                    question: generateClarifyingQuestion(item.content),
                });
            } else {
                // No match - missed
                missed.push({ ...item, status: "MISSED" });
            }
        }

        // Calculate compliance score
        const total = feedback.length;
        const addressedWeight = addressed.length * 1;
        const clarificationWeight = needsClarification.length * 0.5;
        const score = total > 0
            ? Math.round(((addressedWeight + clarificationWeight) / total) * 100)
            : 0;

        const result: ComplianceResult = {
            addressed,
            missed,
            needsClarification,
            score: Math.min(score, 100),
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error checking compliance:", error);
        return NextResponse.json(
            { error: "Failed to check compliance" },
            { status: 500 }
        );
    }
}
