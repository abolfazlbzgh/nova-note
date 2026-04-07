import Link from 'next/link';
import {LayoutDashboard, Settings} from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="drawer-side z-50">
      <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="bg-base-200 flex min-h-full w-64 flex-col items-start">
        <ul className="menu w-full grow">
          <li>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <Settings className="size-4" />
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
