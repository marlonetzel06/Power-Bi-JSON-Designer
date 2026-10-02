/** LEGACY SHIM over src/pbi/builder.ts — deleted in Phase 4. */
import { buildExportTheme as build, buildDeltaTheme as delta } from '../pbi/builder';

export function buildExportTheme(theme) {
  return build(theme);
}

export function buildDeltaTheme(theme, initial) {
  return delta(theme, initial);
}

export function syntaxHL(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (m) => {
        let cls = 'json-num';
        if (/^"/.test(m)) cls = /:$/.test(m) ? 'json-key' : 'json-str';
        else if (/true|false/.test(m)) cls = 'json-bool';
        else if (/null/.test(m)) cls = 'json-null';
        return `<span class="${cls}">${m}</span>`;
      }
    );
}
