import { VISUAL_CATEGORIES } from '../constants/visualNames';
import {
  BarChart3, LineChart, PieChart, Map, Hash, Table2,
  SlidersHorizontal, Brain, MousePointer, Pencil, Settings, FileText, ScatterChart
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Bar Charts': BarChart3,
  'Column Charts': BarChart3,
  'Line & Area': LineChart,
  'Combo Charts': LineChart,
  'Other Cartesian': ScatterChart,
  'Pie / Donut / Tree': PieChart,
  'Maps': Map,
  'Cards & KPI': Hash,
  'Tables': Table2,
  'Slicers': SlidersHorizontal,
  'AI / Analytics': Brain,
  'Navigation & Buttons': MousePointer,
  'Static Elements': Pencil,
};

export function getVisualIcon(visualKey) {
  if (visualKey === '*') return Settings;
  if (visualKey === '__page__') return FileText;
  for (const [category, keys] of Object.entries(VISUAL_CATEGORIES)) {
    if (keys.includes(visualKey)) return CATEGORY_ICONS[category] || BarChart3;
  }
  return BarChart3;
}
