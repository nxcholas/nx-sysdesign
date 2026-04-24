import { MousePointer2, Zap, Table2, Layers, type LucideIcon } from 'lucide-react';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const features: FeatureItem[] = [
  {
    icon: MousePointer2,
    title: 'Drag & drop canvas',
    body: 'Place any of 100+ components on an infinite grid and connect them in seconds.',
  },
  {
    icon: Zap,
    title: 'Animated data flow',
    body: 'Every connection shows a live moving bubble so you can see how requests travel through your system.',
  },
  {
    icon: Table2,
    title: 'ERD with cardinality',
    body: 'Model databases with tables, primary keys, foreign keys, and one-to-many relationship markers.',
  },
  {
    icon: Layers,
    title: 'Tabs and auto-save',
    body: 'Keep multiple diagrams open at once. Everything saves automatically in your browser.',
  },
];
