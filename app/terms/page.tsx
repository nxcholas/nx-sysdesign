import type { Metadata } from 'next';
import { LandingNav } from '@/components/features/landing/landing-nav';
import { LandingFooter } from '@/components/features/landing/landing-footer';
import { TermsView } from '@/components/features/terms/terms-view';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Read the NX-Design Terms of Use. Understand your rights and responsibilities when using our system design visualization service.',
  openGraph: {
    title: 'Terms of Use — NX-Design',
    description: 'Read the NX-Design Terms of Use. Understand your rights and responsibilities when using our system design visualization service.',
    url: 'https://nxdesign.app/terms',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use — NX-Design',
    description: 'Read the NX-Design Terms of Use. Understand your rights and responsibilities when using our system design visualization service.',
  },
};

export default function TermsPage() {
  return (
    <>
      <LandingNav />
      <main>
        <TermsView />
      </main>
      <LandingFooter />
    </>
  );
}
