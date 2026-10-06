import type { DictionaryKey } from '@/i18n';
import type { ValidationIssue } from '@/pbi/validate';

/** Translate a validation issue via its code; falls back to the English message. */
export function issueText(t: (k: DictionaryKey, p?: Record<string, string | number>) => string, issue: ValidationIssue): string {
  const key = `validation.${issue.code}` as DictionaryKey;
  const text = t(key, (issue.params ?? {}) as Record<string, string | number>);
  return text === key ? issue.message : text;
}
