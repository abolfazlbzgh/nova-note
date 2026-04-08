'use client';

import {useTheme} from 'next-themes';
import {Menu, Sun, Moon, LogOut} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {useAuth} from '@/context/AuthContext';
import {usePathname} from 'next/navigation';

export default function Header() {
  const {theme, setTheme} = useTheme();
  const {user, claims, loading, signOut} = useAuth();
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/settings');

  const displayName = user?.displayName || claims?.name;
  const photoUrl = user?.photoURL || claims?.picture;

  const initial = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : 'U';

  return (
    <nav className="navbar bg-base-300/20 sticky top-0 z-50 w-full shadow-sm backdrop-blur-md">
      <div className="flex-none">
        {user && isDashboardRoute && (
          <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost lg:hidden">
            <Menu className="h-6 w-6" />
          </label>
        )}
      </div>

      <div className="mx-2 flex-1 px-2">
        <Link href="/" className="text-xl font-bold transition-opacity hover:opacity-80">
          <span className="text-primary">Nova</span>Note
        </Link>
      </div>

      <div className="flex items-center justify-center gap-3" suppressHydrationWarning>
        <label className="swap swap-rotate btn btn-circle btn-ghost">
          <input type="checkbox" checked={isDark} onChange={() => setTheme(isDark ? 'light' : 'dark')} />
          <Sun className="swap-on h-5 w-5" />
          <Moon className="swap-off h-5 w-5" />
        </label>

        {!loading &&
          (user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-neutral text-neutral-content relative w-10 overflow-hidden rounded-full">
                  {photoUrl ? (
                    <Image src={photoUrl} alt="Profile" fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg">{initial}</div>
                  )}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li className="pointer-events-none mb-2 flex flex-col items-start gap-0 px-4 py-2 text-xs opacity-50">
                  <span className="text-base-content w-full truncate text-sm font-bold">{displayName || 'User'}</span>
                  <span className="w-full truncate">{user.email}</span>
                </li>
                {!isDashboardRoute && (
                  <li>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </li>
                )}
                <li>
                  <button onClick={signOut} className="text-error hover:bg-error/10">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm rounded-full px-6">
              Login
            </Link>
          ))}
      </div>
    </nav>
  );
}
