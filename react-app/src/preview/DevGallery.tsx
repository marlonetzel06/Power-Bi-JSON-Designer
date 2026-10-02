import { useThemeStore } from '@/store/theme';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { MockVisual } from './MockVisual';
import { mockVisualSize } from './size';

/** Dev-only gallery of every mock visual at natural size (open with ?dev=gallery). */
export function DevGallery() {
  const theme = useThemeStore((s) => s.theme);
  const keys = [...VISUAL_KEYS, '*', 'page'];
  return (
    <div className="min-h-screen bg-canvas p-6 text-text-body">
      <h1 className="mb-4 font-display text-xl font-black uppercase text-text-primary">Mock-Galerie ({keys.length})</h1>
      <div className="flex flex-wrap gap-6">
        {keys.map((key) => {
          const size = mockVisualSize(key);
          return (
            <figure key={key} className="m-0 flex flex-col gap-1">
              <div style={{ width: size.width, height: size.height }} className="shadow-sm">
                <MockVisual theme={theme} visualKey={key} />
              </div>
              <figcaption className="font-mono text-xs text-text-muted">{key}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
