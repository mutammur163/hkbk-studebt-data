const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export type ReportAnalyticsPayload = {
  total: number;
  filters: { branch: string; quota: string; category: string; gender: string };
  gender: { male: number; female: number; other: number; malePct: number; femalePct: number };
  topBranches: { name: string; count: number }[];
  topCategories: { name: string; count: number }[];
  topQuotas: { name: string; count: number }[];
};

export async function fetchGroqInsights(analytics: ReportAnalyticsPayload): Promise<string> {
  const key = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!key) throw new Error('Missing VITE_GROQ_API_KEY');

  const body = {
    model: 'llama3-70b-8192',
    temperature: 0.35,
    max_tokens: 900,
    messages: [
      {
        role: 'system' as const,
        content:
          'You are an admissions analytics assistant. Respond with clear markdown bullet points. ' +
          'Do not invent numbers beyond the JSON summary. Focus on branch, gender balance, quota, and category patterns.',
      },
      {
        role: 'user' as const,
        content:
          'Here is aggregated (non-PII) report analytics as JSON. Give concise insights and trends.\n\n' +
          JSON.stringify(analytics),
      },
    ],
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Groq API error (${res.status})`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from Groq');
  return text;
}
