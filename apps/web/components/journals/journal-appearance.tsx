'use client';

import { BookOpen, BriefcaseBusiness, Coffee, Heart, Leaf, Lightbulb, Plane } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { JournalColor, JournalIcon } from '@journalpilot/validation';

export const JOURNAL_ICONS: Record<JournalIcon, LucideIcon> = {
  book: BookOpen,
  heart: Heart,
  briefcase: BriefcaseBusiness,
  plane: Plane,
  leaf: Leaf,
  coffee: Coffee,
  lightbulb: Lightbulb,
};

export const JOURNAL_COLORS: Record<JournalColor, { icon: string; swatch: string }> = {
  indigo: { icon: 'bg-indigo-500/15 text-indigo-300', swatch: 'bg-indigo-400' },
  blue: { icon: 'bg-blue-500/15 text-blue-300', swatch: 'bg-blue-400' },
  teal: { icon: 'bg-teal-500/15 text-teal-300', swatch: 'bg-teal-400' },
  rose: { icon: 'bg-rose-500/15 text-rose-300', swatch: 'bg-rose-400' },
  amber: { icon: 'bg-amber-500/15 text-amber-300', swatch: 'bg-amber-400' },
  violet: { icon: 'bg-violet-500/15 text-violet-300', swatch: 'bg-violet-400' },
};

export const JOURNAL_COLOR_OPTIONS = Object.keys(JOURNAL_COLORS) as JournalColor[];
export const JOURNAL_ICON_OPTIONS = Object.keys(JOURNAL_ICONS) as JournalIcon[];
