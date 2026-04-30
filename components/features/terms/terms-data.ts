export type TermsSection = {
  id: string;
  number: number;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const termsSections: TermsSection[] = [
  {
    id: 'acceptance',
    number: 1,
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing or using nxdesign.app, you agree to be bound by these Terms of Use. If you do not agree, do not use the service.',
      'Continued use of the service after any updates to these Terms constitutes acceptance of the revised Terms.',
    ],
  },
  {
    id: 'description',
    number: 2,
    title: 'Description of Service',
    paragraphs: [
      'NX-Design is a web-based system design visualization tool that allows users to create, save, and manage architecture diagrams.',
      'The service is available in both free and paid subscription tiers.',
    ],
  },
  {
    id: 'accounts',
    number: 3,
    title: 'User Accounts',
    paragraphs: [],
    bullets: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
      'You must provide accurate, complete, and current registration information.',
      'Accounts are for individual use only and are non-transferable.',
      'We reserve the right to suspend or terminate accounts that violate these Terms.',
    ],
  },
  {
    id: 'billing',
    number: 4,
    title: 'Subscription & Billing',
    paragraphs: [],
    bullets: [
      'Paid plans are billed on a recurring basis through our payment processor, Stripe.',
      'Subscriptions automatically renew at the end of each billing cycle unless cancelled before the renewal date.',
      'Refunds are issued at our discretion; no refunds are provided for partial billing periods already charged.',
      'We reserve the right to modify pricing with at least 30 days\' advance notice.',
      'Failure to maintain valid payment may result in downgrade to the free tier or account suspension.',
    ],
  },
  {
    id: 'content',
    number: 5,
    title: 'User-Generated Content',
    paragraphs: [],
    bullets: [
      'You retain full ownership of all diagrams and designs you create using NX-Design.',
      'By saving content to our servers, you grant NX-Design a limited, non-exclusive, royalty-free license to store, display, and transmit your content solely as necessary to provide the service.',
      'You must not upload, create, or store content that is illegal, infringing, harmful, or violates any third-party rights.',
      'We are not responsible for user-generated content but reserve the right to remove content that violates these Terms.',
    ],
  },
  {
    id: 'acceptable-use',
    number: 6,
    title: 'Acceptable Use Policy',
    paragraphs: [],
    bullets: [
      'You agree not to reverse engineer, decompile, scrape, or attempt to gain unauthorized access to any part of the service or its infrastructure.',
      'You may not use the service for any unlawful purpose or in violation of any applicable law.',
      'You may not impersonate any person or entity or misrepresent your affiliation with any person or entity.',
      'You may not interfere with or disrupt the integrity or performance of the service.',
      'You may not resell, sublicense, or otherwise provide access to the service to third parties without our express written permission.',
    ],
  },
  {
    id: 'intellectual-property',
    number: 7,
    title: 'Intellectual Property',
    paragraphs: [],
    bullets: [
      'The NX-Design name, logo, user interface, underlying code, and all associated content are the intellectual property of NX-Design and its licensors.',
      'Nothing in these Terms transfers any intellectual property rights to you.',
      'You may not copy, reproduce, modify, distribute, or create derivative works of any part of our platform without express written permission.',
    ],
  },
  {
    id: 'privacy',
    number: 8,
    title: 'Privacy',
    paragraphs: [
      'Your use of the service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.',
      'We collect, process, and store data as described in the Privacy Policy.',
    ],
  },
  {
    id: 'international',
    number: 9,
    title: 'International Use',
    paragraphs: [],
    bullets: [
      'NX-Design is operated from the United States. If you access the service from outside the United States, you do so at your own risk and are responsible for compliance with your local laws.',
      'We make no representation that the service is appropriate, available, or legal in all jurisdictions.',
      'Export control and economic sanctions laws of the United States may apply to your use of the service.',
    ],
  },
  {
    id: 'disclaimers',
    number: 10,
    title: 'Disclaimers',
    paragraphs: [],
    bullets: [
      'The service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied.',
      'We do not warrant uninterrupted availability, error-free operation, fitness for a particular purpose, or that any defects will be corrected.',
      'We are not liable for any loss of data, lost revenue, or business interruption arising from your use of the service.',
    ],
  },
  {
    id: 'liability',
    number: 11,
    title: 'Limitation of Liability',
    paragraphs: [],
    bullets: [
      "To the maximum extent permitted by applicable law, NX-Design's total cumulative liability to you for any claims arising from or related to these Terms or the service shall not exceed the greater of (a) the total fees paid by you to NX-Design in the twelve months preceding the claim, or (b) $100 USD.",
      'In no event shall NX-Design be liable for any indirect, incidental, special, consequential, or punitive damages, regardless of the cause of action or the theory of liability.',
    ],
  },
  {
    id: 'indemnification',
    number: 12,
    title: 'Indemnification',
    paragraphs: [
      'You agree to indemnify, defend, and hold harmless NX-Design and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys\' fees) arising out of or related to your use of the service, your violation of these Terms, or your infringement of any third-party rights.',
    ],
  },
  {
    id: 'dispute-resolution',
    number: 13,
    title: 'Dispute Resolution & Mandatory Arbitration',
    paragraphs: [],
    bullets: [
      'Any dispute, claim, or controversy arising out of or relating to these Terms or the service shall be resolved by binding individual arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.',
      'Arbitration shall take place in the State of California, United States. The Federal Arbitration Act governs the interpretation and enforcement of this arbitration provision.',
      'You waive any right to participate in a class action lawsuit or class-wide arbitration.',
      'The small claims court exception applies — either party may bring an individual claim in small claims court.',
      'Before initiating arbitration, both parties agree to attempt informal resolution by providing written notice of the dispute and allowing 30 days to resolve it.',
    ],
  },
  {
    id: 'governing-law',
    number: 14,
    title: 'Governing Law',
    paragraphs: [
      'These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.',
      'The Federal Arbitration Act governs all arbitration-related provisions of these Terms.',
    ],
  },
  {
    id: 'changes',
    number: 15,
    title: 'Changes to Terms',
    paragraphs: [],
    bullets: [
      'We reserve the right to update or modify these Terms at any time. The effective date will be updated accordingly.',
      'For material changes, we will provide notice via email or an in-app notification.',
      'Your continued use of the service after the effective date of any changes constitutes your acceptance of the updated Terms.',
    ],
  },
  {
    id: 'termination',
    number: 16,
    title: 'Termination',
    paragraphs: [],
    bullets: [
      'We may suspend or terminate your access to the service at our discretion for violations of these Terms or for any other reason, with or without notice.',
      'You may terminate your account at any time by deleting it from your account settings.',
      'Upon termination, your right to use the service ceases immediately. Sections covering intellectual property, limitation of liability, indemnification, and dispute resolution survive termination.',
    ],
  },
  {
    id: 'contact',
    number: 17,
    title: 'Contact',
    paragraphs: [
      'For legal inquiries, please contact us at: legal@nxdesign.app',
      'NX-Design — nxdesign.app',
    ],
  },
];
