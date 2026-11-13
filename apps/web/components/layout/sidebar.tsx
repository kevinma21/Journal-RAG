import Image from 'next/image';
import { PanelLeft } from 'lucide-react';

import { LogoutButton } from '@/components/auth/logout-button';

export function Sidebar() {
  return (
    <aside className="m-4 hidden h-[96vh] w-60 shrink-0 flex-col rounded-lg border border-border-subtle bg-bg-primary/25 md:flex">
      {/* Header */}
      <div className="flex h-15 shrink-0 items-center justify-between px-5">
        <Image
          src="/logo/logo-256.png"
          width={200}
          height={200}
          alt="JournalPilot"
          loading="eager"
          className="h-auto w-36"
        />

        <button
          type="button"
          aria-label="Toggle sidebar"
          className="text-text-secondary transition-colors hover:text-text-primary"
        >
          <PanelLeft size={22} />
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4">
        {/* Navigation items will go here */}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-subtle px-3 py-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
