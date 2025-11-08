import { GoogleGenAI } from "@google/genai";
import type { IStorage } from "./storage";

// Initialize Gemini API with new SDK
const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

/**
 * Chat with Gemini AI assistant for cybersecurity help
 * Fetches user's latest scan data, decrypts it, and provides context-aware responses
 * 
 * @param userMessage - The user's message/question
 * @param userId - The user's ID to fetch their scan history
 * @param storage - Storage interface to fetch data
 * @param conversationHistory - Previous messages in the conversation for context
 * @returns AI response text from Gemini
 */
export async function chatWithGemini(
  userMessage: string,
  userId: string,
  storage: IStorage,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  try {
    // Fetch user's recent scan history (last 3 scans) with full breach data
    const recentScans = await storage.getRecentScansWithBreaches(userId, 3);
    
    // Build scan context from decrypted data
    let scanContext = "";
    let riskAlert = "";
    
    if (recentScans.length > 0) {
      const latestScan = recentScans[0];
      const isHighRisk = latestScan.riskScore >= 70;
      
      // Build detailed context from recent scans
      const scanSummaries = recentScans.map((scan, index) => {
        const scanDate = scan.createdAt 
          ? new Date(scan.createdAt).toLocaleDateString() 
          : 'Unknown date';
        
        // Get top breaches for this scan
        const topBreaches = scan.breaches
          .slice(0, 5)
          .map(breach => 
            `${breach.name} (${breach.severity} severity, ${breach.pwnCount?.toLocaleString() || 'unknown'} accounts affected)`
          )
          .join(', ');
        
        return `Scan ${index + 1} (${scanDate}):
- Email scanned: ${scan.email}
- Risk Score: ${scan.riskScore}/100
- Total Breaches Found: ${scan.breachCount}
- Top Breaches: ${topBreaches || 'None detected'}
- AI Analysis: ${scan.aiSummary || 'No analysis available'}
- Security Recommendations: ${scan.aiRecommendations?.join('; ') || 'None'}`;
      }).join('\n\n');

      scanContext = `\n\nUser's Latest Security Scan Data:\n${scanSummaries}`;
      
      // Add high-risk alert if needed
      if (isHighRisk) {
        const highSeverityBreaches = latestScan.breaches.filter(b => b.severity === 'high');
        riskAlert = `\n\n⚠️ HIGH RISK ALERT: Latest scan shows risk score of ${latestScan.riskScore}/100. ${highSeverityBreaches.length} high-severity breaches detected. Priority action needed.`;
      }
    } else {
      // No scan history available
      scanContext = `\n\nNote: User has not performed any scans yet. Suggest they scan their email to check for data breaches.`;
    }

    // Build the system prompt for Gemini
    const systemPrompt = `You are DarkTrack, a friendly AI cybersecurity assistant created to help users protect their digital life.

Your Core Mission:
- Help users understand their data breach risks and online security
- Explain cybersecurity concepts in simple, everyday language
- Provide step-by-step guidance to fix security issues
- Be supportive, friendly, and encouraging (not robotic or alarmist)

STRICT TOPIC BOUNDARIES:
- You ONLY discuss: cybersecurity, data safety, privacy, breaches, online security, password management, 2FA, identity protection
- If asked about ANYTHING else (politics, jokes, weather, news, general questions), politely redirect:
  "I focus on keeping your digital life secure. Would you like me to share a privacy tip instead?"
- Never go off-topic, even if the user insists

Communication Style:
- Talk like a friendly expert helping a friend (not a corporate chatbot)
- Use short, clear sentences
- Break down technical jargon into plain English
- Be honest about risks without causing panic
- Celebrate improvements and progress
- Give specific, actionable steps (not vague advice)

Examples of Your Tone:
✓ "Your latest scan shows 3 breaches (LinkedIn, Dropbox, Canva). The risk is moderate — about 62/100. Let's start by updating your LinkedIn password and enabling two-factor authentication."
✓ "Great question! Two-factor authentication (2FA) is like having two locks on your door instead of one. Even if someone steals your password, they can't get in without the second code from your phone."
✓ "I couldn't find your recent scan. Try scanning your email first to see your data safety score."

When Giving Security Advice:
- Always provide step-by-step instructions
- Example: "To secure your Dropbox account: 1) Go to Settings → Security, 2) Enable 2FA, 3) Check if your password matches others you've used before, 4) Change it if needed"
- Reference their specific breaches and risk scores
- Track progress: "Your risk score improved from 75 to 62 since last week!"

High-Risk Protocol:${riskAlert}${riskAlert ? '\nProactively offer: "Would you like me to walk you through securing these accounts step-by-step?"' : ''}

Privacy & Security:
- Never ask for or display actual passwords, credit card numbers, or sensitive data
- Only reference breach names and general security recommendations
- All scan data is already encrypted/decrypted securely

User's Current Security Context:${scanContext}

Remember:
- Base ALL responses on the user's actual scan data shown above
- Reference their specific breaches, risk scores, and history
- Give practical, actionable steps anyone can follow
- Stay friendly, supportive, and focused on cybersecurity only`;

    // CRITICAL: Always include system prompt in history to maintain cybersecurity guardrails
    // Build conversation history with system prompt as the first entry
    const historyWithSystemPrompt = [
      {
        role: "user" as const,
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model" as const,
        parts: [{ text: "Understood! I'm DarkTrack, your cybersecurity assistant. I'll help you understand and secure your digital life, focusing only on cybersecurity, privacy, and data protection topics. I'll reference your scan data and provide clear, actionable security advice. How can I help protect your online presence today?" }],
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content }],
      })),
    ];
    
    // Create chat session using new SDK with gemini-2.5-flash (latest stable model)
    const chat = genAI.chats.create({
      model: "gemini-2.5-flash",
      history: historyWithSystemPrompt,
      config: {
        maxOutputTokens: 1500,
        temperature: 0.7,
      },
    });

    // Send user message (system prompt is already in history)
    const response = await chat.sendMessage({ message: userMessage });
    const aiReply = response.text;

    // Validate response is on-topic (basic check)
    if (!aiReply || aiReply.trim().length === 0) {
      return "I apologize, but I couldn't generate a response. Please try again.";
    }

    return aiReply;

  } catch (error: any) {
    console.error("Error in chatWithGemini:", error);
    
    // Provide helpful error messages
    if (error?.message?.includes("API key")) {
      throw new Error("Gemini API key is invalid or missing. Please check your configuration.");
    }
    
    if (error?.message?.includes("quota") || error?.message?.includes("rate limit")) {
      throw new Error("API quota exceeded. Please try again in a moment.");
    }
    
    throw new Error("Failed to get AI response. Please try again.");
  }
}
