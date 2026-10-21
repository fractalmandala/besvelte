export function cx(...parts: Array<unknown>): string {
  return parts.filter(Boolean).join(" ")
}
