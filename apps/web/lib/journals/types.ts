import type { JournalColor, JournalIcon } from '@journalpilot/validation';

export type Journal = {
  id: string;
  name: string;
  description: string | null;
  icon: JournalIcon;
  color: JournalColor;
  createdAt: string;
  updatedAt: string;
};

export type JournalFormValues = {
  name: string;
  description: string;
  icon: JournalIcon;
  color: JournalColor;
};

export type JournalLoadResult = {
  journals: Journal[];
  error: string | null;
};
