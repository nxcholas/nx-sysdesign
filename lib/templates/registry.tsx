import type { DiagramTemplate } from './index';
import { microservicesTemplate } from './microservices';
import { webAppTemplate } from './web-app';
import { eventDrivenTemplate } from './event-driven';
import { erDiagramTemplate } from './er-diagram';

const blankThumbnail = (
  <svg aria-hidden="true" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <rect width="200" height="120" fill="#0d1117" />
    <rect x="60" y="30" width="80" height="60" fill="none" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3" rx="4" />
    <text x="100" y="64" fill="#6b7280" fontSize="20" fontFamily="sans-serif" textAnchor="middle">+</text>
  </svg>
);

const blankTemplate: DiagramTemplate = {
  id: 'blank',
  name: 'Blank',
  description: 'Start with an empty canvas',
  thumbnail: blankThumbnail,
  components: [],
  connections: [],
  frames: [],
};

export const TEMPLATES: DiagramTemplate[] = [
  blankTemplate,
  microservicesTemplate,
  webAppTemplate,
  eventDrivenTemplate,
  erDiagramTemplate,
];
