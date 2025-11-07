import axios from "axios";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface HaveIBeenPwnedBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
  LogoPath?: string;
}

export interface BreachData {
  name: string;
  domain?: string;
  breachDate?: string;
  addedDate?: string;
  modifiedDate?: string;
  pwnCount?: number;
  description?: string;
  dataClasses?: string[];
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
  isMalware: boolean;
  severity: "low" | "medium" | "high";
}

export async function checkHaveIBeenPwned(email: string): Promise<BreachData[]> {
  try {
    if (!process.env.HAVEIBEENPWNED_API_KEY) {
      console.error("HAVEIBEENPWNED_API_KEY is not set");
      throw new Error("HaveIBeenPwned API key is not configured");
    }

    const response = await axios.get(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          "User-Agent": "DarkTrack-OSINT-Dashboard",
          "hibp-api-key": process.env.HAVEIBEENPWNED_API_KEY,
        },
        validateStatus: (status) => status === 200 || status === 404,
      }
    );

    if (response.status === 404) {
      return [];
    }

    const breaches: HaveIBeenPwnedBreach[] = response.data;

    return breaches.map((breach) => {
      const severity = calculateSeverity(breach);
      
      return {
        name: breach.Title || breach.Name,
        domain: breach.Domain,
        breachDate: breach.BreachDate,
        addedDate: breach.AddedDate,
        modifiedDate: breach.ModifiedDate,
        pwnCount: breach.PwnCount,
        description: breach.Description,
        dataClasses: breach.DataClasses,
        isVerified: breach.IsVerified,
        isFabricated: breach.IsFabricated,
        isSensitive: breach.IsSensitive,
        isRetired: breach.IsRetired,
        isSpamList: breach.IsSpamList,
        isMalware: breach.IsMalware,
        severity,
      };
    });
  } catch (error) {
    console.error("Error checking HaveIBeenPwned:", error);
    return [];
  }
}

function calculateSeverity(breach: HaveIBeenPwnedBreach): "low" | "medium" | "high" {
  const sensitiveDataClasses = [
    "Passwords",
    "Credit cards",
    "Social security numbers",
    "Banking information",
    "Financial information",
  ];

  const hasSensitiveData = breach.DataClasses?.some(
    (dataClass) => sensitiveDataClasses.some(
      (sensitive) => dataClass.toLowerCase().includes(sensitive.toLowerCase())
    )
  );

  if (hasSensitiveData || breach.IsSensitive) {
    return "high";
  }

  if (breach.PwnCount > 1000000 || !breach.IsVerified) {
    return "medium";
  }

  return "low";
}

export function calculateRiskScore(breaches: BreachData[]): number {
  if (breaches.length === 0) return 0;

  const baseScore = Math.min(breaches.length * 10, 40);
  
  const severityScore = breaches.reduce((score, breach) => {
    if (breach.severity === "high") return score + 20;
    if (breach.severity === "medium") return score + 10;
    return score + 5;
  }, 0);

  const sensitiveDataScore = breaches.reduce((score, breach) => {
    if (breach.isSensitive) return score + 10;
    return score;
  }, 0);

  const totalScore = Math.min(baseScore + severityScore + sensitiveDataScore, 100);
  
  return Math.round(totalScore);
}

export async function generateAIAnalysis(
  email: string,
  breaches: BreachData[],
  riskScore: number
): Promise<{ summary: string; recommendations: string[] }> {
  try {
    const prompt = `You are a cybersecurity expert analyzing a user's digital footprint. 

Email: ${email}
Number of breaches: ${breaches.length}
Risk Score: ${riskScore}/100

Breaches found:
${breaches.map(b => `- ${b.name} (${b.severity} severity, ${b.pwnCount?.toLocaleString()} affected accounts)`).join('\n')}

Provide:
1. A concise summary (2-3 sentences) of the security risk level and main concerns
2. 3-5 specific, actionable recommendations to improve security

Respond in JSON format:
{
  "summary": "Brief summary of findings",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity expert providing clear, actionable security advice. Be concise and specific.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      summary: result.summary || "Analysis completed successfully.",
      recommendations: result.recommendations || [
        "Enable two-factor authentication on all accounts",
        "Change passwords for affected accounts",
        "Monitor accounts for suspicious activity",
      ],
    };
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return {
      summary: "Your email has been found in data breaches. Immediate action is recommended to secure your accounts.",
      recommendations: [
        "Change passwords for all affected accounts immediately",
        "Enable two-factor authentication (2FA) wherever possible",
        "Monitor your accounts for suspicious activity",
        "Use a password manager to create unique, strong passwords",
        "Consider using identity monitoring services",
      ],
    };
  }
}
