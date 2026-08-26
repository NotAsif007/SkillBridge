/**
 * Sanitizes user input for safe usage inside MongoDB RegExp queries.
 * Prevents ReDoS and regex metacharacter injection.
 */
export function escapeRegex(string) {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}