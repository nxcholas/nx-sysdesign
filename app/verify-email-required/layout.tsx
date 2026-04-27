import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function VerifyEmailRequiredLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/sign-in');
  if (session.user.emailVerified) redirect('/app');
  return <>{children}</>;
}
