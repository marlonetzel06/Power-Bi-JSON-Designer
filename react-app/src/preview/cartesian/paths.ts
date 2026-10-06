/** Line path builders for Power BI line types: linear, stepped (before/center/after), smooth (monotone/cardinal). */
export type Point = [number, number];

export function linearPath(points: Point[]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
}

export function stepPath(points: Point[], step: 'before' | 'center' | 'after'): string {
  if (points.length === 0) return '';
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0] = points[i - 1]!;
    const [x1, y1] = points[i]!;
    if (step === 'before') d += ` V${y1} H${x1}`;
    else if (step === 'after') d += ` H${x1} V${y1}`;
    else d += ` H${(x0 + x1) / 2} V${y1} H${x1}`;
  }
  return d;
}

/** Fritsch–Carlson monotone cubic interpolation (d3 "monotoneX"). */
export function monotonePath(points: Point[]): string {
  const n = points.length;
  if (n < 2) return linearPath(points);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(xs[i + 1]! - xs[i]!);
    dy.push(ys[i + 1]! - ys[i]!);
    m.push(dx[i]! === 0 ? 0 : dy[i]! / dx[i]!);
  }
  const t: number[] = [m[0]!];
  for (let i = 1; i < n - 1; i++) {
    const a = m[i - 1]!;
    const b = m[i]!;
    t.push(a * b <= 0 ? 0 : (a + b) / 2);
  }
  t.push(m[n - 2]!);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i]! / m[i]!;
    const b = t[i + 1]! / m[i]!;
    const h = Math.hypot(a, b);
    if (h > 3) {
      t[i] = (3 * a) / h * m[i]!;
      t[i + 1] = (3 * b) / h * m[i]!;
    }
  }
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i]! / 3;
    d += ` C${xs[i]! + h},${ys[i]! + t[i]! * h} ${xs[i + 1]! - h},${ys[i + 1]! - t[i + 1]! * h} ${xs[i + 1]},${ys[i + 1]}`;
  }
  return d;
}

/** Cardinal spline; `tension` 0 = loose (very smooth), 1 = straight segments. */
export function cardinalPath(points: Point[], tension: number): string {
  const n = points.length;
  if (n < 3) return linearPath(points);
  const k = (1 - Math.max(0, Math.min(1, tension))) / 6;
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(n - 1, i + 2)]!;
    const c1: Point = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export interface LineShape {
  /** lineStyles.lineChartType */
  type: string;
  /** lineStyles.interpolationSmooth: monotoneX | cardinal */
  smooth: string;
  /** lineStyles.interpolationSmoothParam 0–100: the schema's "Tension" (100 = taut, straight segments) */
  smoothParam: number;
  /** lineStyles.interpolationStep: before | center | after */
  step: string;
}

export function linePath(points: Point[], shape: LineShape): string {
  if (shape.type === 'smooth') return shape.smooth === 'cardinal' ? cardinalPath(points, shape.smoothParam / 100) : monotonePath(points);
  if (shape.type === 'step') return stepPath(points, shape.step === 'before' ? 'before' : shape.step === 'after' ? 'after' : 'center');
  return linearPath(points);
}

/** Closed band between an upper and a lower polyline, both drawn with the series' line shape. */
export function bandPath(upper: Point[], lower: Point[], shape: LineShape): string {
  if (upper.length === 0) return '';
  return `${linePath(upper, shape)} ${linePath([...lower].reverse(), shape).replace(/^M/, 'L')} Z`;
}
