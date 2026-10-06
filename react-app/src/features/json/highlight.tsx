import { Fragment, type ReactNode } from 'react';

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b/g;

/** Minimal JSON syntax highlighting with token colours (no external lib). */
export function highlightJson(json: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of json.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(json.slice(last, idx));
    if (m[1] !== undefined) {
      if (m[2]) out.push(<Fragment key={i++}><span className="text-json-key">{m[1]}</span>{m[2]}</Fragment>);
      else out.push(<span key={i++} className="text-json-string">{m[1]}</span>);
    } else if (m[3] !== undefined) out.push(<span key={i++} className="text-json-number">{m[3]}</span>);
    else if (m[4] !== undefined) out.push(<span key={i++} className="text-json-boolean">{m[4]}</span>);
    else if (m[5] !== undefined) out.push(<span key={i++} className="text-json-null">{m[5]}</span>);
    last = idx + m[0].length;
  }
  if (last < json.length) out.push(json.slice(last));
  return out;
}
