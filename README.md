# AI LaTeX Generator

Experimental web app for turning plain text into LaTeX documents. The project mixes a React/TypeScript frontend with an Express backend that talks to several AI providers. It can compile the resulting LaTeX to PDF using [Tectonic](https://tectonic-typesetting.github.io/) and falls back to an HTML preview when compilation fails.

## Quick start
1. Install Node 20+ and PostgreSQL.
2. `npm install` *(requires internet)*
3. Copy `.env.example` to `.env` and fill in your API keys.
4. `npm run db:push` to create tables.
5. `npm run dev` to start the server and frontend.

## Project layout
- `server/` – Express app and services
- `client/` – React frontend
- `shared/` – Database schema and validation helpers
- `scripts/` – Automation and microservices

### Running tests
`npm test` uses Node’s built‑in runner. Tests require the dependencies from `npm install` and skip if tools like Stripe or Tectonic are unavailable.

## Notable code
The LaTeX compiler includes a clever fallback. When Tectonic isn’t available or fails, it generates a lightweight HTML preview so users still see the result:
  // Check if Tectonic is available in this environment
  const tectonicAvailable = await isTectonicAvailable();
  
  // If we're in Railway deployment and Tectonic isn't available, use fallback mechanism
  if (isRailwayDeployment && !tectonicAvailable) {
    debugLog('\[LATEX DEBUG\] Running in Railway environment with Tectonic unavailable, using fallback');
    
    // Try backup PDF creation method first
    const backupPdf = await createTectonicBackupPDF(latexContent);
    
    if (backupPdf) {
      debugLog('\[LATEX DEBUG\] Successfully created PDF using backup method');
      return {
        success: true,
        pdf: backupPdf
      };
    }
    
    // If backup PDF creation fails, generate HTML preview
    debugLog('\[LATEX DEBUG\] Backup PDF creation failed, generating HTML preview');
    const htmlPreview = await generateHTMLPreview(latexContent);
    
    return {
      success: true,
      pdf: htmlPreview,
      isHtml: true
    };
  }
  
  // Create temporary directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'latex-'));
```
See more in `server/utils/tectonic.ts`.

## Architecture
More notes and a simple diagram live in [`docs/architecture.md`](docs/architecture.md).
