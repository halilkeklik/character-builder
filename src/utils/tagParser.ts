/**
 * Utility to parse and clean 5e.tools entry markup and tag notations.
 * Examples:
 * {@spell Fireball} -> Fireball
 * {@item Longsword|XPHB} -> Longsword
 * {@damage 1d6} -> 1d6
 * {@dc 15} -> DC 15
 * {@condition blinded} -> Blinded
 * {@b bold text} -> bold text
 * {@i italic text} -> italic text
 */

export function clean5eTag(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // {@dc 15} -> DC 15
    .replace(/\{@dc\s+([^}]+)\}/gi, 'DC $1')
    // {@dice 1d20+2} -> 1d20+2
    .replace(/\{@dice\s+([^}]+)\}/gi, '$1')
    // {@damage 1d6} -> 1d6
    .replace(/\{@damage\s+([^}]+)\}/gi, '$1')
    // {@hit 5} -> +5
    .replace(/\{@hit\s+([^}]+)\}/gi, '+$1')
    // {@spell name|...} -> name
    // {@item name|...} -> name
    // {@creature name|...} -> name
    // {@feat name|...} -> name
    // {@condition name} -> name
    .replace(/\{@(spell|item|creature|feat|condition|skill|action|sense|race|background|class|optfeature)\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$2')
    // {@b text} -> text
    .replace(/\{@b\s+([^}]+)\}/gi, '$1')
    // {@i text} -> text
    .replace(/\{@i\s+([^}]+)\}/gi, '$1')
    // {@note text} -> Note: text
    .replace(/\{@note\s+([^}]+)\}/gi, 'Note: $1')
    // Any remaining {@tag ...}
    .replace(/\{@\w+\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .trim();
}

/**
 * Extracts plain text from 5e.tools entries (which can be strings, objects, lists, etc.)
 */
export function extractEntriesText(entries: any[] | string | undefined): string {
  if (!entries) return '';
  if (typeof entries === 'string') return clean5eTag(entries);
  if (!Array.isArray(entries)) return '';

  const parts: string[] = [];

  for (const entry of entries) {
    if (typeof entry === 'string') {
      parts.push(clean5eTag(entry));
    } else if (typeof entry === 'object' && entry !== null) {
      if (entry.name && entry.entries) {
        parts.push(`${entry.name}: ${extractEntriesText(entry.entries)}`);
      } else if (entry.entries) {
        parts.push(extractEntriesText(entry.entries));
      } else if (entry.items) {
        const itemTexts = entry.items.map((it: any) => 
          typeof it === 'string' ? clean5eTag(it) : (it.name ? `${it.name} ${extractEntriesText(it.entries)}` : extractEntriesText(it.entries))
        );
        parts.push(itemTexts.join(', '));
      }
    }
  }

  return parts.join('\n\n');
}
