export const TAGS = ['Inbox','Food','Travel','Tech','Fitness','Home','Style','Finance','Learning','Events','DIY','Beauty','Health','Parenting','Pets','Other'] as const;

const map: Record<string, (typeof TAGS)[number]> = {
  '#restaurant': 'Food', '#foodie': 'Food', 'menu': 'Food', 'recipe': 'Food',
  'flight': 'Travel', '#wanderlust': 'Travel', 'itinerary': 'Travel', 'hotel': 'Travel',
  'iphone': 'Tech', 'ai': 'Tech', 'coding': 'Tech',
  'workout': 'Fitness', 'gym': 'Fitness',
  'makeup': 'Beauty', 'skincare': 'Beauty',
  'budget': 'Finance', 'investing': 'Finance',
};

export function ruleTags(text: string): { tag: (typeof TAGS)[number], confidence: number }[] {
  const found = new Map<(typeof TAGS)[number], number>();
  const lower = text.toLowerCase();
  for (const [k, t] of Object.entries(map)) {
    if (lower.includes(k)) found.set(t, Math.min(1, (found.get(t) ?? 0) + 0.4));
  }
  if (!found.size) return [{ tag: 'Inbox', confidence: 0.3 }];
  return [...found.entries()].map(([tag, confidence]) => ({ tag, confidence }));
}


