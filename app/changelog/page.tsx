import type { Metadata } from 'next';
import { LandingNav } from '@/components/features/landing/landing-nav';
import { LandingFooter } from '@/components/features/landing/landing-footer';
import { ChangelogView } from '@/components/features/changelog/changelog-view';
import { changelogEntries } from '@/components/features/changelog/changelog-data';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Every update to NX-Design, most recent first. See what has changed across releases.',
  openGraph: {
    title: 'Changelog — NX-Design',
    description: 'Every update to NX-Design, most recent first.',
    url: 'https://nxdesign.app/changelog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog — NX-Design',
    description: 'Every update to NX-Design, most recent first.',
  },
};

export default function ChangelogPage() {
  return (
    <>
      <LandingNav />
      <main>
        <ChangelogView entries={changelogEntries} />
      </main>
      <LandingFooter />
    </>
  );
}
