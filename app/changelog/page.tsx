import type { Metadata } from 'next';
import { LandingNav } from '@/components/features/landing/landing-nav';
import { LandingFooter } from '@/components/features/landing/landing-footer';
import { ChangelogView } from '@/components/features/changelog/changelog-view';
import { changelogEntries } from '@/components/features/changelog/changelog-data';

export const metadata: Metadata = {
  title: 'Changelog',
  description: "Everything that's changed in NX-Design, newest first.",
  openGraph: {
    title: "What's new — NX-Design",
    description: "Everything that's changed in NX-Design, newest first.",
    url: 'https://nxdesign.app/changelog',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's new — NX-Design",
    description: "Everything that's changed in NX-Design, newest first.",
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
