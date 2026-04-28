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
    version: 'v1.0.5',
    date: 'April 27, 2026',
    items: [
      { type: 'feat', text: 'Connection label improvements' },
      { type: 'fix', text: 'Diagram data persistence improvements' },
    ],
  },
  {
    version: 'v1.0.4',
    date: 'April 27, 2026',
    items: [
      { type: 'chore', text: 'Component visual consistency improvements' },
    ],
  },
  {
    version: 'v1.0.3',
    date: 'April 26, 2026',
    items: [
      { type: 'chore', text: 'Analytics and usage tracking improvements' },
    ],
  },
  {
    version: 'v1.0.2',
    date: 'April 26, 2026',
    items: [
      { type: 'chore', text: 'General copy and messaging updates' },
    ],
  },
  {
    version: 'v1.0.1',
    date: 'April 26, 2026',
    items: [
      { type: 'fix', text: 'Authentication flow improvements' },
      { type: 'fix', text: 'Sign-in experience improvements' },
    ],
  },
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
      { type: 'chore', text: 'General branding and navigation updates' },
    ],
  },
  {
    version: 'v0.26.2',
    date: 'April 2026',
    items: [
      { type: 'fix', text: 'API reliability improvements' },
      { type: 'fix', text: 'User flow stability fixes' },
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
      { type: 'feat', text: 'Account security improvements' },
      { type: 'feat', text: 'Platform security hardening' },
    ],
  },
  {
    version: 'v0.25.0',
    date: 'March 2026',
    items: [
      { type: 'feat', text: 'Session management improvements' },
    ],
  },
  {
    version: 'v0.24.0',
    date: 'March 2026',
    items: [
      { type: 'feat', text: 'Editor formatting improvements' },
    ],
  },
  {
    version: 'v0.22.0',
    date: 'March 2026',
    items: [
      { type: 'feat', text: 'Canvas editing improvements' },
    ],
  },
  {
    version: 'v0.21.0',
    date: 'February 2026',
    items: [
      { type: 'fix', text: 'Interaction stability improvements' },
    ],
  },
  {
    version: 'v0.20.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'Export functionality' },
    ],
  },
  {
    version: 'v0.19.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'New canvas controls' },
    ],
  },
  {
    version: 'v0.18.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'Background sync improvements' },
    ],
  },
  {
    version: 'v0.17.0',
    date: 'February 2026',
    items: [
      { type: 'feat', text: 'New workspace features' },
    ],
  },
  {
    version: 'v0.16.0 and earlier',
    date: 'January – February 2026',
    items: [
      { type: 'feat', text: 'Keyboard accessibility improvements' },
      { type: 'feat', text: 'Mobile experience improvements' },
      { type: 'feat', text: 'Discoverability and platform improvements' },
      { type: 'feat', text: 'Billing and subscription features' },
      { type: 'feat', text: 'Account and cloud storage support' },
      { type: 'feat', text: 'Editing workflow improvements' },
      { type: 'feat', text: 'New canvas tools' },
      { type: 'feat', text: 'New diagram types' },
      { type: 'feat', text: 'Initial release foundations' },
    ],
  },
];
