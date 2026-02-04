/**
 * Shared contact number for WhatsApp link and footer.
 * Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local and Vercel (E164 without +, e.g. 2348012345678).
 */
const RAW =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
const E164 = RAW || "12125550199"; // fallback placeholder

/** E164 number without +, for wa.me and tel: links */
export const whatsappNumberE164 = E164.replace(/\D/g, "");

/** Display format for footer (e.g. +234 801 234 5678) */
export function phoneDisplay(): string {
  const digits = whatsappNumberE164.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 13 && digits.startsWith("234")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  if (digits.length >= 10) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return `+${digits}`;
}
