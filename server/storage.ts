import {
  users,
  scans,
  breaches,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type Scan,
  type InsertScan,
  type Breach,
  type InsertBreach,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { encrypt, decrypt } from "./encrypt";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getLatestScanByUserId(userId: string): Promise<Scan | undefined>;
  getScansByUserId(userId: string): Promise<Scan[]>;
  getScanById(id: string): Promise<Scan | undefined>;
  
  // Breach operations
  createBreach(breach: InsertBreach): Promise<Breach>;
  createBreaches(breaches: InsertBreach[]): Promise<Breach[]>;
  getBreachesByScanId(scanId: string): Promise<Breach[]>;
  
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
}

export const storage = new DatabaseStorage();
