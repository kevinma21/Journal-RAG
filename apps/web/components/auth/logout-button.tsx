'use client';

import { LogOut, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

import { logout } from '@/app/actions/auth';

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      void logout();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="group flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-all duration-200 hover:border-error-500/15 hover:bg-error-500/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {/* Icon */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg-secondary text-text-tertiary transition-colors duration-200 group-hover:bg-error-500/10 group-hover:text-error-500">
        {pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <LogOut size={16} />
        )}
      </span>

      {/* Text */}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-secondary transition-colors group-hover:text-error-500">
          {pending ? 'Signing out...' : 'Log out'}
        </span>

        <span className="block text-[11px] text-text-tertiary">
          End your current session
        </span>
      </span>
    </button>
  );
}