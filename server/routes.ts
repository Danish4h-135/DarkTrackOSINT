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
      
      // Get user's latest scan for context
      const latestScan = await storage.getLatestScanByUserId(userId);
      let contextInfo = "";
      
      if (latestScan) {
        const breaches = await storage.getBreachesByScanId(latestScan.id);
        contextInfo = `\n\nUser's Security Context:
- Email scanned: ${latestScan.email}
- Breaches found: ${latestScan.breachCount}
- Risk score: ${latestScan.riskScore}/100
- Recent breaches: ${breaches.slice(0, 3).map(b => b.name).join(', ')}`;
      }

      // Prepare messages for OpenAI
      const chatMessages = [
        {
          role: "system" as const,
          content: `You are DarkTrack AI, a friendly and knowledgeable cybersecurity assistant. Your role is to help users understand their digital security, explain breaches, provide actionable advice, and answer questions about online privacy and security.

Be conversational, empathetic, and clear. Break down technical concepts into simple terms. When discussing breaches or risks, be honest but not alarmist. Always provide practical, actionable steps.${contextInfo}

Remember:
- Be concise but thorough
- Use bullet points for clarity
- Provide specific, actionable advice
- Explain technical terms when needed
- Be supportive and encouraging about security improvements`
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
        max_tokens: 1000,
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
