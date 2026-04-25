import type { ReactNode } from 'react';
import type { PlacedComponent, Connection, Frame } from '@/lib/types';

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: ReactNode;
  components: PlacedComponent[];
  connections: Connection[];
  frames: Frame[];
}

export { TEMPLATES } from './registry';
