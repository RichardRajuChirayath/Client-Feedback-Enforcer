
interface AIAnalysisResult {
    tasks: string[];
    questions: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
    tone: string;
    summary: string;
    patterns: string[];
    confidenceScore: number;
}

export async function analyzeFeedback(rawText: string): Promise<AIAnalysisResult | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("Missing GROQ_API_KEY");
        return null;
    }

    const prompt = `
    You are an expert Project Manager AI. Your job is to parse raw, messy client feedback into structured data.
    
    Here is the raw feedback:
    "${rawText}"

    Please analyze this and return a JSON object with the following structure:
    {
      "tasks": ["Array of clear, actionable tasks derived from the feedback. Be specific."],
      "questions": ["Array of questions the client is asking that need a reply."],
      "sentiment": "One of: positive, neutral, negative, urgent",
      "tone": "A short adjective describing the tone (e.g., Constructive, Frustrated, Confused)",
      "summary": "A 1-sentence summary of the main point.",
      "patterns": ["Identify any recurring themes or potential long-term issues (e.g., 'Client frequently mentions font size', 'Consistent confusion about navigation'). If none, return empty array."],
      "confidenceScore": 0 // 0-100 integer representing how clear and actionable the feedback is. Low score means the feedback is vague or contradictory.
    }

    Return ONLY the JSON. Do not include markdown formatting like \`\`\`json.
  `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Current production model
                messages: [
                    { role: "system", content: "You are a helpful AI assistant that parses client feedback into JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1, // Low temperature for consistent formatting
            }),
        });

        if (!response.ok) {
            console.error("Groq API error:", await response.text());
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) return null;

        // Clean up potential markdown code blocks if the model ignores instruction
        const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanContent) as AIAnalysisResult;
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return null;
    }
}
