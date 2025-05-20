import { NameFormatterHelper } from '../name-formatter.helper';

describe('NameFormatterHelper', () => {
  it('should return an empty string for null or undefined names', () => {
    expect(NameFormatterHelper.format(null)).toBe('');
    expect(NameFormatterHelper.format(undefined)).toBe('');
    expect(NameFormatterHelper.format('')).toBe('');
  });

  it('should format the name in full format', () => {
    const name = 'John Doe';
    expect(NameFormatterHelper.format(name, 'full')).toBe('John Doe');
  });

  it('should format the name in initials format', () => {
    const name = 'John Doe';
    expect(NameFormatterHelper.format(name, 'initials')).toBe('JD');
  });

  it('should format the name in short format', () => {
    const name = 'John Doe';
    expect(NameFormatterHelper.format(name, 'short')).toBe('John D.');
  });

  it('should return empty string for an empty name array', () => {
    const name = [''];
    expect(NameFormatterHelper.format(name, 'full')).toBe('');
  });

  it('should handle arrays with null or undefined values', () => {
    const name = ['John', null, 'Doe'];
    expect(NameFormatterHelper.format(name, 'initials')).toBe('JD');
  });

  it('should handle arrays with empty strings', () => {
    const name = ['John', '', 'Doe'];
    expect(NameFormatterHelper.format(name, 'short')).toBe('John D.');
  });

  it('should handle mixed name formats', () => {
    const name = ['John', undefined, 'Doe'];
    expect(NameFormatterHelper.format(name, 'full')).toBe('John Doe');
  });

  it('should handle case where only one name part exists', () => {
    const name = 'John';
    expect(NameFormatterHelper.format(name, 'initials')).toBe('J');
    expect(NameFormatterHelper.format(name, 'short')).toBe('John');
    expect(NameFormatterHelper.format(name, 'full')).toBe('John');
  });
});
