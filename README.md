# MentorLink - Academic Ecosystem Platform

MentorLink is a comprehensive academic platform that combines a notes marketplace, verified senior mentorship, and AI-enhanced study tools to help students excel in their studies.

## Features

- **Notes Marketplace**: Upload, preview, purchase, and download academic PDF notes
- **Verified Mentorship**: Connect with verified senior students for 1:1 tutoring sessions
- **AI Study Tools**: Generate flashcards, create quizzes, and chat with your PDFs
- **Analytics Dashboard**: Track your learning progress and identify weak areas
- **Secure Payments**: Integrated payment processing with Stripe
- **Video Calls**: Built-in video conferencing for mentoring sessions

## Project info

**URL**: https://lovable.dev/projects/6ca42f1d-4d94-4cd1-b8fd-a4b612b7c0b2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6ca42f1d-4d94-4cd1-b8fd-a4b612b7c0b2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Production Deployment

For production deployment, we provide comprehensive documentation and automated scripts:

### Quick Start

1. **Read the deployment guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Use the checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. **Set up environment variables**: Run the setup script
   ```bash
   # Windows
   .\scripts\setup-production-env.ps1
   
   # Linux/Mac
   chmod +x scripts/setup-production-env.sh
   ./scripts/setup-production-env.sh
   ```

### Documentation

- [Production Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete step-by-step instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Comprehensive checklist for deployment
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md) - Detailed variable documentation
- [Production Deployment Docs](./docs/PRODUCTION_DEPLOYMENT.md) - Architecture and maintenance guide

### Deployment Platforms

- **Frontend**: Vercel (recommended) or Netlify
- **Database**: Supabase (managed PostgreSQL)
- **AI Services**: Railway or Render
- **Storage**: Cloudflare R2 or AWS S3
- **Monitoring**: Sentry + Better Stack

## Monitoring & Logging

MentorLink includes comprehensive monitoring and logging:

### Services

- **Sentry**: Error tracking and performance monitoring
- **Better Stack**: Log aggregation and uptime monitoring
- **Vercel Analytics**: Frontend performance and Web Vitals

### Setup Monitoring

```bash
# Windows
.\scripts\setup-monitoring.ps1

# Linux/Mac
chmod +x scripts/setup-monitoring.sh
./scripts/setup-monitoring.sh
```

### Documentation

- [Monitoring Guide](./docs/MONITORING_AND_LOGGING.md) - Complete monitoring documentation
- [Setup Checklist](./docs/MONITORING_SETUP_CHECKLIST.md) - Step-by-step setup guide
- [Quick Reference](./docs/MONITORING_QUICK_REFERENCE.md) - Common tasks and troubleshooting

### Key Features

- Real-time error tracking with Sentry
- Structured logging to Better Stack
- Uptime monitoring for all services
- Performance metrics and Web Vitals
- Custom dashboards and alerts
- Session replay for debugging

### Quick Deploy to Vercel

Simply open [Lovable](https://lovable.dev/projects/6ca42f1d-4d94-4cd1-b8fd-a4b612b7c0b2) and click on Share -> Publish.

Or use the Vercel CLI:
```bash
npm install -g vercel
vercel --prod
```

## Custom Domain

To connect a custom domain:

1. Navigate to Project > Settings > Domains in Vercel
2. Click "Add Domain"
3. Follow the DNS configuration instructions
4. SSL certificate will be auto-provisioned

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Architecture

```
Frontend (React + Vite)
    ↓
Supabase (Database + Auth + Storage)
    ↓
AI Services (Python FastAPI)
    ↓
Vector Database (FAISS)
```

## Environment Setup

### Development
```bash
# Copy environment template
cp .env .env.local

# Install dependencies
npm install

# Start development server
npm run dev

# Start AI services (in separate terminal)
cd ai-services
poetry install
poetry run uvicorn app.main:app --reload
```

### Production
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete production setup instructions.
