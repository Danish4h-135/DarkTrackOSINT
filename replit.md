# DarkTrack - Ethical OSINT Dashboard

## Project Overview
DarkTrack is an ethical OSINT (Open Source Intelligence) dashboard that analyzes digital footprints across the internet. It provides AI-powered security insights and recommendations to help users protect their online presence.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** with custom dark theme and animations
- **Shadcn UI** components
- **Lucide React** icons
- **Framer Motion** for professional animations and page transitions

### Backend
- **Express.js** server
- **PostgreSQL** database (Neon)
- **Drizzle ORM** for database operations
- **Replit Auth** (OpenID Connect) - supports GitHub, Google, Apple, email/password
- **OpenAI GPT-4o-mini** for AI-powered risk analysis and breach summaries
- **Google Gemini 2.5 Flash** (@google/genai SDK) for intelligent conversational chatbot assistant
- **HaveIBeenPwned API** for breach data
- **CryptoJS** for AES encryption of sensitive data

## Features

### Authentication
- **Multi-method authentication system** with three signup/login options:
  1. **Google OAuth** via Replit Auth (OpenID Connect)
  2. **Email + Password** with bcrypt password hashing
  3. **Phone + OTP** with SMS verification via Twilio
- **Email verification flow** with SendGrid integration
- **Phone users prompted to attach email** after OTP verification
- **Session management** with PostgreSQL storage
- **Password security** using PBKDF2 with 100,000 iterations
- **Encrypted sensitive data** using CryptoJS AES encryption
- **Protected routes** with automatic token refresh

### OSINT Scanning
- Email breach detection via HaveIBeenPwned API
- Risk score calculation (0-100)
- Data classification and severity assessment
- Profile detection across the internet

### AI Analysis
- GPT-4o-mini powered security insights
- Personalized recommendations based on findings
- Natural language summaries of breach data
- Actionable security steps

### AI Conversational Assistant (Powered by Google Gemini)
- **Gemini 2.5 Flash Model**: Uses Google's latest gemini-2.5-flash via @google/genai SDK for natural conversations
- **Domain-Restricted AI**: Only discusses cybersecurity, privacy, and online safety topics
- **Context-Aware**: Loads last 3 scans with full breach data before each response
- **High-Risk Alerts**: Automatically detects risk scores ≥70 and offers guided assistance
- **Empathetic Mentor Tone**: Friendly, supportive communication style with simple language
- **Data-Driven Insights**: Bases all answers on actual user scan history and breach findings
- **Progress Tracking**: References improvements across multiple scans
- **Technical Explanations**: Breaks down complex security concepts into everyday language
- **Actionable Recommendations**: Provides specific, step-by-step security guidance
- **Multi-conversation support** with persistent history in database
- **Automatic conversation title generation** from first message
- **Off-topic redirection** to keep focus on security
- **Graceful error handling** for API limits, missing keys, and model failures
- **AI Separation**: OpenAI handles breach analysis; Gemini handles all chat interactions

### Dashboard Features
1. **Metrics Overview**
   - Breaches Found
   - Profiles Detected
   - Risk Score (0-100)
   - Secured Data Percentage

2. **Breach Details**
   - Comprehensive breach information
   - Severity badges (high/medium/low)
   - Affected data classes
   - Historical breach dates and account counts

3. **AI Recommendations Panel**
   - Summary of security findings
   - Bulleted action items
   - Context-aware advice

4. **Risk Score Visualization**
   - Color-coded risk levels
   - Progress bar visualization
   - Clear risk classification (Low: 0-30, Medium: 31-60, High: 61-100)

5. **Scan History**
   - All previous scans
   - Historical risk trends
   - Email tracking per scan

6. **AI Chat Interface**
   - Interactive conversational assistant
   - Conversation list sidebar
   - Real-time message streaming
   - Context-aware security advice
   - Persistent chat history

## Database Schema

### Tables
1. **sessions** - Session storage (required for Replit Auth)
2. **users** - User profiles from authentication
3. **scans** - OSINT scan results
4. **breaches** - Individual breach findings per scan
5. **conversations** - AI chat conversation sessions
6. **messages** - Individual messages in conversations

### Relationships
- Users → Scans (one-to-many)
- Scans → Breaches (one-to-many)
- Users → Conversations (one-to-many)
- Conversations → Messages (one-to-many)

## API Endpoints

### Authentication
- `GET /api/login` - Initiate Google OAuth login flow
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - Sign out
- `GET /api/auth/user` - Get current user (protected)
- `POST /api/auth/signup-email` - Sign up with email/password
- `POST /api/auth/login-email` - Log in with email/password
- `POST /api/auth/signup-phone` - Sign up with phone number (sends OTP)
- `POST /api/auth/verify-otp` - Verify phone OTP code
- `POST /api/auth/resend-otp` - Resend OTP code
- `POST /api/auth/attach-email` - Attach email to phone-based account (protected)
- `GET /api/auth/verify-email/:token` - Verify email address via token

### Scans
- `POST /api/scan` - Run new OSINT scan (protected)
- `GET /api/scans/latest` - Get latest scan for user (protected)
- `GET /api/scans` - Get all scans for user (protected)

