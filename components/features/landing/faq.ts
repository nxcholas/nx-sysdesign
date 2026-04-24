export interface FaqEntry {
  q: string;
  a: string;
}

export const faq: FaqEntry[] = [
  {
    q: 'Do I need an account to use SysDesign?',
    a: 'Yes — an account is required to create and save diagrams. You can sign up for free in seconds and start building right away.',
  },
  {
    q: 'Where are my diagrams stored?',
    a: 'Your diagrams are saved to the cloud and tied to your account. You can access them from any device, any browser, as long as you are signed in.',
  },
  {
    q: 'What is the difference between Free and Pro?',
    a: 'The Free plan gives you access to the full canvas, all 100+ components, ERD tables, and animated data-flow connections. Pro adds cross-device sync, priority support, and early access to new features.',
  },
  {
    q: 'How much does Pro cost?',
    a: 'Pro is $5/month billed monthly, or $45/year (equivalent to $3.75/month) billed annually. You can upgrade at any time from your account settings.',
  },
  {
    q: 'How do I upgrade to Pro?',
    a: 'Sign in to your account, open the account menu in the top-right corner, and select "Upgrade to Pro". You will be taken to a secure Stripe checkout page.',
  },
  {
    q: 'Can I cancel my Pro subscription?',
    a: 'Yes. You can cancel at any time through the billing portal, accessible from your account settings. Your Pro access remains active until the end of the current billing period.',
  },
  {
    q: 'What does the animated dot on connections mean?',
    a: 'It represents data moving through your system — a live visual indicator of the path you have designed. It is purely illustrative and does not send or receive real traffic.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payments are processed by Stripe. SysDesign never stores your card details.',
  },
];
