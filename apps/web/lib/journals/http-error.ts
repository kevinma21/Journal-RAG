export async function getApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    return Array.isArray(data.message)
      ? data.message.join(' ')
      : data.message || `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

export function getNetworkError(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Could not reach the JournalPilot API. Check that the API is running, then try again.';
  }

  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
