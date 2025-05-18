// Type definitions for particles.js
// Project: https://github.com/VincentGarreau/particles.js
// Definitions by: AI LaTeX Generator

interface ParticlesJS {
  (id: string, config: object): void;
  load(id: string, pathConfig: string, callback: () => void): void;
}

interface Window {
  particlesJS: ParticlesJS;
}
