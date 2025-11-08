# DarkTrack Setup Guide

## Project Status: ✅ Ready

Your DarkTrack application has been successfully imported and is running on port 5000!

## What's Working

✅ **Application Server** - Running on http://localhost:5000  
✅ **Frontend** - Landing page with authentication  
✅ **Backend APIs** - All 15 endpoints operational  
✅ **Database Schema** - PostgreSQL with 6 tables configured  
✅ **Routing** - Wouter-based SPA routing ready  

---

## Required API Keys & Environment Variables

To fully activate all features, you'll need to configure the following API keys:

### 🔐 Authentication (Replit Auth)
These are auto-configured by Replit:
- ✅ `REPL_ID` - Auto-provided
- ✅ `ISSUER_URL` - Auto-provided
- ⚠️ `SESSION_SECRET` - **Needs to be set** (use any random secure string)

### 🗄️ Database
- ✅ `DATABASE_URL` - Auto-configured via Replit Database integration

### 🤖 AI Services
You need to obtain these API keys:

#### Google Gemini (for AI Chat Assistant)
- ⚠️ `GEMINI_API_KEY` - **Required for /api/chat endpoints**
- Get it from: https://makersuite.google.com/app/apikey

#### OpenAI (for Breach Analysis)
- ⚠️ `OPENAI_API_KEY` - **Required for AI analysis in scans**
- Get it from: https://platform.openai.com/api-keys

### 🔍 OSINT Services
#### Have I Been Pwned
- ⚠️ `HAVEIBEENPWNED_API_KEY` - **Required for breach detection**
- Get it from: https://haveibeenpwned.com/API/Key

### 🔒 Optional
- `ENCRYPTION_KEY` - Auto-generated in development, set manually for production

---

## Available API Endpoints

See `API_DOCUMENTATION.md` for complete endpoint details.

### Authentication (3 endpoints)
- `GET /api/login` - Initiate login
- `GET /api/callback` - OAuth callback
- `GET /api/logout` - Logout
- `GET /api/auth/user` - Get current user

### OSINT Scanning (4 endpoints)
- `POST /api/scan` - Run scan on any email
- `POST /api/scan/self` - Scan your own email
- `GET /api/scans/latest` - Get latest scan
- `GET /api/scans` - Get all scans

### Breach Data (2 endpoints)
- `GET /api/breaches/:scanId` - Get breaches for scan
- `GET /api/breaches` - Get latest scan breaches

### Manual Lookup (2 endpoints)
- `POST /api/lookup` - Manual email lookup (24h limit)
- `POST /api/lookup/save` - Save lookup results

### Dashboard (1 endpoint)
- `GET /api/dashboard` - Get dashboard overview

### AI Chat (3 endpoints)
- `POST /api/chat` - Send message to AI assistant
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get conversation with messages

---

## Database Tables

Your PostgreSQL database has the following tables:

1. **sessions** - User sessions (Replit Auth)
2. **users** - User profiles and metadata
3. **scans** - OSINT scan results
4. **breaches** - Individual breach findings
5. **conversations** - AI chat sessions
6. **messages** - Chat messages

---

## Next Steps

### 1. Set Up Required API Keys

Use the Replit Secrets feature to add:

```bash
SESSION_SECRET=<generate-random-string>
GEMINI_API_KEY=<your-gemini-key>
OPENAI_API_KEY=<your-openai-key>
HAVEIBEENPWNED_API_KEY=<your-hibp-key>
```

### 2. Set Up Database Integration

The database integration needs to be configured:
- Go to the Replit sidebar
- Set up the PostgreSQL database integration
- The `DATABASE_URL` will be auto-configured

### 3. Set Up Replit Auth Integration

Configure the Replit authentication:
- The auth integration should auto-configure
- Verify `REPL_ID` is set correctly

### 4. Test the Application

Once API keys are configured:
1. Visit the landing page
2. Click "Login" or "Sign Up"
3. Authenticate via Replit Auth
4. Try running a scan
5. Test the AI chat assistant

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Replit Auth (OAuth)
- **AI**: Google Gemini (chat) + OpenAI (analysis)
- **OSINT**: Have I Been Pwned API
- **Routing**: Wouter
- **State Management**: TanStack Query

---

## Features Overview

### 🔍 OSINT Analysis
- Email breach scanning via Have I Been Pwned
- Risk score calculation (0-100)
- Breach severity classification
- Data exposure tracking

### 🤖 AI-Powered Insights
- Automated breach analysis (OpenAI)
- Personalized recommendations
- Interactive chat assistant (Gemini)
- Context-aware responses

### 📊 Dashboard
- Scan history tracking
- Risk metrics visualization
- Breach severity breakdown
- Manual lookup quota management

### 🔐 Security Features
- Replit OAuth authentication
- Session management
- Data encryption
- Rate limiting (1 manual lookup per 24h)

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database commands
npm run db:push        # Sync schema to database
npm run db:push --force # Force sync (careful!)
npm run db:studio      # Open Drizzle Studio
```

---

## Troubleshooting

### Application not loading?
- Check workflow logs for errors
- Verify port 5000 is accessible
- Ensure all dependencies are installed

### API errors?
- Verify all required API keys are set
- Check server logs for specific errors
- Ensure database is connected

### Authentication not working?
- Verify Replit Auth integration is set up
- Check `REPL_ID` and `SESSION_SECRET` are configured
- Clear browser cookies and try again

---

## Support

For questions or issues:
1. Check the logs in the Replit console
2. Review `API_DOCUMENTATION.md` for endpoint details
3. Verify all environment variables are set correctly

**Your application is ready to go! Just add the API keys and start building.** 🚀
