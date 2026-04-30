export type PrivacySection = {
  id: string;
  number: number;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const privacySections: PrivacySection[] = [
  {
    id: 'introduction',
    number: 1,
    title: 'Introduction',
    paragraphs: [
      'NX-Design ("we," "us," or "our") operates nxdesign.app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.',
      'By using NX-Design, you consent to the data practices described in this policy. If you do not agree, please do not use the service.',
      'This policy applies to all users worldwide. For users in the European Economic Area (EEA) or other jurisdictions with specific data protection laws, additional rights may apply.',
    ],
  },
  {
    id: 'information-we-collect',
    number: 2,
    title: 'Information We Collect',
    paragraphs: [
      'We collect information you provide directly and information generated through your use of the service.',
    ],
    bullets: [
      'Account information: name, email address, and password (stored as a hashed value) when you register.',
      'Billing information: payment method details processed and stored by Stripe. We do not store full card numbers.',
      'User-generated content: diagrams and system design files you create and save to our servers.',
      'Usage data: pages visited, features used, actions taken, and timestamps.',
      'Device and browser information: IP address, browser type, operating system, and referring URLs.',
      'Communications: any messages you send us via feedback forms or email.',
    ],
  },
  {
    id: 'how-we-use',
    number: 3,
    title: 'How We Use Your Information',
    paragraphs: [
      'We use the information we collect to operate and improve the service.',
    ],
    bullets: [
      'To create and manage your account and authenticate you.',
      'To process subscription payments and manage billing through Stripe.',
      'To store and serve your diagrams and design files.',
      'To send transactional emails (account verification, password resets, billing receipts).',
      'To analyze usage patterns and improve product features via Vercel Analytics.',
      'To respond to your support requests and feedback.',
      'To detect, investigate, and prevent fraudulent or unauthorized activity.',
      'To comply with legal obligations.',
    ],
  },
  {
    id: 'cookies',
    number: 4,
    title: 'Cookies and Tracking',
    paragraphs: [
      'We use cookies and similar tracking technologies to operate the service and analyze usage.',
    ],
    bullets: [
      'Session cookies: required for authentication and maintaining your logged-in state.',
      'Analytics: Vercel Analytics collects anonymized usage data. No personally identifiable information is shared with Vercel for analytics purposes.',
      'You can configure your browser to refuse cookies, but some features of the service may not function correctly without them.',
    ],
  },
  {
    id: 'information-sharing',
    number: 5,
    title: 'How We Share Your Information',
    paragraphs: [
      'We do not sell your personal information. We share it only in the following limited circumstances.',
    ],
    bullets: [
      'Service providers: Stripe (payment processing), Vercel (hosting and analytics), and authentication infrastructure providers. These providers are contractually bound to protect your data.',
      'Legal requirements: if required by law, court order, or governmental authority.',
      'Business transfers: in connection with a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you via email before your data is subject to a different privacy policy.',
      'With your consent: in any other case, only with your explicit permission.',
    ],
  },
  {
    id: 'data-retention',
    number: 6,
    title: 'Data Retention',
    paragraphs: [
      'We retain your personal information for as long as your account is active or as needed to provide the service.',
    ],
    bullets: [
      'Account data is retained until you delete your account.',
      'Diagrams and design files are deleted within 30 days of account deletion.',
      'Billing records are retained for 7 years as required by financial regulations.',
      'Anonymized analytics data may be retained indefinitely.',
    ],
  },
  {
    id: 'security',
    number: 7,
    title: 'Data Security',
    paragraphs: [
      'We implement industry-standard technical and organizational measures to protect your information.',
    ],
    bullets: [
      'Passwords are stored using a one-way cryptographic hash — we cannot recover your plain-text password.',
      'All data is transmitted over HTTPS/TLS.',
      'Access to production systems is restricted to authorized personnel only.',
      'No method of transmission or storage is 100% secure. In the event of a data breach affecting your information, we will notify you as required by applicable law.',
    ],
  },
  {
    id: 'your-rights',
    number: 8,
    title: 'Your Rights',
    paragraphs: [
      'Depending on your location, you may have the following rights regarding your personal data.',
    ],
    bullets: [
      'Access: request a copy of the personal data we hold about you.',
      'Correction: request that we correct inaccurate or incomplete data.',
      'Deletion: request deletion of your personal data (subject to legal retention obligations).',
      'Portability: request your data in a machine-readable format.',
      'Objection: object to certain processing of your data.',
      'California residents (CCPA): you have the right to know what personal information is collected, the right to delete it, and the right to opt out of sale (we do not sell personal information).',
      'To exercise any of these rights, contact us at legal@nxdesign.app.',
    ],
  },
  {
    id: 'international-transfers',
    number: 9,
    title: 'International Data Transfers',
    paragraphs: [
      'NX-Design is operated from the United States. If you are located outside the United States, your information will be transferred to and processed in the United States.',
      'By using the service, you consent to this transfer. We take steps to ensure that transferred data receives an adequate level of protection.',
    ],
  },
  {
    id: 'changes',
    number: 10,
    title: 'Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. The effective date at the top of this page will reflect the date of the most recent revision.',
      'For material changes, we will notify you via email or an in-app notice. Your continued use of the service after the effective date constitutes acceptance of the updated policy.',
      'For questions about this Privacy Policy, contact us at: legal@nxdesign.app',
    ],
  },
];
