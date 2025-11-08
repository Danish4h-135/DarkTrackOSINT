import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { checkHaveIBeenPwned, calculateRiskScore, generateAIAnalysis } from "./osint";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Scan endpoint - runs OSINT analysis
  app.post('/api/scan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check HaveIBeenPwned for breaches
      const breachData = await checkHaveIBeenPwned(email);
      
      // Calculate metrics
      const breachCount = breachData.length;
      const profilesDetected = breachCount > 0 ? 1 : 0; // Simplified for MVP
      const riskScore = calculateRiskScore(breachData);
      const securedDataPercentage = 100 - riskScore;

      // Generate AI analysis
      const { summary, recommendations } = await generateAIAnalysis(
        email,
        breachData,
        riskScore
      );

      // Create scan record
      const scan = await storage.createScan({
        userId,
        email,
        breachCount,
        profilesDetected,
        riskScore,
        securedDataPercentage,
        aiSummary: summary,
        aiRecommendations: recommendations,
      });

      // Create breach records
      if (breachData.length > 0) {
        const breachRecords = breachData.map(breach => ({
          scanId: scan.id,
          name: breach.name,
          domain: breach.domain,
          breachDate: breach.breachDate,
          addedDate: breach.addedDate,
          modifiedDate: breach.modifiedDate,
          pwnCount: breach.pwnCount,
          description: breach.description,
          dataClasses: breach.dataClasses,
          isVerified: breach.isVerified ? 1 : 0,
          isFabricated: breach.isFabricated ? 1 : 0,
          isSensitive: breach.isSensitive ? 1 : 0,
          isRetired: breach.isRetired ? 1 : 0,
          isSpamList: breach.isSpamList ? 1 : 0,
          isMalware: breach.isMalware ? 1 : 0,
          severity: breach.severity,
        }));

        await storage.createBreaches(breachRecords);
      }

      res.json(scan);
    } catch (error: any) {
      console.error("Error running scan:", error);
      res.status(500).json({ message: error.message || "Failed to run scan" });
    }
  });

  // Get latest scan for current user
  app.get('/api/scans/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scan = await storage.getLatestScanByUserId(userId);
      
      if (!scan) {
        return res.status(404).json({ message: "No scans found" });
      }

      res.json(scan);
    } catch (error) {
      console.error("Error fetching latest scan:", error);
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });

  // Get all scans for current user
  app.get('/api/scans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scans = await storage.getScansByUserId(userId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  // Get breaches for a specific scan
  app.get('/api/breaches/:scanId', isAuthenticated, async (req: any, res) => {
    try {
      const { scanId } = req.params;
      const userId = req.user.claims.sub;

      // Verify the scan belongs to the user
      const scan = await storage.getScanById(scanId);
      if (!scan || scan.userId !== userId) {
        return res.status(404).json({ message: "Scan not found" });
      }

      const breaches = await storage.getBreachesByScanId(scanId);
      res.json(breaches);
    } catch (error) {
      console.error("Error fetching breaches:", error);
      res.status(500).json({ message: "Failed to fetch breaches" });
    }
  });

  // Get breaches for latest scan (convenience endpoint)
  app.get('/api/breaches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const scan = await storage.getLatestScanByUserId(userId);
      
      if (!scan) {
        return res.json([]);
      }

      const breaches = await storage.getBreachesByScanId(scan.id);
      res.json(breaches);
    } catch (error) {
      console.error("Error fetching breaches:", error);
      res.status(500).json({ message: "Failed to fetch breaches" });
    }
  });

  // Manual lookup endpoint - one per 24 hours
  app.post('/api/lookup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check quota - one lookup per 24 hours
      const user = await storage.getUser(userId);
      if (user?.lastManualLookupAt) {
        const hoursSinceLastLookup = (Date.now() - user.lastManualLookupAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastLookup < 24) {
          const nextAvailableAt = new Date(user.lastManualLookupAt.getTime() + 24 * 60 * 60 * 1000);
          return res.status(429).json({
            error: true,
            message: `You can perform one manual lookup every 24 hours. Next one available at: ${nextAvailableAt.toISOString()}`,
            nextAvailableAt: nextAvailableAt.toISOString(),
          });
        }
      }

      // Run OSINT analysis (but don't save)
      const breachData = await checkHaveIBeenPwned(email);
      const breachCount = breachData.length;
      const riskScore = calculateRiskScore(breachData);
      const { summary, recommendations } = await generateAIAnalysis(email, breachData, riskScore);

      // Update user's last lookup timestamp
      await storage.updateUserManualLookupTimestamp(userId);

      // Return results without saving
      res.json({
        email,
        breachCount,
        riskScore,
        securedDataPercentage: 100 - riskScore,
        aiSummary: summary,
        aiRecommendations: recommendations,
        breaches: breachData,
      });
    } catch (error: any) {
      console.error("Error running manual lookup:", error);
      res.status(500).json({ message: error.message || "Failed to run lookup" });
    }
  });

  // Save manual lookup results
  app.post('/api/lookup/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { email, breachCount, riskScore, securedDataPercentage, aiSummary, aiRecommendations, breaches } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Create scan record
      const scan = await storage.createScan({
        userId,
        email,
        breachCount: breachCount || 0,
        profilesDetected: breachCount > 0 ? 1 : 0,
        riskScore: riskScore || 0,
        securedDataPercentage: securedDataPercentage || 100,
        aiSummary: aiSummary || null,
        aiRecommendations: aiRecommendations || [],
      });

      // Create breach records if any
      if (breaches && breaches.length > 0) {
        const breachRecords = breaches.map((breach: any) => ({
          scanId: scan.id,
          name: breach.name,
          domain: breach.domain,
          breachDate: breach.breachDate,
          addedDate: breach.addedDate,
          modifiedDate: breach.modifiedDate,
          pwnCount: breach.pwnCount,
          description: breach.description,
          dataClasses: breach.dataClasses,
          isVerified: breach.isVerified ? 1 : 0,
          isFabricated: breach.isFabricated ? 1 : 0,
          isSensitive: breach.isSensitive ? 1 : 0,
          isRetired: breach.isRetired ? 1 : 0,
          isSpamList: breach.isSpamList ? 1 : 0,
          isMalware: breach.isMalware ? 1 : 0,
          severity: breach.severity,
        }));

        await storage.createBreaches(breachRecords);
      }

      res.json(scan);
    } catch (error: any) {
      console.error("Error saving lookup results:", error);
      res.status(500).json({ message: error.message || "Failed to save results" });
    }
  });

  // Scan user's own data endpoint
  app.post('/api/scan/self', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.email) {
        return res.status(400).json({ message: "User email not found. Please update your profile." });
      }

      // Run OSINT analysis on user's own email
      const breachData = await checkHaveIBeenPwned(user.email);
      const breachCount = breachData.length;
      const profilesDetected = breachCount > 0 ? 1 : 0;
      const riskScore = calculateRiskScore(breachData);
      const securedDataPercentage = 100 - riskScore;

      // Generate AI analysis
      const { summary, recommendations } = await generateAIAnalysis(
        user.email,
        breachData,
        riskScore
      );

      // Create scan record
      const scan = await storage.createScan({
        userId,
        email: user.email,
        breachCount,
        profilesDetected,
        riskScore,
        securedDataPercentage,
        aiSummary: summary,
        aiRecommendations: recommendations,
      });

      // Create breach records
      if (breachData.length > 0) {
        const breachRecords = breachData.map(breach => ({
          scanId: scan.id,
          name: breach.name,
          domain: breach.domain,
          breachDate: breach.breachDate,
          addedDate: breach.addedDate,
          modifiedDate: breach.modifiedDate,
          pwnCount: breach.pwnCount,
          description: breach.description,
          dataClasses: breach.dataClasses,
          isVerified: breach.isVerified ? 1 : 0,
          isFabricated: breach.isFabricated ? 1 : 0,
          isSensitive: breach.isSensitive ? 1 : 0,
          isRetired: breach.isRetired ? 1 : 0,
          isSpamList: breach.isSpamList ? 1 : 0,
          isMalware: breach.isMalware ? 1 : 0,
          severity: breach.severity,
        }));

        await storage.createBreaches(breachRecords);
      }

      res.json(scan);
    } catch (error: any) {
      console.error("Error running self scan:", error);
      res.status(500).json({ message: error.message || "Failed to run scan" });
    }
  });

  // Dashboard endpoint - returns scan history and quota status
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Get recent scans (most recent 10)
      const scans = await storage.getScansByUserId(userId);
      const recentScans = scans.slice(0, 10);

      // Get breaches for each scan
      const scansWithBreaches = await Promise.all(
        recentScans.map(async (scan) => {
          const breaches = await storage.getBreachesByScanId(scan.id);
          return { ...scan, breaches };
        })
      );

      // Calculate overall metrics
      const avgRiskScore = scans.length > 0
        ? Math.round(scans.reduce((sum, scan) => sum + scan.riskScore, 0) / scans.length)
        : 0;
      
      const severityCounts = scansWithBreaches.reduce(
        (acc, scan) => {
          scan.breaches.forEach((breach) => {
            const severity = breach.severity as "high" | "medium" | "low";
            acc[severity] = (acc[severity] || 0) + 1;
          });
          return acc;
        },
        { high: 0, medium: 0, low: 0 }
      );

      // Check manual lookup quota
      let manualLookupAvailable = true;
      let nextLookupAvailableAt = null;
      
      if (user?.lastManualLookupAt) {
        const hoursSinceLastLookup = (Date.now() - user.lastManualLookupAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastLookup < 24) {
          manualLookupAvailable = false;
          nextLookupAvailableAt = new Date(user.lastManualLookupAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
        }
      }

      res.json({
        scans: scansWithBreaches,
        overview: {
          totalScans: scans.length,
          avgRiskScore,
          highRiskFindings: severityCounts.high,
          mediumRiskFindings: severityCounts.medium,
          lowRiskFindings: severityCounts.low,
        },
        quota: {
          manualLookupAvailable,
          nextLookupAvailableAt,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // AI Chat endpoints
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Create or continue a conversation
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { conversationId, message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message is required" });
      }

      let conversation;
      
      // Create new conversation if none exists
      if (!conversationId) {
        conversation = await storage.createConversation({
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        });
      } else {
        // Verify conversation belongs to user
        conversation = await storage.getConversationById(conversationId);
        if (!conversation || conversation.userId !== userId) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
      });

      // Get conversation history
      const messages = await storage.getMessagesByConversationId(conversation.id);
      
      // Get user's recent scan history (last 2-3 scans) with full context
      const recentScans = await storage.getRecentScansWithBreaches(userId, 3);
      
      // Build comprehensive security context
      let contextInfo = "";
      let highRiskAlert = "";
      
      if (recentScans.length > 0) {
        const latestScan = recentScans[0];
        const isHighRisk = latestScan.riskScore >= 80;
        
        // Build context from recent scans
        const scanSummaries = recentScans.map((scan, index) => {
          const scanDate = scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Unknown date';
          const topBreaches = scan.breaches
            .slice(0, 5)
            .map(b => `${b.name} (${b.severity} severity, ${b.pwnCount?.toLocaleString() || 'unknown'} accounts affected)`)
            .join(', ');
          
          return `Scan ${index + 1} (${scanDate}):
- Email: ${scan.email}
- Risk Score: ${scan.riskScore}/100
- Breaches: ${scan.breachCount}
- Top Findings: ${topBreaches || 'None'}
- AI Summary: ${scan.aiSummary || 'No summary available'}`;
        }).join('\n\n');

        contextInfo = `\n\nUser's Security Context (Last ${recentScans.length} Scans):\n${scanSummaries}`;
        
        // Check if high risk and add alert
        if (isHighRisk) {
          const highSeverityBreaches = latestScan.breaches.filter(b => b.severity === 'high');
          highRiskAlert = `\n\nHIGH RISK ALERT: The user's latest scan shows a risk score of ${latestScan.riskScore}/100. ${highSeverityBreaches.length} high-severity breaches detected. Offer to guide them through securing their data.`;
        }
      }

      // Prepare messages for OpenAI with specialized cybersecurity system prompt
      const chatMessages = [
        {
          role: "system" as const,
          content: `You are DarkTrack AI — an ethical, friendly cybersecurity assistant specialized in online privacy, data breaches, and digital security.

Your Mission:
- Help users understand and secure their online data
- Explain breaches and privacy risks in simple, clear language
- Provide actionable, specific security recommendations
- Be empathetic, supportive, and encouraging

Domain Restrictions (CRITICAL):
- You ONLY discuss cybersecurity, privacy, data protection, and online safety topics
- If asked about topics outside this domain (politics, jokes, general knowledge, etc.), politely redirect:
  "I'm DarkTrack AI — I focus on helping you stay safe online. Would you like a privacy or security tip instead?"
- Never discuss topics unrelated to cybersecurity, even if asked directly

Communication Style:
- Be friendly and conversational, like a mentor (not a robot)
- Use short, clear sentences
- Break down technical terms into everyday language
- Be honest but not alarmist about risks
- Celebrate security improvements with the user
- Use natural, supportive language

Examples of Your Tone:
- "Hey there! I checked your recent scan — you're doing much better than last week!"
- "No worries, these leaks are old ones. I'll guide you on how to stay safe from now on."
- "That's a smart question — privacy is like a seatbelt, you don't need it until you really need it."

When Explaining Technical Concepts:
- 2FA example: "2FA means two-factor authentication. It's an extra step when logging in — like entering a code from your phone. It makes it much harder for hackers to get in even if they know your password."
- Breach example: "A data breach means a website's security was compromised and hackers got access to user data. Think of it like someone breaking into a store and stealing customer records."

High-Risk Response Protocol:
${highRiskAlert}${highRiskAlert ? '\nIf relevant to the conversation, proactively ask: "Would you like me to guide you through securing or removing that data?"' : ''}

Privacy Rules:
- Never store or display actual passwords, credit cards, or other sensitive user data
- Only reference breach names and general security advice

Your Context About This User:${contextInfo}

Remember:
- Base ALL answers on the user's actual scan data shown above
- Reference their specific breaches, risk scores, and history
- Track progress across scans ("Your risk score improved from 75 to 62!")
- Provide specific, actionable next steps
- Stay within cybersecurity domain — redirect if off-topic`
        },
        ...messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
      ];

      // Get AI response using GPT-4o-mini
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1500,
      });

      const aiResponse = completion.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";

      // Save AI response
      const assistantMessage = await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse,
      });

      res.json({
        conversationId: conversation.id,
        message: assistantMessage,
      });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: error.message || "Failed to process chat message" });
    }
  });

  // Get all conversations for current user
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get a specific conversation with all messages
  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const conversation = await storage.getConversationById(id);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversationId(id);
      
      res.json({
        ...conversation,
        messages,
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
