import { MousePointer2, Zap, Table2, Layers, type LucideIcon } from 'lucide-react';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const features: FeatureItem[] = [
  {
    icon: MousePointer2,
    title: 'Point, click, build',
    body: 'Pick from 100+ pieces — servers, queues, databases — and drop them wherever feels right.',
  },
  {
    icon: Zap,
    title: 'Traffic Visualized',
    body: 'Animated dots travel your connections so you can see how data flows through your design.',
  },
  {
    icon: Table2,
    title: 'Database diagrams that make sense',
    body: 'Map out your tables, relationships, and keys.',
  },
  {
    icon: Layers,
    title: 'Never lose your work',
    body: "Jump between diagrams, close the tab, come back later — everything's right where you left it.",
  },
];
