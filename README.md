🛡️ DarkTrack — AI-Powered Cybersecurity Dashboard

“Know your exposure. Secure it fast.”
Built for Vibeathon 2025 — Replit × Polaris International Hackathon

💡 Overview

DarkTrack is an AI-powered cybersecurity platform that helps users understand how exposed their online data is.
It scans your email using the HaveIBeenPwned API, detects data breaches, and uses AI (OpenAI + Gemini) to analyze risks, explain vulnerabilities, and guide you in securing your accounts — all inside a clean, privacy-focused dashboard.

⚙️ Key Features

🧠 AI Risk Analysis (OpenAI) — analyzes breach data and provides personalized recommendations.

🤖 AI Chat Assistant (Gemini) — a friendly chatbot that explains issues and helps fix them step-by-step.

📊 Dashboard Insights — displays vulnerabilities, breach history, and daily AI safety tips.

🧩 Simple Auth System — quick login/signup using email + password (no verification).

🔐 Data Security — encrypted data storage and hashed passwords.

🕵️ OSINT Scan — checks email breaches across the web using the HaveIBeenPwned API.

⚡ One-Click Fix Flow — each vulnerability card has a “Solve” button that opens the AI chat to guide users in fixing that issue.

🧱 Tech Stack Used

Frontend: React, Vite, TailwindCSS
Backend: Node.js, Express.js
AI: Google Gemini (Chat), OpenAI (Risk Analysis)
Database: PostgreSQL (via Drizzle ORM)
APIs: HaveIBeenPwned API, OpenAI API, Gemini API
Security: AES Encryption, bcrypt
Hosting: Replit Cloud Deployment

🚀 How It Works

User signs up or logs in using email and password.

Runs a scan → DarkTrack fetches data from HaveIBeenPwned API.

OpenAI analyzes the data and generates a risk summary + recommendations.

Gemini chatbot interacts with the user and provides step-by-step help.

Vulnerabilities remain securely stored in the database until resolved.

🔐 Simplified Authentication (Hackathon Optimization)

To focus on core functionality and AI integration, OTP and email verification were removed for the MVP.
Users can sign up directly with an email and password.
Passwords are hashed, and all sensitive information is encrypted before storage.

🧠 AI Flow

Risk Analysis: OpenAI (GPT models) — evaluates breach data and assigns a risk category.
Chatbot: Google Gemini — acts as a friendly cybersecurity assistant with natural conversation.

🌐 Live Demo

🔗 Access the app here → https://darktrack.replit.app/

🧾 Vulnerable Test Accounts (for demo)

ahmed.khan@gmail.com

sana123@yahoo.com

mohammed.waris+signup@gmail.com

danish.hussain@outlook.com

Example flow:

Runs a scan → finds LinkedIn and Dropbox breaches.

OpenAI assigns “High Risk” and suggests changing passwords + enabling 2FA.

Gemini chatbot walks the user through fixing each account.

User returns later — vulnerabilities remain saved until marked solved.

🏆 Hackathon

Replit × Polaris — Vibeathon 2025
A hackathon for building the future with AI.

👨‍💻 Teama

Danish Hussain — Full Stack Developer & Project Lead

Mohammed Faizan — AI & API Integration

Mohammed Ali Waris — Frontend & Design

🔗 Project Replit Link: https://replit.com/t/polaris/repls/DarkTrackOSINT
🔗 Project Github Link: https://github.com/Danish4h-135/DarkTrackOSINT
