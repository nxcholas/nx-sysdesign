export type ChangelogItemType = 'feat' | 'fix' | 'chore';

export type ChangelogItem = {
  type: ChangelogItemType;
  text: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  items: ChangelogItem[];
};

export const changelogEntries: ChangelogEntry[] = [
  {
    version: 'v1.0.0-stable',
    date: 'April 26, 2026',
    items: [
      { type: 'chore', text: 'General stability and polish pass' },
    ],
  },
  {
    version: 'v0.26.3',
    date: 'April 2026',
    items: [
      { type: 'chore', text: 'Rebranded product name and updated internal routing' },
    ],
  },
  {
    version: 'v0.26.2',
    date: 'April 2026',
    items: [
      { type: 'fix', text: 'Billing subscription state reliability improvements' },
      { type: 'fix', text: 'Checkout and payment flow stability fixes' },
    ],
  },
  {
    version: 'v0.26.1',
    date: 'April 2026',
    items: [
      { type: 'fix', text: 'API error handling improvements' },
    ],
  },
  {
    version: 'v0.26.0',
    date: 'March 2026',
    items: [
      { type: 'feat', text: 'Email verification and password recovery flow' },
      { type: 'feat', text: 'Authentication system hardening' },
    ],
  },
  {
    version: 'v0.25.0',
    date: 'March 2026',
    items: [
      { type: 'feat', text: 'Persistent sign-in sessions' },
    ],
  },
  {
    version: 'v0.24.0',
    date: 'March 2026',
    items: [
      { type: 'feat', text: 'Text block formatting controls' },
    ],
  },
  {
    version: 'v0.22.0',
    date: 'March 2026',
    items: [
      { type: 'feat', text: 'Connection label editing on the canvas' },
    ],
  },
  {
    version: 'v0.21.0',
    date: 'February 2026',
    items: [
      { type: 'fix', text: 'Canvas drag and component interaction stability' },
    ],
  },
  {
    version: 'v0.20.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'PNG export from the canvas' },
    ],
  },
  {
    version: 'v0.19.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'Data flow visualization toggle' },
    ],
  },
  {
    version: 'v0.18.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'Autosave indicator and session persistence improvements' },
    ],
  },
  {
    version: 'v0.17.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'Starter templates and diagram management' },
    ],
  },
  {
    version: 'v0.16.0 and earlier',
    date: 'January – February 2026',
    items: [
      { type: 'feat', text: 'Keyboard shortcuts overlay' },
      { type: 'feat', text: 'Mobile canvas guard' },
      { type: 'feat', text: 'SEO, sitemap, and custom 404' },
      { type: 'feat', text: 'Stripe billing and Pro tier' },
      { type: 'feat', text: 'User accounts and cloud diagram storage' },
      { type: 'feat', text: 'Copy, paste, and undo history' },
      { type: 'feat', text: 'Shape and text tools' },
      { type: 'feat', text: 'ER diagram and table support' },
      { type: 'feat', text: 'Core canvas, component system, and data flow' },
    ],
  },
];
