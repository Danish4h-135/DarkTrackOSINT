import {
  users,
  scans,
  breaches,
  vulnerabilities,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type Scan,
  type InsertScan,
  type Breach,
  type InsertBreach,
  type Vulnerability,
  type InsertVulnerability,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { encrypt, decrypt } from "./encrypt";

export interface ScanWithBreaches extends Scan {
  breaches: Breach[];
}

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserManualLookupTimestamp(id: string): Promise<void>;
  
  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getLatestScanByUserId(userId: string): Promise<Scan | undefined>;
  getScansByUserId(userId: string): Promise<Scan[]>;
  getScanById(id: string): Promise<Scan | undefined>;
  getRecentScansWithBreaches(userId: string, limit: number): Promise<ScanWithBreaches[]>;
  updateScanAISuggestions(scanId: string, aiSummary: string, aiRecommendations: string[]): Promise<Scan | undefined>;
  
  // Breach operations
  createBreach(breach: InsertBreach): Promise<Breach>;
  createBreaches(breaches: InsertBreach[]): Promise<Breach[]>;
  getBreachesByScanId(scanId: string): Promise<Breach[]>;
  
  // Vulnerability operations
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  createVulnerabilities(vulnerabilities: InsertVulnerability[]): Promise<Vulnerability[]>;
  getVulnerabilitiesByScanId(scanId: string): Promise<Vulnerability[]>;
  getOpenVulnerabilitiesByUserId(userId: string): Promise<Vulnerability[]>;
  getResolvedVulnerabilitiesByUserId(userId: string): Promise<Vulnerability[]>;
  resolveVulnerability(id: string): Promise<Vulnerability | undefined>;
  
  // Conversation operations - AI chat
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationById(id: string): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  updateConversationTitle(id: string, title: string): Promise<void>;
  
  // Message operations - AI chat
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserManualLookupTimestamp(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastManualLookupAt: new Date() })
      .where(eq(users.id, id));
  }

  // Scan operations
  async createScan(scanData: InsertScan): Promise<Scan> {
    const [scan] = await db
      .insert(scans)
      .values([{
        ...scanData,
        email: encrypt(scanData.email),
        aiSummary: scanData.aiSummary ? encrypt(scanData.aiSummary) : null,
        aiRecommendations: scanData.aiRecommendations ? [...scanData.aiRecommendations] : undefined,
      }])
      .returning();
    
    // Decrypt for return
    return {
      ...scan,
      email: decrypt(scan.email),
      aiSummary: scan.aiSummary ? decrypt(scan.aiSummary) : null,
    };
  }

  async getLatestScanByUserId(userId: string): Promise<Scan | undefined> {
    const [scan] = await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt))
      .limit(1);
    
    if (!scan) return undefined;
    
    // Decrypt sensitive fields
    return {
      ...scan,
      email: decrypt(scan.email),
      aiSummary: scan.aiSummary ? decrypt(scan.aiSummary) : null,
    };
  }

  async getScansByUserId(userId: string): Promise<Scan[]> {
    const scanList = await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt));
    
    // Decrypt sensitive fields for each scan
    return scanList.map(scan => ({
      ...scan,
      email: decrypt(scan.email),
      aiSummary: scan.aiSummary ? decrypt(scan.aiSummary) : null,
    }));
  }

  async getScanById(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    
    if (!scan) return undefined;
    
    // Decrypt sensitive fields
    return {
      ...scan,
      email: decrypt(scan.email),
      aiSummary: scan.aiSummary ? decrypt(scan.aiSummary) : null,
    };
  }

  async getRecentScansWithBreaches(userId: string, limit: number): Promise<ScanWithBreaches[]> {
    const scanList = await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt))
      .limit(limit);
    
    // Decrypt scans and get their breaches
    const scansWithBreaches = await Promise.all(
      scanList.map(async (scan) => {
        const breachList = await this.getBreachesByScanId(scan.id);
        return {
          ...scan,
          email: decrypt(scan.email),
          aiSummary: scan.aiSummary ? decrypt(scan.aiSummary) : null,
          breaches: breachList,
        };
      })
    );
    
    return scansWithBreaches;
  }

  async updateScanAISuggestions(scanId: string, aiSummary: string, aiRecommendations: string[]): Promise<Scan | undefined> {
    const [updated] = await db
      .update(scans)
      .set({
        aiSummary: encrypt(aiSummary),
        aiRecommendations: aiRecommendations,
        aiGeneratedAt: new Date(),
      })
      .where(eq(scans.id, scanId))
      .returning();
    
    if (!updated) return undefined;
    
    // Decrypt for return
    return {
      ...updated,
      email: decrypt(updated.email),
      aiSummary: updated.aiSummary ? decrypt(updated.aiSummary) : null,
    };
  }

  // Breach operations
  async createBreach(breachData: InsertBreach): Promise<Breach> {
    const [breach] = await db
      .insert(breaches)
      .values([{
        ...breachData,
        description: breachData.description ? encrypt(breachData.description) : null,
        dataClasses: breachData.dataClasses ? [...breachData.dataClasses] : undefined,
      }])
      .returning();
    
    // Decrypt for return
    return {
      ...breach,
      description: breach.description ? decrypt(breach.description) : null,
    };
  }

  async createBreaches(breachesData: InsertBreach[]): Promise<Breach[]> {
    if (breachesData.length === 0) return [];
    const normalizedBreaches = breachesData.map(breach => ({
      ...breach,
      description: breach.description ? encrypt(breach.description) : null,
      dataClasses: breach.dataClasses ? [...breach.dataClasses] : undefined,
    }));
    const createdBreaches = await db
      .insert(breaches)
      .values(normalizedBreaches)
      .returning();
    
    // Decrypt for return
    return createdBreaches.map(breach => ({
      ...breach,
      description: breach.description ? decrypt(breach.description) : null,
    }));
  }

  async getBreachesByScanId(scanId: string): Promise<Breach[]> {
    const breachList = await db
      .select()
      .from(breaches)
      .where(eq(breaches.scanId, scanId))
      .orderBy(desc(breaches.pwnCount));
    
    // Decrypt sensitive fields for each breach
    return breachList.map(breach => ({
      ...breach,
      description: breach.description ? decrypt(breach.description) : null,
    }));
  }

  // Conversation operations
  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async getConversationById(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values([{
        ...messageData,
        role: messageData.role as "user" | "assistant",
      }])
      .returning();
    
    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, messageData.conversationId));
    
    return message;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Vulnerability operations
  async createVulnerability(vulnerabilityData: InsertVulnerability): Promise<Vulnerability> {
    const [vulnerability] = await db
      .insert(vulnerabilities)
      .values([{
        ...vulnerabilityData,
        title: encrypt(vulnerabilityData.title),
        description: vulnerabilityData.description ? encrypt(vulnerabilityData.description) : null,
        metadataEnc: vulnerabilityData.metadataEnc ? encrypt(vulnerabilityData.metadataEnc) : null,
      }])
      .returning();
    
    // Decrypt for return
    return {
      ...vulnerability,
      title: decrypt(vulnerability.title),
      description: vulnerability.description ? decrypt(vulnerability.description) : null,
      metadataEnc: vulnerability.metadataEnc ? decrypt(vulnerability.metadataEnc) : null,
    };
  }

  async createVulnerabilities(vulnerabilitiesData: InsertVulnerability[]): Promise<Vulnerability[]> {
    if (vulnerabilitiesData.length === 0) return [];
    
    const normalized = vulnerabilitiesData.map(vuln => ({
      ...vuln,
      title: encrypt(vuln.title),
      description: vuln.description ? encrypt(vuln.description) : null,
      metadataEnc: vuln.metadataEnc ? encrypt(vuln.metadataEnc) : null,
    }));
    
    const created = await db
      .insert(vulnerabilities)
      .values(normalized)
      .returning();
    
    // Decrypt for return
    return created.map(vuln => ({
      ...vuln,
      title: decrypt(vuln.title),
      description: vuln.description ? decrypt(vuln.description) : null,
      metadataEnc: vuln.metadataEnc ? decrypt(vuln.metadataEnc) : null,
    }));
  }

  async getVulnerabilitiesByScanId(scanId: string): Promise<Vulnerability[]> {
    const vulnList = await db
      .select()
      .from(vulnerabilities)
      .where(eq(vulnerabilities.scanId, scanId))
      .orderBy(desc(vulnerabilities.createdAt));
    
    // Decrypt sensitive fields
    return vulnList.map(vuln => ({
      ...vuln,
      title: decrypt(vuln.title),
      description: vuln.description ? decrypt(vuln.description) : null,
      metadataEnc: vuln.metadataEnc ? decrypt(vuln.metadataEnc) : null,
    }));
  }

  async getOpenVulnerabilitiesByUserId(userId: string): Promise<Vulnerability[]> {
    const vulnList = await db
      .select({
        id: vulnerabilities.id,
        scanId: vulnerabilities.scanId,
        title: vulnerabilities.title,
        description: vulnerabilities.description,
        metadataEnc: vulnerabilities.metadataEnc,
        riskCategory: vulnerabilities.riskCategory,
        resolved: vulnerabilities.resolved,
        resolvedAt: vulnerabilities.resolvedAt,
        createdAt: vulnerabilities.createdAt,
      })
      .from(vulnerabilities)
      .innerJoin(scans, eq(vulnerabilities.scanId, scans.id))
      .where(and(
        eq(scans.userId, userId),
        eq(vulnerabilities.resolved, 0)
      ))
      .orderBy(desc(vulnerabilities.createdAt));
    
    // Decrypt sensitive fields
    return vulnList.map((vuln: any) => ({
      ...vuln,
      title: decrypt(vuln.title),
      description: vuln.description ? decrypt(vuln.description) : null,
      metadataEnc: vuln.metadataEnc ? decrypt(vuln.metadataEnc) : null,
    }));
  }

  async getResolvedVulnerabilitiesByUserId(userId: string): Promise<Vulnerability[]> {
    const vulnList = await db
      .select({
        id: vulnerabilities.id,
        scanId: vulnerabilities.scanId,
        title: vulnerabilities.title,
        description: vulnerabilities.description,
        metadataEnc: vulnerabilities.metadataEnc,
        riskCategory: vulnerabilities.riskCategory,
        resolved: vulnerabilities.resolved,
        resolvedAt: vulnerabilities.resolvedAt,
        createdAt: vulnerabilities.createdAt,
      })
      .from(vulnerabilities)
      .innerJoin(scans, eq(vulnerabilities.scanId, scans.id))
      .where(and(
        eq(scans.userId, userId),
        eq(vulnerabilities.resolved, 1)
      ))
      .orderBy(desc(vulnerabilities.resolvedAt));
    
    // Decrypt sensitive fields
    return vulnList.map((vuln: any) => ({
      ...vuln,
      title: decrypt(vuln.title),
      description: vuln.description ? decrypt(vuln.description) : null,
      metadataEnc: vuln.metadataEnc ? decrypt(vuln.metadataEnc) : null,
    }));
  }

  async resolveVulnerability(id: string): Promise<Vulnerability | undefined> {
    const [vuln] = await db
      .update(vulnerabilities)
      .set({ 
        resolved: 1,
        resolvedAt: new Date(),
      })
      .where(eq(vulnerabilities.id, id))
      .returning();
    
    if (!vuln) return undefined;
    
    // Decrypt for return
    return {
      ...vuln,
      title: decrypt(vuln.title),
      description: vuln.description ? decrypt(vuln.description) : null,
      metadataEnc: vuln.metadataEnc ? decrypt(vuln.metadataEnc) : null,
    };
  }
}

export const storage = new DatabaseStorage();
