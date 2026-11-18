import { JournalManagement } from '@/components/journals/journal-management';
import { getInitialJournals } from '@/lib/journals/server';

export default async function DashboardPage() {
  const initial = await getInitialJournals();
  return <JournalManagement initialJournals={initial.journals} initialError={initial.error} />;
}
