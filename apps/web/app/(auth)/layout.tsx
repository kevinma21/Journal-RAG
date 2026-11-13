import Image from 'next/image';
import type { ReactNode } from 'react';

import { AuthHero } from '@/components/auth/auth-hero';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="h-dvh overflow-hidden text-text-primary">
      <div className="grid h-full lg:grid-cols-[42%_58%]">
        {/* Logo */}
        <div className="absolute left-10 top-8 z-20 xl:left-16 xl:top-10">
          <Image
            src="/logo/logo-1024.png"
            alt="JournalPilot"
            width={1024}
            height={1024}
            priority
            className="h-auto w-full max-w-33 opacity-90"
          />
        </div>

        {/* Left — authentication */}
        <section className="flex min-h-0 items-center bg-black px-6 py-6 sm:px-10 lg:px-14 xl:px-16">
          <div className="mx-auto w-full max-w-117.5">{children}</div>
        </section>

        {/* Right — JournalPilot brand / hero */}
        <section
          aria-hidden="true"
          className="relative hidden bg-black min-h-0 overflow-hidden border-l border-white lg:block"
        >
          <AuthHero />
        </section>
      </div>
    </main>
  );
}
