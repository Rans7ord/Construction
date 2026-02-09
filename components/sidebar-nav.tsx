'use client';

import { User } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Users,
  Menu,
  X,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'supervisor', 'staff'],
  },
  {
    label: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
    roles: ['admin', 'supervisor', 'staff'],
  },
  {
    label: 'Petty Cash',
    href: '/dashboard/petty-cash',
    icon: Wallet,
    roles: ['admin', 'supervisor', 'staff'],
  },
  {
    label: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: ['admin', 'supervisor', 'staff'],
  },
  {
    label: 'User Management',
    href: '/dashboard/users',
    icon: Users,
    roles: ['admin'],
  },
];

export function SidebarNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0 bg-card border-2 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-16 lg:top-0 left-0 right-0 bottom-16 lg:bottom-0
          bg-card border-r border-border z-30
          transform lg:transform-none transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-full lg:w-64 flex flex-col
        `}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start gap-3 h-12 text-sm sm:text-base"
                onClick={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden top-16"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
