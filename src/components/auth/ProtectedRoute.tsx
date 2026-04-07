'use client';

import {useEffect} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {useAuth} from '@/context/AuthContext';

export default function ProtectedRoute({children}: {children: React.ReactNode}) {
  const {user, loading} = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
