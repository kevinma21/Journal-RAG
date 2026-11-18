import { z } from 'zod';

export const journalIcons = [
  'book',
  'heart',
  'briefcase',
  'plane',
  'leaf',
  'coffee',
  'lightbulb',
] as const;

export const journalColors = ['indigo', 'blue', 'teal', 'rose', 'amber', 'violet'] as const;

export type JournalIcon = (typeof journalIcons)[number];
export type JournalColor = (typeof journalColors)[number];

export const createJournalSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional().nullable(),
  icon: z.enum(journalIcons).default('book'),
  color: z.enum(journalColors).default('indigo'),
});

export const updateJournalSchema = createJournalSchema
  .partial()
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.icon !== undefined ||
      value.color !== undefined,
    'Provide a journal name or description to update.',
  );

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;
