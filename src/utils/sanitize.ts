export function sanitizeInput(value: string): string {
  // Basic sanitization; backend should still validate.
  return value.replace(/[<>`]/g, '').trim();
}
