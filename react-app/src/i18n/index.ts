import { useCallback } from 'react';
import { de, type Dictionary, type DictionaryKey } from './de';
import { en } from './en';
import { useUiStore, type Locale } from '@/store/uiStore';

const DICTIONARIES: Record<Locale, Dictionary> = { de, en };

export type TParams = Record<string, string | number>;

export function translate(locale: Locale, key: DictionaryKey, params?: TParams): string {
  const template = DICTIONARIES[locale][key] ?? DICTIONARIES.de[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => (params[name] !== undefined ? String(params[name]) : `{${name}}`));
}

/** Translate hook; `t('key', { count: 3 })`. */
export function useT() {
  const locale = useUiStore((s) => s.locale);
  return useCallback((key: DictionaryKey, params?: TParams) => translate(locale, key, params), [locale]);
}

export function useLocale(): Locale {
  return useUiStore((s) => s.locale);
}

export type { DictionaryKey };