### Breaches
- `GET /api/breaches` - Get breaches for latest scan (protected)
- `GET /api/breaches/:scanId` - Get breaches for specific scan (protected)

### AI Chat
- `POST /api/chat` - Send message and get AI response (protected)
- `GET /api/conversations` - Get all conversations for user (protected)
- `GET /api/conversations/:id` - Get conversation with messages (protected)

## Design System

### Colors
- **Primary**: Neon Blue (#0080FF) - CTAs, active states, important metrics
- **Background**: Very dark blue-gray for professional appearance
- **Card**: Slightly lighter than background for elevation
- **Success**: Green tones for secured data
- **Warning**: Amber for medium risk
- **Destructive**: Red for high risk and breaches

### Typography
- **Primary**: Inter - Clean, professional sans-serif
- **Monospace**: JetBrains Mono - For data values and metrics

### Spacing
- Consistent use of Tailwind units: 4, 6, 8, 12, 16
- Component padding: p-6, p-8
- Section gaps: gap-6, gap-8

## Security & Privacy

### Ethical OSINT Practices
- Uses only public data sources
- Never accesses private information
- No unauthorized scraping or hacking
- Transparent about data sources

### Data Protection
- AES encryption for sensitive data at rest
- Encrypted scan results and breach data
- User data never shared with third parties
- Session-based authentication with secure cookies
- HTTPS only in production
- Secure environment variable management
- Conversation data encrypted and isolated per user

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `OPENAI_API_KEY` - OpenAI API access for breach risk analysis
- `GEMINI_API_KEY` - Google Gemini API access for conversational chatbot (@google/genai SDK)
- `HIBP_API_KEY` - HaveIBeenPwned API access
- `TWILIO_ACCOUNT_SID` - Twilio Account SID for SMS OTP
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Twilio phone number (E.164 format)
- `SENDGRID_API_KEY` - SendGrid API key for email verification
- `SENDGRID_FROM_EMAIL` - Email address to send from
- `ENCRYPTION_KEY` - AES encryption key for sensitive data (optional, auto-generated in dev)
- `REPL_ID` - Replit application ID (auto-provided)
- `ISSUER_URL` - OIDC issuer URL (defaults to Replit)

## Recent Changes
- 2025-11-08 (Latest): **Multi-Method Authentication System** - Extended authentication to support three methods: Google OAuth (existing), Email+Password with PBKDF2 hashing, and Phone+OTP with Twilio SMS verification. Phone users are prompted to attach email after OTP verification. All sensitive data (email, phone, OTP codes) encrypted using CryptoJS AES. Added comprehensive auth routes and frontend pages with form validation. Fixed critical encryption issue by standardizing on single encrypt.ts implementation.
- 2025-11-08: **Daily AI Security Suggestions** - Implemented automatic daily refresh of AI-powered security tips on the dashboard. Added "Today's Security Tips" card that displays personalized recommendations, risk assessment, and summary. AI suggestions automatically regenerate every 24 hours or when missing, using OpenAI to analyze latest scan data. Added `aiGeneratedAt` timestamp tracking to database schema.
- 2025-11-08: **Professional Animations & API Integration** - Added comprehensive Framer Motion animations throughout the application with smooth transitions, counting animations, shimmer effects, hover interactions, and page transitions. Configured all API keys (OpenAI, Gemini, HaveIBeenPwned) for full functionality.
- 2025-11-08: **Gemini SDK Migration** - Migrated from deprecated @google/generative-ai package to new @google/genai SDK with gemini-2.5-flash model for improved chatbot performance and latest features
- 2025-11-08: **AI Upgrade** - Transformed AI into specialized cybersecurity companion with domain restrictions, context-aware responses from scan history, high-risk detection, and empathetic mentor tone
- 2025-11-08: Added AI conversational assistant with GPT-4o-mini, AES encryption for data protection, persistent chat history
- 2025-11-07: Initial MVP implementation with full OSINT scanning, AI analysis, and authentication

## User Preferences
None specified yet

## Project Architecture
- **Frontend-heavy design**: Maximum logic in React components
- **Thin API layer**: Backend focused on data persistence and external API calls
- **Component-based UI**: Reusable components for consistent design
- **Type-safe**: Full TypeScript coverage across frontend and backend
- **Responsive-first**: Mobile-optimized layouts with desktop enhancements
- **Animation-rich UX**: Professional Framer Motion animations throughout with smooth page transitions, micro-interactions, and loading states

## Animation Features
- **Landing Page**: Smooth fade-in and slide-up animations with staggered entrance effects and rotating shield icon
- **Metric Cards**: Animated counting numbers with spring physics, hover lift effects, and icon rotation on hover
- **Breach Cards**: Slide-in animations with expandable descriptions, animated badge reveals, and smooth height transitions
- **Risk Score Chart**: Animated progress bars with smooth filling, counting animation for scores, and fade-in effects
- **AI Recommendations**: Staggered list animations with hover slide effects and periodic sparkle icon rotation
- **Loading States**: Shimmer skeleton animations for better perceived performance
- **Page Transitions**: Smooth fade and slide animations between routes using AnimatePresence
- **Hover Effects**: Consistent micro-interactions on buttons, cards, and interactive elements
