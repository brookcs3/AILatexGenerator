import { API_ROUTES } from "./constants";
import { apiRequest } from "./queryClient";

export interface RewriteResponse {
  text: string;
}

export async function rewriteText(content: string): Promise<RewriteResponse> {
  const res = await apiRequest("POST", API_ROUTES.undetectable.rewrite, { text: content });
  return res.json();
}
