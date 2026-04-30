import type { Metadata } from 'next';
import { LandingNav } from '@/components/features/landing/landing-nav';
import { LandingFooter } from '@/components/features/landing/landing-footer';
import { PrivacyView } from '@/components/features/privacy/privacy-view';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the NX-Design Privacy Policy. Learn how we collect, use, and protect your information when you use our system design visualization service.',
  openGraph: {
    title: 'Privacy Policy — NX-Design',
    description: 'Read the NX-Design Privacy Policy. Learn how we collect, use, and protect your information when you use our system design visualization service.',
    url: 'https://nxdesign.app/privacy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — NX-Design',
    description: 'Read the NX-Design Privacy Policy. Learn how we collect, use, and protect your information when you use our system design visualization service.',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <LandingNav />
      <main>
        <PrivacyView />
      </main>
      <LandingFooter />
    </>
  );
}
