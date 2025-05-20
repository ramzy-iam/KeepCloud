export type NameFormatStyle = 'initials' | 'short' | 'full';

export class NameFormatterHelper {
  static format(
    name: string | (string | null | undefined)[] | null | undefined,
    style: NameFormatStyle = 'short'
  ): string {
    if (!name) return '';

    const parts = Array.isArray(name)
      ? name.filter(Boolean)
      : name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return '';

    switch (style) {
      case 'initials':
        return parts.map((p) => (p ? p[0]?.toUpperCase() : '')).join('');

      case 'short':
        if (parts.length === 1) return parts[0] || '';
        return (
          parts[0] +
          ' ' +
          parts
            .slice(1)
            .map((p) => (p ? p[0]?.toUpperCase() + '.' : ''))
            .join(' ')
        );

      case 'full':
      default:
        return parts.join(' ');
    }
  }
}
