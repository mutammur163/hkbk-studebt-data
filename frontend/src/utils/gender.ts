/** Normalize DB gender values for analytics and filters. */
export function normalizeGender(raw: string | null | undefined): 'Male' | 'Female' | 'Other' {
  const v = (raw ?? '').toString().trim().toLowerCase();
  if (v === 'male' || v === 'm') return 'Male';
  if (v === 'female' || v === 'f') return 'Female';
  if (!v) return 'Other';
  return 'Other';
}
