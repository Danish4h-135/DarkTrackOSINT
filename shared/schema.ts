import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - supports multiple auth methods
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  emailEncrypted: text("email_encrypted"),
  passwordHash: varchar("password_hash"),
  phoneNumber: varchar("phone_number").unique(),
  phoneNumberEncrypted: text("phone_number_encrypted"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: integer("email_verified").notNull().default(0),
  phoneVerified: integer("phone_verified").notNull().default(0),
  authProvider: varchar("auth_provider").notNull().default("google"),
  otpCode: varchar("otp_code"),
  otpExpiry: timestamp("otp_expiry"),
  verificationToken: varchar("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  lastManualLookupAt: timestamp("last_manual_lookup_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const signupEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const loginEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupPhoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (E.164)"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const attachEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string(),
  otpCode: z.string().length(6, "OTP code must be 6 digits"),
});

export const verifyEmailTokenSchema = z.object({
  token: z.string(),
});

export type SignupEmail = z.infer<typeof signupEmailSchema>;
export type LoginEmail = z.infer<typeof loginEmailSchema>;
export type SignupPhone = z.infer<typeof signupPhoneSchema>;
export type AttachEmail = z.infer<typeof attachEmailSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;
export type VerifyEmailToken = z.infer<typeof verifyEmailTokenSchema>;

// Scans table - stores OSINT scan results
export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  breachCount: integer("breach_count").notNull().default(0),
  profilesDetected: integer("profiles_detected").notNull().default(0),
  riskScore: integer("risk_score").notNull().default(0),
  securedDataPercentage: integer("secured_data_percentage").notNull().default(100),
  aiSummary: text("ai_summary"),
  aiRecommendations: jsonb("ai_recommendations").$type<string[]>(),
  aiGeneratedAt: timestamp("ai_generated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;

// Breaches table - stores individual breach findings
export const breaches = pgTable("breaches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull().references(() => scans.id),
  name: varchar("name").notNull(),
  domain: varchar("domain"),
  breachDate: varchar("breach_date"),
  addedDate: varchar("added_date"),
  modifiedDate: varchar("modified_date"),
  pwnCount: integer("pwn_count"),
  description: text("description"),
  dataClasses: jsonb("data_classes").$type<string[]>(),
  isVerified: integer("is_verified").notNull().default(0),
  isFabricated: integer("is_fabricated").notNull().default(0),
  isSensitive: integer("is_sensitive").notNull().default(0),
  isRetired: integer("is_retired").notNull().default(0),
  isSpamList: integer("is_spam_list").notNull().default(0),
  isMalware: integer("is_malware").notNull().default(0),
  severity: varchar("severity").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBreachSchema = createInsertSchema(breaches).omit({
  id: true,
  createdAt: true,
});

export type InsertBreach = z.infer<typeof insertBreachSchema>;
export type Breach = typeof breaches.$inferSelect;

// Vulnerabilities table - stores actionable security vulnerabilities from scans
export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull().references(() => scans.id),
  title: varchar("title").notNull(),
  description: text("description"),
  metadataEnc: text("metadata_enc"), // Encrypted JSON metadata (breach details, etc)
  riskCategory: varchar("risk_category").notNull().default("medium"), // low, medium, high, critical
  resolved: integer("resolved").notNull().default(0), // 0 = false, 1 = true
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
  createdAt: true,
});

export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;

// Conversations table - stores AI chat sessions
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table - stores individual chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  role: varchar("role").notNull().$type<"user" | "assistant">(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
