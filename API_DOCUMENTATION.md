# DarkTrack API Documentation

## Overview
DarkTrack is an AI-powered OSINT analysis platform that reveals digital exposure across the internet with real-time breach detection, comprehensive scanning, and actionable insights.

## Base URL
All API endpoints are relative to: `http://localhost:5000` (development)

## Authentication
All API endpoints (except auth endpoints) require authentication using Replit Auth.

### Auth Endpoints

#### Login
```
GET /api/login
```
Redirects to Replit OAuth login page.

#### OAuth Callback
```
GET /api/callback
```
Handles OAuth callback from Replit.

#### Logout
```
GET /api/logout
```
Logs out the current user and clears session.

#### Get Current User
```
GET /api/auth/user
```
Returns the authenticated user's information.

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://...",
  "lastManualLookupAt": "2025-11-08T12:00:00Z",
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-08T12:00:00Z"
}
```

---

## Scan Endpoints

### Run OSINT Scan
```
POST /api/scan
```
Runs a full OSINT analysis on a specified email address.

**Request Body:**
```json
{
  "email": "target@example.com"
}
```

**Response:**
```json
{
  "id": "scan-uuid",
  "userId": "user-uuid",
  "email": "target@example.com",
  "breachCount": 5,
  "profilesDetected": 1,
  "riskScore": 75,
  "securedDataPercentage": 25,
  "aiSummary": "AI-generated analysis summary...",
  "aiRecommendations": ["Recommendation 1", "Recommendation 2"],
  "createdAt": "2025-11-08T12:00:00Z"
}
```

### Scan Self
```
POST /api/scan/self
```
Runs OSINT analysis on the authenticated user's own email.

**Response:** Same as `/api/scan`

### Get Latest Scan
```
GET /api/scans/latest
```
Returns the most recent scan for the authenticated user.

**Response:** Same as scan object

### Get All Scans
```
GET /api/scans
```
Returns all scans for the authenticated user.

**Response:**
```json
[
  {
    "id": "scan-uuid",
    "userId": "user-uuid",
    "email": "target@example.com",
    "breachCount": 5,
    "riskScore": 75,
    ...
  }
]
```

---

## Breach Endpoints

### Get Breaches for Scan
```
GET /api/breaches/:scanId
```
Returns all breaches found in a specific scan.

**Response:**
```json
[
  {
    "id": "breach-uuid",
    "scanId": "scan-uuid",
    "name": "Adobe",
    "domain": "adobe.com",
    "breachDate": "2013-10-04",
    "addedDate": "2013-12-04",
    "modifiedDate": "2022-05-15",
    "pwnCount": 152445165,
    "description": "Breach description...",
    "dataClasses": ["Email addresses", "Passwords"],
    "isVerified": 1,
    "isFabricated": 0,
    "isSensitive": 0,
    "isRetired": 0,
    "isSpamList": 0,
    "isMalware": 0,
    "severity": "high",
    "createdAt": "2025-11-08T12:00:00Z"
  }
]
```

### Get Latest Scan Breaches
```
GET /api/breaches
```
Returns all breaches from the user's most recent scan.

**Response:** Same as `/api/breaches/:scanId`

---

## Manual Lookup Endpoints

### Manual Email Lookup
```
POST /api/lookup
```
Performs a manual email lookup (limited to once per 24 hours).

**Request Body:**
```json
{
  "email": "lookup@example.com"
}
```

**Success Response:**
```json
{
  "email": "lookup@example.com",
  "breachCount": 3,
  "riskScore": 60,
  "securedDataPercentage": 40,
  "aiSummary": "Analysis summary...",
  "aiRecommendations": ["Recommendation 1", "Recommendation 2"],
  "breaches": [...]
}
```

**Rate Limited Response (429):**
```json
{
  "error": true,
  "message": "You can perform one manual lookup every 24 hours. Next one available at: 2025-11-09T12:00:00Z",
  "nextAvailableAt": "2025-11-09T12:00:00Z"
}
```

### Save Manual Lookup
```
POST /api/lookup/save
```
Saves the results from a manual lookup as a scan.

**Request Body:**
```json
{
  "email": "lookup@example.com",
  "breachCount": 3,
  "riskScore": 60,
  "securedDataPercentage": 40,
  "aiSummary": "Analysis summary...",
  "aiRecommendations": ["Recommendation 1"],
  "breaches": [...]
}
```

**Response:** Scan object

---

## Dashboard Endpoint

### Get Dashboard Data
```
GET /api/dashboard
```
Returns comprehensive dashboard data including scans, metrics, and quota status.

**Response:**
```json
{
  "scans": [
    {
      "id": "scan-uuid",
      "email": "target@example.com",
      "riskScore": 75,
      "breaches": [...]
    }
  ],
  "overview": {
    "totalScans": 10,
    "avgRiskScore": 65,
    "highRiskFindings": 5,
    "mediumRiskFindings": 8,
    "lowRiskFindings": 12
  },
  "quota": {
    "manualLookupAvailable": true,
    "nextLookupAvailableAt": null
  }
}
```

---

## AI Chat Endpoints

### Send Chat Message
```
POST /api/chat
```
Sends a message to the AI assistant and receives a response.

**Request Body:**
```json
{
  "conversationId": "conversation-uuid",  // Optional, creates new if not provided
  "message": "What should I do about the Adobe breach?"
}
```

**Response:**
```json
{
  "conversationId": "conversation-uuid",
  "message": {
    "id": "message-uuid",
    "conversationId": "conversation-uuid",
    "role": "assistant",
    "content": "AI response text...",
    "createdAt": "2025-11-08T12:00:00Z"
  }
}
```

### Get All Conversations
```
GET /api/conversations
```
Returns all conversations for the authenticated user.

**Response:**
```json
[
  {
    "id": "conversation-uuid",
    "userId": "user-uuid",
    "title": "Adobe breach discussion",
    "createdAt": "2025-11-08T10:00:00Z",
    "updatedAt": "2025-11-08T12:00:00Z"
  }
]
```

### Get Conversation with Messages
```
GET /api/conversations/:id
```
Returns a specific conversation with all its messages.

**Response:**
```json
{
  "id": "conversation-uuid",
  "userId": "user-uuid",
  "title": "Adobe breach discussion",
  "createdAt": "2025-11-08T10:00:00Z",
  "updatedAt": "2025-11-08T12:00:00Z",
  "messages": [
    {
      "id": "message-uuid",
      "conversationId": "conversation-uuid",
      "role": "user",
      "content": "What should I do?",
      "createdAt": "2025-11-08T11:00:00Z"
    },
    {
      "id": "message-uuid-2",
      "conversationId": "conversation-uuid",
      "role": "assistant",
      "content": "Here's what I recommend...",
      "createdAt": "2025-11-08T11:01:00Z"
    }
  ]
}
```

---

## Required Environment Variables

The following environment variables must be configured:

### Database
- `DATABASE_URL` - PostgreSQL connection string (managed by Replit Database integration)

### Authentication
- `REPL_ID` - Replit application ID (auto-provided)
- `ISSUER_URL` - Replit OIDC issuer URL (auto-provided, defaults to https://replit.com/oidc)
- `SESSION_SECRET` - Secret key for session encryption

### AI Services
- `GEMINI_API_KEY` - Google Gemini API key for AI chat assistant
- `OPENAI_API_KEY` - OpenAI API key for breach analysis

### OSINT Services
- `HAVEIBEENPWNED_API_KEY` - Have I Been Pwned API key for breach data

### Optional
- `ENCRYPTION_KEY` - Custom encryption key (auto-generated in development)
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment mode (development/production)

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid email format"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Scan not found"
}
```

### 429 Too Many Requests
```json
{
  "error": true,
  "message": "Rate limit exceeded",
  "nextAvailableAt": "2025-11-09T12:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to process request"
}
```

---

## Data Models

### User
```typescript
{
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  lastManualLookupAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Scan
```typescript
{
  id: string;
  userId: string;
  email: string;
  breachCount: number;
  profilesDetected: number;
  riskScore: number;              // 0-100
  securedDataPercentage: number;  // 0-100
  aiSummary: string | null;
  aiRecommendations: string[];
  createdAt: Date;
}
```

### Breach
```typescript
{
  id: string;
  scanId: string;
  name: string;
  domain: string | null;
  breachDate: string | null;
  addedDate: string | null;
  modifiedDate: string | null;
  pwnCount: number | null;
  description: string | null;
  dataClasses: string[];
  isVerified: number;      // 0 or 1
  isFabricated: number;    // 0 or 1
  isSensitive: number;     // 0 or 1
  isRetired: number;       // 0 or 1
  isSpamList: number;      // 0 or 1
  isMalware: number;       // 0 or 1
  severity: "low" | "medium" | "high";
  createdAt: Date;
}
```

### Conversation
```typescript
{
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message
```typescript
{
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
```
