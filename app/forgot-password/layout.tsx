import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session) redirect('/app');
  return <>{children}</>;
}
