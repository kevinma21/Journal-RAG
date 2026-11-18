import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, House } from 'lucide-react';

import { LogoutButton } from '@/components/auth/logout-button';

export function Sidebar() {
  return (
    <aside className="m-4 hidden h-[calc(100dvh-2rem)] w-60 shrink-0 flex-col rounded-xl border border-border-subtle bg-bg-primary md:flex">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center px-5">
        <Image
          src="/logo/logo-256.png"
          width={160}
          height={160}
          alt="JournalPilot"
          loading="eager"
          className="h-auto w-32"
        />
      </div>

      {/* Navigation */}
      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
          Workspace
        </p>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg bg-brand-500/15 px-3 py-2.5 text-sm font-medium text-text-primary"
          aria-current="page"
        >
          <BookOpen size={17} className="text-brand-300" aria-hidden="true" />
          Journals
        </Link>
        <div className="mt-5 flex items-center gap-2 px-3 text-xs text-text-tertiary">
          <House size={14} aria-hidden="true" />
          <span>Private workspace</span>
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-subtle px-3 py-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
