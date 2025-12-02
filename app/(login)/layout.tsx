import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getUser();

  if (user) {
    redirect('/meetings');
  }

  return <>{children}</>;
}
