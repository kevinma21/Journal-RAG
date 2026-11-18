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

const journalEntryTitleSchema = z.string().trim().max(500).nullable().optional();
const journalEntryContentSchema = z.string().trim().min(1).max(100_000);
const occurredAtSchema = z.iso.datetime({ offset: true });

export const createJournalEntrySchema = z.object({
  journalId: z.uuid(),
  title: journalEntryTitleSchema,
  content: journalEntryContentSchema,
  occurredAt: occurredAtSchema.optional(),
});

export const updateJournalEntrySchema = z
  .object({
    title: journalEntryTitleSchema,
    content: journalEntryContentSchema.optional(),
    occurredAt: occurredAtSchema.optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined || value.content !== undefined || value.occurredAt !== undefined,
    'Provide an entry field to update.',
  );

export const journalEntryListQuerySchema = z
  .object({
    journalId: z.uuid(),
    q: z.string().trim().max(200).optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
  })
  .refine(
    (value) => !value.from || !value.to || value.from <= value.to,
    'The start date must be on or before the end date.',
  );

export const journalEntryTrashQuerySchema = z.object({
  journalId: z.uuid().optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
export type JournalEntryListQuery = z.infer<typeof journalEntryListQuerySchema>;
export type JournalEntryTrashQuery = z.infer<typeof journalEntryTrashQuerySchema>;
