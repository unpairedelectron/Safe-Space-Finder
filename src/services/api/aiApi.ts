// AI integration client wrapper
// Assumes backend exposes secured endpoints that proxy OpenAI (never expose raw API key in app)
// Endpoints expected:
// POST /ai/summarize  { reviews: string[] } -> { summary: string }
// POST /ai/suggest-tags { comment: string } -> { tags: string[] }

import { httpClient } from './httpClient';

export async function summarizeReviews(reviews: string[]): Promise<string> {
  if (!reviews || reviews.length === 0) return '';
  // De-duplicate & trim to reasonable batch size (backend will sanitize again)
  const unique = Array.from(new Set(reviews.map(r => r.trim()).filter(Boolean))).slice(0, 12);
  if (unique.length < 2) return '';
  const resp = await httpClient.post<{ summary: string }>('/ai/summarize', { reviews: unique });
  return resp.summary?.trim() || '';
}

export async function suggestTagsFromComment(comment: string): Promise<string[]> {
  const clean = comment.trim();
  if (clean.length < 24) return [];
  const resp = await httpClient.post<{ tags: string[] }>('/ai/suggest-tags', { comment: clean });
  return Array.isArray(resp.tags) ? resp.tags.slice(0, 8) : [];
}
