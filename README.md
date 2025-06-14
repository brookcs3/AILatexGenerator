# AI LaTeX Generator

A comprehensive web-based AI LaTeX Generator that simplifies document creation through advanced AI integrations and intelligent document generation tools.

## Key Features

- AI-powered LaTeX generation from simple text descriptions
- Multiple AI provider support (OpenAI, Anthropic, Groq)
- PDF preview and download
- User authentication and subscription tiers
- Collaborative editing functionality
- User-friendly tag system for non-LaTeX users
- Advanced text rewriting mode that makes content less detectable as AI-generated

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
   - `LATEX_DEBUG` set to `true` to enable verbose LaTeX compilation logs

   - `OPENAI_API_KEY` (Your OpenAI API key)
   - `ANTHROPIC_API_KEY` (Your Anthropic API key)
   - `GROQ_API_KEY` (Your Groq API key)
   - `VITE_STRIPE_PUBLIC_KEY` (Your Stripe publishable key for the client)
   - `STRIPE_SECRET_KEY` (Your Stripe secret key)
   - `STRIPE_WEBHOOK_SECRET` (Webhook secret used to verify Stripe events)
   - `POSTMARK_API_KEY` (Your Postmark API key for sending emails)
   - Any other API keys needed for service integrations
   - Stripe variables (see [Stripe Environment Variables](#stripe-environment-variables))
   - `DISABLE_USAGE_LIMITS` set to `true` to bypass usage checks (leave unset in production)

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
5. (Optional) Set `LATEX_DEBUG=true` in your `.env` to see detailed LaTeX compilation logs

## API Integration

The server exposes a `/api/latex/compile/webhook` endpoint so external tools can
request LaTeX compilation and receive the result via webhook. Send a POST request
with the LaTeX content and a `webhookUrl` where the compiled PDF should be
delivered.

```bash
curl -X POST https://your-server.com/api/latex/compile/webhook \
  -H 'Content-Type: application/json' \
  -d '{"latex":"\\documentclass{article}\\n\\begin{document}Hello!\\end{document}","webhookUrl":"https://example.com/hook"}'
```

Once compilation finishes the server POSTs a JSON payload to the provided URL:

```json
{ "success": true, "pdf": "base64string" }
```

### CI/CD Example

The repository includes a sample GitHub Actions workflow in
`.github/workflows/compile-latex.yml` demonstrating how to invoke the API from a
pipeline.

## Documentation

The project includes a growing set of guides under `content/blog` as well as two
new pages in the frontend:

- `/how-to` – A step‑by‑step introduction to generating documents.
- `/faq` – Answers to common questions from new users.
- `/community` – A simple forum for sharing tips and feedback.
- `/contact` – Get in touch about support or partnerships.

Feel free to add more Markdown posts in `content/blog` to expand the knowledge
base.

## Required Environment Variables

The following variables must be configured either in a `.env` file or in your
deployment platform. Refer to `.env.example` for sample values.

- `PORT` - Port for the server (default `5000`).
- `NODE_ENV` - Environment mode (`development` or `production`).
- `DATABASE_URL` - PostgreSQL connection string.
- `SESSION_SECRET` - Secret used to sign sessions.
- Session cookies use the `secure` flag when `NODE_ENV` is `production`, so HTTPS is required in that mode.
- `OPENAI_API_KEY` - OpenAI API key.
- `ANTHROPIC_API_KEY` - Anthropic API key.
- `GROQ_API_KEY` - Groq API key.
- `GUEST_MODE` - Set to `true` to allow anonymous access for testing.
- `DISABLE_USAGE_LIMITS` - Set to `true` to bypass subscription usage limits (defaults to `false`).
- `LATEX_DEBUG` - Set to `true` to enable verbose LaTeX compilation logs.

- `POSTMARK_API_KEY` - Postmark API key for sending emails.
- `STRIPE_SECRET_KEY` - Stripe secret key.
- `STRIPE_WEBHOOK_SECRET` - Secret to verify Stripe webhooks.
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key for the client.
- `STRIPE_PRICE_TIER1_ID` to `STRIPE_PRICE_TIER5_ID` - Price IDs for
  subscription tiers.
- `STRIPE_PRICE_REFILL_PACK_ID` - Price ID for refill packs.
- `DOMAIN` - Production domain used in email links.
- `SITE_DOMAIN` - Primary site domain used in robots.txt and metadata.
- `VITE_API_BASE_URL` - Base URL for the frontend API.
- `VITE_CLARITY_ID` - Microsoft Clarity project ID for heatmap tracking.
- `REPORT_EMAIL` - Address to receive automated analytics reports.

Guest mode should only be enabled when testing. For production deployments make
sure `GUEST_MODE=false`.

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
- `DISABLE_USAGE_LIMITS`
- `LATEX_DEBUG`

Refer to `.env.example` for default values and additional optional variables.

## Running Tests

To run the test suite locally, execute:

```bash
npm test
```

This uses Node's built-in test runner to execute all tests defined in the project.

## Collecting Baseline Performance Metrics

Run the Lighthouse script to capture scores for your main pages:

```bash
npm run metrics
```

Results are saved to `analytics/baseline.json` for later comparison.

## Optional Automated Content Microservices

Inside the `scripts` directory is a small trio of microservices that can keep the
site up to date automatically:

- **content-service.js** – generates new blog posts from trending topics and
  stores them under `content/blog/generated`.
- **analytics-service.js** – analyzes engagement logs in `analytics/logs.json`
  and produces a summarized report.
- **seo-service.js** – writes updated SEO metadata to `public/seo.json` based on
  the analytics report.
- **send-weekly-report.js** – emails `analytics/report.json` to the address from
  `REPORT_EMAIL`.

Run `npm run send:report` on a schedule (e.g., cron) to automatically deliver
weekly analytics summaries.

Start all three services together with:

```bash
node scripts/start-microservices.js
```

They communicate over HTTP on ports `5001`–`5003` and can be run alongside the
main server to keep your content and SEO data fresh.

## License

Released under the [MIT License](LICENSE).
