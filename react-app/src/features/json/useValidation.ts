import { useEffect, useState } from 'react';
import type { ReportTheme } from '@/pbi/types';
import { validateTheme, type ValidationResult } from '@/pbi/validate';

/** Debounced schema + semantic validation of the export theme. */
export function useValidation(theme: ReportTheme, delay = 350): { result: ValidationResult | null; pending: boolean } {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validatedFor, setValidatedFor] = useState<ReportTheme | null>(null);
  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      void validateTheme(theme).then((r) => {
        if (cancelled) return;
        setResult(r);
        setValidatedFor(theme);
      });
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [theme, delay]);
  return { result, pending: validatedFor !== theme };
}
