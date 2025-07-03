import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIInsight {
  type: "reminder" | "achievement" | "suggestion" | "warning";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
}

export async function generateAIInsights(medicationData: {
  adherenceRate: number;
  missedToday: number;
  activeMedications: number;
  recentLogs: any[];
}): Promise<AIInsight[]> {
  try {
    const prompt = `
    You are a healthcare AI assistant for busy small business owners. Analyze the medication data and provide 2-3 personalized insights.
    
    Data:
    - Weekly adherence rate: ${medicationData.adherenceRate}%
    - Missed doses today: ${medicationData.missedToday}
    - Active medications: ${medicationData.activeMedications}
    - Recent patterns: ${JSON.stringify(medicationData.recentLogs)}
    
    Generate insights that are:
    1. Professional and supportive
    2. Actionable for busy business owners
    3. Focused on health outcomes
    4. Encouraging when appropriate
    
    Respond with JSON in this format:
    {
      "insights": [
        {
          "type": "reminder|achievement|suggestion|warning",
          "title": "Brief title",
          "message": "Actionable message under 100 characters",
          "priority": "low|medium|high"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.insights || [];
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    return [
      {
        type: "suggestion",
        title: "Stay Consistent",
        message: "Regular medication timing helps maintain steady health benefits.",
        priority: "medium"
      }
    ];
  }
}

export async function generateSmartReminder(medicationName: string, time: string, context: string): Promise<string> {
  try {
    const prompt = `
    Generate a friendly, professional medication reminder for a busy small business owner.
    
    Medication: ${medicationName}
    Scheduled time: ${time}
    Context: ${context}
    
    Make it personal, encouraging, and under 50 words. Focus on health benefits and business productivity.
    
    Respond with JSON: {"reminder": "your message here"}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.reminder || `Time for your ${medicationName}! Stay healthy, stay productive.`;
  } catch (error) {
    console.error("Failed to generate smart reminder:", error);
    return `Time for your ${medicationName}! Your health supports your business success.`;
  }
}
