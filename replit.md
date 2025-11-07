# DarkTrack - Ethical OSINT Dashboard

## Project Overview
DarkTrack is an ethical OSINT (Open Source Intelligence) dashboard that analyzes digital footprints across the internet. It provides AI-powered security insights and recommendations to help users protect their online presence.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** with custom dark theme
- **Shadcn UI** components
- **Lucide React** icons

### Backend
- **Express.js** server
- **PostgreSQL** database (Neon)
- **Drizzle ORM** for database operations
- **Replit Auth** (OpenID Connect) - supports GitHub, Google, Apple, email/password
- **OpenAI GPT-5** for AI-powered security analysis
- **HaveIBeenPwned API** for breach data

## Features

### Authentication
- Multi-provider authentication via Replit Auth
- Supports GitHub, Google, Apple, and email/password login
- Session management with PostgreSQL storage
- Protected routes with automatic token refresh

### OSINT Scanning
- Email breach detection via HaveIBeenPwned API
- Risk score calculation (0-100)
- Data classification and severity assessment
- Profile detection across the internet

### AI Analysis
- GPT-5 powered security insights
- Personalized recommendations based on findings
- Natural language summaries of breach data
- Actionable security steps

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

## Database Schema

### Tables
1. **sessions** - Session storage (required for Replit Auth)
2. **users** - User profiles from authentication
3. **scans** - OSINT scan results
4. **breaches** - Individual breach findings per scan

### Relationships
- Users → Scans (one-to-many)
- Scans → Breaches (one-to-many)

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - Sign out
- `GET /api/auth/user` - Get current user (protected)

### Scans
- `POST /api/scan` - Run new OSINT scan (protected)
- `GET /api/scans/latest` - Get latest scan for user (protected)
- `GET /api/scans` - Get all scans for user (protected)

### Breaches
- `GET /api/breaches` - Get breaches for latest scan (protected)
- `GET /api/breaches/:scanId` - Get breaches for specific scan (protected)

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
- All scans encrypted and stored securely
- User data never shared with third parties
- Session-based authentication with secure cookies
- HTTPS only in production

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `OPENAI_API_KEY` - OpenAI API access
- `REPL_ID` - Replit application ID (auto-provided)
- `ISSUER_URL` - OIDC issuer URL (defaults to Replit)

## Recent Changes
- 2025-11-07: Initial MVP implementation with full OSINT scanning, AI analysis, and authentication

## User Preferences
None specified yet

## Project Architecture
- **Frontend-heavy design**: Maximum logic in React components
- **Thin API layer**: Backend focused on data persistence and external API calls
- **Component-based UI**: Reusable components for consistent design
- **Type-safe**: Full TypeScript coverage across frontend and backend
- **Responsive-first**: Mobile-optimized layouts with desktop enhancements
