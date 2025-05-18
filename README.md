# AI LaTeX Generator

A comprehensive web-based AI LaTeX Generator that simplifies document creation through advanced AI integrations and intelligent document generation tools.

## Key Features

- AI-powered LaTeX generation from simple text descriptions
- Multiple AI provider support (OpenAI, Anthropic, Groq)
- PDF preview and download
- User authentication and subscription tiers
- Collaborative editing functionality
- User-friendly tag system for non-LaTeX users

## Tech Stack

- React.js frontend with TypeScript
- Express.js backend
- PostgreSQL database with Drizzle ORM
- PDF.js for document rendering
- Multi-AI provider integration
- Tectonic for LaTeX compilation

## Railway Deployment Instructions

### Prerequisites

1. GitHub account (for Railway login)
2. Railway account
3. API keys for AI providers (OpenAI, Anthropic, Groq)

### Steps to Deploy

1. **Sign up for Railway**
   - Go to [Railway.app](https://railway.app/)
   - Sign up with GitHub

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository

3. **Set Up PostgreSQL Database**
   - In your project, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Wait for the database to be provisioned

4. **Set Environment Variables**
   
   Click on your web service, go to "Variables" tab, and add:
   
   - `DATABASE_URL` (Copy this from the PostgreSQL service's "Connect" tab)
   - `SESSION_SECRET` (A random string for securing sessions)
   - `DEBUG_SESSIONS` set to `true` to log session data for debugging

   - `OPENAI_API_KEY` (Your OpenAI API key)
   - `ANTHROPIC_API_KEY` (Your Anthropic API key)
   - `GROQ_API_KEY` (Your Groq API key)
   - `VITE_STRIPE_PUBLIC_KEY` (Your Stripe publishable key for the client)
   - `STRIPE_SECRET_KEY` (Your Stripe secret key)
   - `STRIPE_WEBHOOK_SECRET` (Webhook secret used to verify Stripe events)
   - `POSTMARK_API_KEY` (Your Postmark API key for sending emails)
   - Any other API keys needed for service integrations
   - Stripe variables (see [Stripe Environment Variables](#stripe-environment-variables))

5. **Deploy**
   - Railway will automatically deploy your application
   - After deployment, click on "Generate Domain" to get a public URL

6. **Run Database Migrations**
   - Go to your project settings
   - Add a one-time job with the command: `npm run db:push`
   - This will set up your database schema

## Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables (see `.env.example`)
   including the Stripe keys (`VITE_STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`) and the `POSTMARK_API_KEY` used for email.
4. Run the application: `npm run dev`

## Required Environment Variables

The following variables must be configured either in a `.env` file or in your
deployment platform. Refer to `.env.example` for sample values.

- `PORT` - Port for the server (default `5000`).
- `NODE_ENV` - Environment mode (`development` or `production`).
- `DATABASE_URL` - PostgreSQL connection string.
- `SESSION_SECRET` - Secret used to sign sessions.
- `OPENAI_API_KEY` - OpenAI API key.
- `ANTHROPIC_API_KEY` - Anthropic API key.
- `GROQ_API_KEY` - Groq API key.
- `POSTMARK_API_KEY` - Postmark API key for sending emails.
- `STRIPE_SECRET_KEY` - Stripe secret key.
- `STRIPE_WEBHOOK_SECRET` - Secret to verify Stripe webhooks.
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key for the client.
- `STRIPE_PRICE_TIER1_ID` to `STRIPE_PRICE_TIER5_ID` - Price IDs for
  subscription tiers.
- `STRIPE_PRICE_REFILL_PACK_ID` - Price ID for refill packs.
- `DOMAIN` - Production domain used in email links.
- `VITE_API_BASE_URL` - Base URL for the frontend API.

## Stripe Environment Variables


Below is a list of important environment variables used throughout the project.
Make sure to define these in your `.env` file or in your deployment platform's
configuration:

- `DATABASE_URL`
- `SESSION_SECRET`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `POSTMARK_API_KEY`

Refer to `.env.example` for default values and additional optional variables.

## License

[MIT License](LICENSE)
