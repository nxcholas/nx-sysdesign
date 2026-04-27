import type { Metadata } from 'next';
import { LandingNav } from '@/components/features/landing/landing-nav';
import { LandingFooter } from '@/components/features/landing/landing-footer';
import { ChangelogView } from '@/components/features/changelog/changelog-view';
import { changelogEntries } from '@/components/features/changelog/changelog-data';

export const metadata: Metadata = {
  title: 'Changelog — NX-Design',
  description: 'Every update to NX-Design, most recent first. See what has changed across releases.',
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
