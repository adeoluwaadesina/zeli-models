/** Digits only, typical E.164 national number length without country code ambiguity. */
export const PHONE_DIGITS_MIN = 10;
export const PHONE_DIGITS_MAX = 15;

/** Max length for phone inputs (digit count). */
export const PHONE_INPUT_MAX_LEN = PHONE_DIGITS_MAX;

export function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export function isValidPhoneDigits(s: string): boolean {
  const d = digitsOnly(s);
  return d.length >= PHONE_DIGITS_MIN && d.length <= PHONE_DIGITS_MAX;
}

export function countWords(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export const CONTACT_MESSAGE_MAX_WORDS = 250;

export function isWithinWordLimit(s: string, maxWords: number): boolean {
  return countWords(s) <= maxWords;
}
