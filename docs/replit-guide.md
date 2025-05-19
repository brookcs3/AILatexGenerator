# Replit Hosting Guide

This short guide covers running the AI LaTeX Generator on [Replit](https://replit.com/). The repository already contains a `.replit` configuration that sets up Node.js, Postgres and necessary tools via Nix.

## Steps

1. **Fork or Import** – Create a new Repl based on this repository. Replit will detect the `.replit` file and automatically configure the environment.
2. **Add Environment Variables** – Open the "Secrets" tab and define the variables listed in [`.env.example`](../.env.example). At a minimum you will need:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `JWT_SECRET`
   - API keys for AI providers (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`)
   - Stripe keys (`VITE_STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
3. **Run the Project** – Click the **Run** button. Replit executes `npm run dev`, which starts the Express server and Vite in development mode. The webview will show the app on port 5000.
4. **Persistent Storage** – The included Postgres module starts an ephemeral database. For production use, connect to an external Postgres service and update `DATABASE_URL` accordingly.

With these settings you can prototype the application entirely within Replit's free tier.
