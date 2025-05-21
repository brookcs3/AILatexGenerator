import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "prismjs";
import "prismjs/components/prism-latex";
import "prismjs/themes/prism-tomorrow.css";
import { initScrollDepthTracking } from "./lib/scrollTracker";
import initClarity from "./lib/initClarity";

initScrollDepthTracking();
if (import.meta.env.VITE_CLARITY_ID) {
  initClarity(import.meta.env.VITE_CLARITY_ID);
}

initScrollDepthTracking();
createRoot(document.getElementById("root")!).render(<App />);
