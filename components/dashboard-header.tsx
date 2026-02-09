'use client';

import { User } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { LogOut, Building2, User as UserIcon, Users } from 'lucide-react';

export function DashboardHeader({ user }: { user: User }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-primary/10 text-primary';
      case 'supervisor':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-accent/10 text-accent';
    }
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">Logonvoice</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Construction Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium truncate max-w-32">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            {user.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/users')}
                className="gap-1 sm:gap-2 bg-transparent px-2 sm:px-3"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Users</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2 bg-transparent px-2 sm:px-3">
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
