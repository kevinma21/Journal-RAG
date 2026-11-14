'use client';

import { createClient } from '@/lib/supabase/client';

export function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-border-subtle bg-bg-primary px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-secondary"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path
          fill="#4285F4"
          d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.31h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
        />
        <path
          fill="#34A853"
          d="M12 21.5c2.64 0 4.86-.87 6.48-2.35l-3.14-2.45c-.87.58-1.98.92-3.34.92-2.56 0-4.72-1.73-5.5-4.05H3.26v2.53A9.79 9.79 0 0 0 12 21.5Z"
        />
        <path
          fill="#FBBC05"
          d="M6.5 13.57a5.9 5.9 0 0 1 0-3.14V7.9H3.26a9.83 9.83 0 0 0 0 8.2l3.24-2.53Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.38c1.43 0 2.7.49 3.71 1.45l2.78-2.78C16.86 3.49 14.64 2.5 12 2.5a9.79 9.79 0 0 0-8.74 5.4L6.5 10.43c.78-2.32 2.94-4.05 5.5-4.05Z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
