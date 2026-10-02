import type { ReactNode } from 'react';
import type { Resolver } from './resolver';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Props every visual body renderer receives (inside the VisualFrame content area). */
export interface BodyProps {
  r: Resolver;
  rect: Rect;
  /** Unique id prefix for SVG defs. */
  uid: string;
}

export type BodyRenderer = (props: BodyProps) => ReactNode;
