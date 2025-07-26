# Architecture

```mermaid
graph TD
  subgraph Client
    React
  end
  subgraph Server
    Express
    DB[(PostgreSQL)]
    AI["AI Providers"]
    Tectonic
  end
  React --> Express
  Express --> DB
  Express --> AI
  Express --> Tectonic
  Tectonic --> PDF
```

The server exposes REST endpoints from `server/routes.ts`. Requests can trigger AI-generated LaTeX via various providers and compile it to PDF using Tectonic. If PDF compilation fails, an HTML preview is returned so the user still receives immediate feedback.

