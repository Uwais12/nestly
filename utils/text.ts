import he from 'he';

export function decodeEntities(input?: string): string {
  if (!input) return '';
  const decoded = he.decode(input);
  return decoded.replace(/\s+/g, ' ').trim();
}

export function extractHashtags(text?: string): string[] {
  if (!text) return [];
  const matches = text.match(/#[\p{L}0-9_]+/gu) ?? [];
  return [...new Set(matches)].slice(0, 10);
}
