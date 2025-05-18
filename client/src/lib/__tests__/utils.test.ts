import { getReadableFilename, getUsageColor } from '../utils';

describe('getReadableFilename', () => {
  it('converts title to PascalCase', () => {
    const result = getReadableFilename('My test document!');
    expect(result).toBe('MyTestDocument');
  });

  it('falls back to default when title is empty', () => {
    const result = getReadableFilename('   ');
    expect(result).toBe('GeneratedDocument');
  });
});

describe('getUsageColor', () => {
  it('returns red when usage >= 90%', () => {
    expect(getUsageColor(95, 100)).toBe('text-red-600');
  });

  it('returns amber when usage >= 70%', () => {
    expect(getUsageColor(75, 100)).toBe('text-amber-600');
  });

  it('returns emerald for lower usage', () => {
    expect(getUsageColor(30, 100)).toBe('text-emerald-600');
  });
});
