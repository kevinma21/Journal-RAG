import Image from 'next/image';
import { LogoutButton } from '@/components/auth/logout-button';

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-5 md:h-10 md:px-8">
      <Image
        src="/logo/logo-256.png"
        width={144}
        height={144}
        alt="JournalPilot"
        className="h-auto w-28 md:hidden"
      />
      <div className="md:hidden">
        <LogoutButton />
      </div>
    </header>
  );
}
