'use client';

import {useAuth} from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import {usePathname} from 'next/navigation';

export default function ClientLayoutWrapper({children}: {children: React.ReactNode}) {
  const {user, loading} = useAuth();
  const pathname = usePathname();

  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/settings');

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </main>
        <Footer />
      </div>
    );
  }

  if (user && isDashboardRoute) {
    return (
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 p-4">{children}</main>
          <Footer />
        </div>

        <Sidebar />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
