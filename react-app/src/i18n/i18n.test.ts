import { describe, expect, it } from 'vitest';
import { de } from './de';
import { en } from './en';
import { translate } from './index';

describe('i18n', () => {
  it('has no empty strings in either language', () => {
    for (const [k, v] of Object.entries(de)) expect(v.trim(), `de.${k}`).not.toBe('');
    for (const [k, v] of Object.entries(en)) expect(v.trim(), `en.${k}`).not.toBe('');
  });
  it('interpolates parameters', () => {
    expect(translate('de', 'format.modifiedCards', { count: 3 })).toBe('3 geänderte Karten');
    expect(translate('en', 'json.errors', { count: 2 })).toBe('2 errors');
  });
});
