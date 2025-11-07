import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { checkHaveIBeenPwned, calculateRiskScore, generateAIAnalysis } from "./osint";

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

  const httpServer = createServer(app);
  return httpServer;
}
