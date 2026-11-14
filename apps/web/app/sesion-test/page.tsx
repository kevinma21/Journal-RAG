import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export default async function SessionTestPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect('/login');
  }

  const claims = data.claims;

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Session Test</h1>

      <pre className="mt-6 overflow-auto rounded-md bg-bg-secondary p-4 text-xs">
        {JSON.stringify(claims, null, 2)}
      </pre>
    </main>
  );
}