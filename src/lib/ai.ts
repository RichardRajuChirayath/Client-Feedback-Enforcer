
interface AIAnalysisResult {
    tasks: string[];
    questions: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
    tone: string;
    summary: string;
    patterns: string[];
    confidenceScore: number;
    conflicts?: {
        roundNumber: number;
        originalRequest: string;
        currentRequest: string;
        explanation: string;
    }[];
}

export async function analyzeFeedback(rawText: string, history?: string): Promise<AIAnalysisResult | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("Missing GROQ_API_KEY");
        return null;
    }

    const prompt = `
    You are an expert Project Manager AI. Your job is to parse raw, messy client feedback into structured data.
    
    Current Feedback to analyze:
    "${rawText}"

    ${history ? `
    PROJECT HISTORY (Last 3 Rounds):
    "${history}"
    
    IMPORTANT: Carefully compare the Current Feedback against the Project History. 
    If you detect that the client is asking for something they previously rejected, or if they are reverting a change they specifically asked for in a previous round, identify this as a "conflict".
    ` : ''}

    Please analyze this and return a JSON object with the following structure:
    {
      "tasks": ["Array of clear, actionable tasks derived from the feedback. Be specific."],
      "questions": ["Array of questions the client is asking that need a reply."],
      "sentiment": "One of: positive, neutral, negative, urgent",
      "tone": "A short adjective describing the tone (e.g., Constructive, Frustrated, Confused)",
      "summary": "A 1-sentence summary of the main point.",
      "patterns": ["Identify any recurring themes (e.g., 'Client frequently mentions font size')."],
      "confidenceScore": 0,
      "conflicts": [ // ONLY if history is provided and a circular loop is detected
        {
          "roundNumber": 0,
          "originalRequest": "What they said before",
          "currentRequest": "What they are saying now",
          "explanation": "Why this is a circular loop or conflict"
        }
      ]
    }

    Return ONLY the JSON.
  `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant that parses client feedback into JSON. Be extremely vigilant about circular loops and contradicting feedback." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
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
