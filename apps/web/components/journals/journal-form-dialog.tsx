'use client';

import { Check, LoaderCircle, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import type { JournalColor, JournalIcon } from '@journalpilot/validation';
import type { Journal, JournalFormValues } from '@/lib/journals/types';
import {
  JOURNAL_COLORS,
  JOURNAL_COLOR_OPTIONS,
  JOURNAL_ICONS,
  JOURNAL_ICON_OPTIONS,
} from './journal-appearance';
import { getNetworkError } from '@/lib/journals/http-error';

type JournalFormDialogProps = {
  journal?: Journal;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: JournalFormValues) => Promise<void>;
};

const DEFAULT_VALUES: JournalFormValues = {
  name: '',
  description: '',
  icon: 'book',
  color: 'indigo',
};

export function JournalFormDialog({
  journal,
  isSaving,
  onClose,
  onSubmit,
}: JournalFormDialogProps) {
  const [values, setValues] = useState<JournalFormValues>(() =>
    journal
      ? {
          name: journal.name,
          description: journal.description ?? '',
          icon: journal.icon,
          color: journal.color,
        }
      : DEFAULT_VALUES,
  );
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = values.name.trim();
    if (!name) {
      setFormError('Enter a name for this journal.');
      return;
    }

    setFormError(null);
    try {
      await onSubmit({ ...values, name, description: values.description.trim() });
    } catch (cause) {
      setFormError(getNetworkError(cause));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="journal-dialog-title" className="text-xl font-semibold text-text-primary">
              {journal ? 'Edit journal' : 'Create a journal'}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Give this space a name and a little context.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-text-primary">
            Journal name <span className="text-error-500">*</span>
            <input
              autoFocus
              maxLength={255}
              required
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="For example, Daily notes"
              className="mt-2 h-11 w-full rounded-lg border border-border-subtle bg-bg-base px-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-focus focus:ring-2 focus:ring-brand-500/20"
            />
          </label>

          <label className="block text-sm font-medium text-text-primary">
            Description <span className="font-normal text-text-tertiary">(optional)</span>
            <textarea
              maxLength={2000}
              rows={3}
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="What would you like to keep here?"
              className="mt-2 w-full resize-y rounded-lg border border-border-subtle bg-bg-base px-3 py-2.5 text-sm leading-6 text-text-primary outline-none placeholder:text-text-tertiary focus:border-border-focus focus:ring-2 focus:ring-brand-500/20"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-text-primary">Color</legend>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_COLOR_OPTIONS.map((color) => (
                <ColorOption
                  key={color}
                  color={color}
                  selected={values.color === color}
                  onSelect={() => setValues((current) => ({ ...current, color }))}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-text-primary">Icon</legend>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_ICON_OPTIONS.map((icon) => (
                <IconOption
                  key={icon}
                  icon={icon}
                  selected={values.icon === icon}
                  onSelect={() => setValues((current) => ({ ...current, icon }))}
                />
              ))}
            </div>
          </fieldset>

          {formError && (
            <p role="alert" className="text-sm text-error-500">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 rounded-lg px-4 text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                ""
              )}
              {journal ? 'Save changes' : 'Create journal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ColorOption({
  color,
  selected,
  onSelect,
}: {
  color: JournalColor;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Choose ${color} color${selected ? ', selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex size-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 ${selected ? 'border-brand-300 bg-brand-500/10 ring-2 ring-brand-400 ring-offset-2 ring-offset-bg-primary' : 'border-transparent hover:border-border-focus'}`}
    >
      <span className={`flex size-5 items-center justify-center rounded-full ${JOURNAL_COLORS[color].swatch}`}>
        {selected && (
          <Check
            size={13}
            strokeWidth={3}
            className="text-white drop-shadow-[0_1px_1px_rgb(0_0_0/0.8)]"
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  );
}

function IconOption({
  icon,
  selected,
  onSelect,
}: {
  icon: JournalIcon;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = JOURNAL_ICONS[icon];

  return (
    <button
      type="button"
      aria-label={`Choose ${icon} icon`}
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex size-10 items-center justify-center rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 ${selected ? 'border-brand-400 bg-brand-500/15 text-brand-300' : 'border-border-subtle text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}`}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
