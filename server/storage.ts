import {
  users,
  scans,
  breaches,
  type User,
  type UpsertUser,
  type Scan,
  type InsertScan,
  type Breach,
  type InsertBreach,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
        aiRecommendations: scanData.aiRecommendations ? [...scanData.aiRecommendations] : undefined,
      }])
      .returning();
    return scan;
  }

  async getLatestScanByUserId(userId: string): Promise<Scan | undefined> {
    const [scan] = await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt))
      .limit(1);
    return scan;
  }

  async getScansByUserId(userId: string): Promise<Scan[]> {
    return await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt));
  }

  async getScanById(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  // Breach operations
  async createBreach(breachData: InsertBreach): Promise<Breach> {
    const [breach] = await db
      .insert(breaches)
      .values([{
        ...breachData,
        dataClasses: breachData.dataClasses ? [...breachData.dataClasses] : undefined,
      }])
      .returning();
    return breach;
  }

  async createBreaches(breachesData: InsertBreach[]): Promise<Breach[]> {
    if (breachesData.length === 0) return [];
    const normalizedBreaches = breachesData.map(breach => ({
      ...breach,
      dataClasses: breach.dataClasses ? [...breach.dataClasses] : undefined,
    }));
    return await db
      .insert(breaches)
      .values(normalizedBreaches)
      .returning();
  }

  async getBreachesByScanId(scanId: string): Promise<Breach[]> {
    return await db
      .select()
      .from(breaches)
      .where(eq(breaches.scanId, scanId))
      .orderBy(desc(breaches.pwnCount));
  }
}

export const storage = new DatabaseStorage();
