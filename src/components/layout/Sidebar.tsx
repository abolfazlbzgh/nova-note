'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LayoutDashboard, User, Users, FilePlus2} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import {Role, Permission, RolePermissions} from '@/types/roles';

export default function Sidebar() {
  const {claims} = useAuth();
  const pathname = usePathname();

  const userRole = (claims?.role as Role) || Role.USER;
  const permissions = RolePermissions[userRole] || [];

  const menuItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      permission: Permission.VIEW_DASHBOARD,
    },
    {
      href: '/dashboard/new-note',
      icon: FilePlus2,
      label: 'New Note',
      permission: Permission.CREATE_NOTE,
    },
    {
      href: '/dashboard/users',
      icon: Users,
      label: 'Users',
      permission: Permission.MANAGE_USERS,
    },
    {
      href: '/dashboard/profile',
      icon: User,
      label: 'Profile',
      permission: Permission.MANAGE_PROFILE,
    },
  ];

  const visibleItems = menuItems.filter((item) => permissions.includes(item.permission));

  return (
    <div className="drawer-side z-50">
      <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="bg-base-200 flex min-h-full w-64 flex-col items-start p-4">
        <ul className="menu w-full grow gap-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    isActive
                      ? 'bg-primary text-primary-content hover:bg-primary focus:bg-primary focus:text-primary-content font-bold'
                      : 'hover:bg-base-300 text-base-content'
                  }
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
