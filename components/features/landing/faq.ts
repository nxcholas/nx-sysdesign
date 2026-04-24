export interface FaqEntry {
  q: string;
  a: string;
}

export const faq: FaqEntry[] = [
  {
    q: 'Do I need an account?',
    a: 'No — SysDesign is fully usable without signing in. Accounts arrive alongside Pro.',
  },
  {
    q: 'Where are my diagrams stored?',
    a: "In your browser's local storage. They stay on your device and persist between visits. When accounts launch, you will be able to sync them to your account.",
  },
  {
    q: 'Can I export my diagrams?',
    a: 'Export is not available yet. It is on the roadmap.',
  },
  {
    q: 'What does the animated dot on connections mean?',
    a: 'It represents data moving through your system — a live visual indicator of the path you have designed. It is purely illustrative and does not send or receive real traffic.',
  },
  {
    q: 'When does Pro launch?',
    a: 'Soon. Pro unlocks unlimited diagrams alongside everything already in the free tier.',
  },
];
