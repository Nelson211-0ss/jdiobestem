import type { Metadata } from 'next';
import { Suspense } from 'react';

import LoginForm from '@/components/admin/LoginForm';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * The form reads `?next=` with useSearchParams, which forces a client bailout.
 * Without a Suspense boundary the whole page refuses to prerender, so the
 * boundary is what lets the shell be static while the form hydrates.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<Skeleton className="h-80 w-full max-w-sm rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
