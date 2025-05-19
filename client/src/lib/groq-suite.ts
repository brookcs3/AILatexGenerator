import { API_ROUTES } from "./constants";
import { apiRequest } from "./queryClient";

export interface SummaryResponse {
  summary: string;
}

export interface OutlineResponse {
  outline: string;
}

export interface GlossaryResponse {
  glossary: string;
}

export interface FlashcardsResponse {
  flashcards: string;
}

export async function generateSummary(text: string): Promise<SummaryResponse> {
  const res = await apiRequest("POST", API_ROUTES.groq.summarize, { text });
  return res.json();
}

export async function generateOutline(text: string): Promise<OutlineResponse> {
  const res = await apiRequest("POST", API_ROUTES.groq.outline, { text });
  return res.json();
}

export async function generateGlossary(text: string): Promise<GlossaryResponse> {
  const res = await apiRequest("POST", API_ROUTES.groq.glossary, { text });
  return res.json();
}

export async function generateFlashcards(text: string): Promise<FlashcardsResponse> {
  const res = await apiRequest("POST", API_ROUTES.groq.flashcards, { text });
  return res.json();
}

