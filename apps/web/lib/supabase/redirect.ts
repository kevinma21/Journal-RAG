export function getSafeInternalRedirect(value: string | null, fallback = '/') {
  if (!value) {
    return fallback;
  }

  try {
    const target = new URL(value, 'https://journalpilot.invalid');

    if (target.origin !== 'https://journalpilot.invalid') {
      return fallback;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
