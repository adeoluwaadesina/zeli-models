/** e.g. "Dare Smith" -> "DARE S." */
export function portfolioDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.toUpperCase();
  const first = parts[0]!;
  const last = parts[parts.length - 1]!;
  const initial = last[0]?.toUpperCase() ?? "";
  return `${first.toUpperCase()} ${initial}.`;
}
