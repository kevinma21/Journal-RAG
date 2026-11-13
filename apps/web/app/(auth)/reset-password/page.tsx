import { redirect } from 'next/navigation';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { createClient } from '@/lib/supabase/server';

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect('/login');
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />

          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary">
            Account recovery
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">
          Set a new password.
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
          Choose a new password for your JournalPilot account.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
