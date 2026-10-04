# JournalPilot — Design System

**Project:** JournalPilot  
**Document:** Design System  
**Version:** 1.0  
**Status:** Final  
**Date:** October 2026  
**Author:** Kevin Pratama

---

# 1. Design System Overview

## 1.1 Purpose

This document defines the visual language, reusable UI patterns, design tokens, and interaction rules for JournalPilot.

JournalPilot is an AI-augmented digital journal designed around three core activities:

1. **Capture** personal memories with minimal friction.
2. **Retrieve** memories through chronological, geographic, semantic, and conversational interfaces.
3. **Reflect** on memories through grounded AI assistance.

---

## 1.2 Source of the Visual Language
The visual assets establish the following identity:

- Dark-first application interface.
- Deep near-black backgrounds with subtle purple undertones.
- Indigo as the primary brand accent.
- Soft white primary text and muted gray secondary text.
- Rounded cards and controls.
- Subtle borders rather than heavy outlines.
- Restrained shadows and layered dark surfaces.
- Compact sidebar navigation.
- Data-dense but calm dashboard layouts.
- Inter as the primary typeface.

---

# 2. Brand Identity

## 2.1 Brand Character

JournalPilot should feel:

- **Calm** — journaling should not feel like operating enterprise software.
- **Focused** — the interface should keep attention on the user's memories.
- **Intelligent** — AI capabilities should feel integrated rather than decorative.
- **Private** — the visual language should communicate a personal, contained workspace.
- **Precise** — information hierarchy should remain clear even when the product contains substantial personal data.
- **Modern** — use restrained depth, rounded surfaces, and subtle motion rather than excessive decoration.

---

## 2.2 Logo Usage

### Primary Logo

Use `logo.svg` when both the symbol and wordmark are appropriate.
![logo](../../assets/full/logo.svg)

Recommended locations:

- Authentication pages.
- Marketing / landing surfaces if introduced.
- Large application headers.
- Empty states where brand recognition is useful.

### Symbol

Use `icon.svg` for compact application surfaces:

- Sidebar.
- Compact header.
- Favicon.
- App icon.
- AI avatar when a branded symbol is preferred.

### Branded Symbol

![icon](../../assets/icon/icon-256.png)

---

# 3. Design Principles

## 3.1 Writing Comes First

The journal editor is the primary product interaction. Controls surrounding the editor should remain visually subordinate to the writing area.

## 3.2 Calm Over Decorative

Avoid excessive gradients, glowing effects, large shadows, or animated decoration. Depth should come primarily from surface contrast and spacing.

## 3.3 Information Has a Clear Hierarchy

Use contrast, typography, spacing, and surface elevation to establish hierarchy rather than adding borders to every element.

## 3.4 AI Is an Assistant, Not the Interface

AI should feel like an integrated capability of JournalPilot rather than a separate generic chatbot product.

## 3.5 Evidence Is Discoverable

When AI answers depend on journal memories, supporting memories should be visually distinguishable and easy to inspect.

## 3.6 Important States Are Visible

Loading, saving, processing, errors, empty states, and disabled states should communicate clearly without overwhelming the user.

## 3.7 Consistency Over Novelty

Prefer an existing component or pattern before introducing a new visual treatment.

## 3.8 Accessible by Default

Color, focus, keyboard navigation, semantic HTML, labels, and reduced-motion support are part of the component design rather than post-processing.

---

# 4. Design Foundations

# 4.1 Color Palette

## 4.1.1 Brand Colors

| Token | HEX | RGB | Usage |
|---|---|---|---|
| `brand-500` | `#4F46E5` | `79, 70, 229` | Primary brand accent, primary actions, active controls |
| `brand-600` | `#4338CA` | `67, 56, 202` | Hover / pressed primary controls |
| `brand-400` | `#6366F1` | `99, 102, 241` | Focus rings, lighter accent surfaces |
| `brand-300` | `#818CF8` | `129, 140, 248` | Selected indicators on dark surfaces |

`#4F46E5` is the canonical JournalPilot brand color extracted directly from `journalpilot-symbol-brand.svg`.

### Usage Guidelines

- Use `brand-500` for the primary call to action.
- Use `brand-600` for hover or pressed states.
- Use lighter brand values for focus indicators and subtle selected states.
- Do not use the brand color as the default color for large blocks of text.
- Avoid using brand color for decorative elements that could be confused with interactive controls.

---

## 4.1.2 Dark Surface Palette

The screenshots establish a dark interface built from multiple near-black and purple-tinted surfaces.

| Token | HEX | RGB | Usage |
|---|---|---|---|
| `bg-base` | `#0F0C16` | `15, 12, 22` | Application background |
| `bg-primary` | `#1D1B21` | `29, 27, 33` | Primary content surface |
| `bg-secondary` | `#292031` | `41, 32, 49` | Cards, panels, elevated surfaces |
| `bg-tertiary` | `#343948` | `52, 57, 72` | Stronger controls / borders / selected utility surfaces |
| `bg-dark-blue` | `#07112A` | `7, 17, 42` | Map / geographic visualization background where applicable |

### Usage Guidelines

The interface should generally follow:

```text
bg-base
  ↓
bg-primary
  ↓
bg-secondary
  ↓
bg-tertiary
```

Each elevation level should provide enough contrast to establish hierarchy without looking like a collection of unrelated cards.

---

## 4.1.3 Text Colors

| Token | HEX | RGB | Usage |
|---|---|---|---|
| `text-primary` | `#FDFDFD` | `253, 253, 253` | Headings, primary content, important values |
| `text-secondary` | `#B0AEB5` | `176, 174, 181` | Supporting text, metadata |
| `text-tertiary` | `#82868E` | `130, 134, 142` | Placeholder / low-emphasis information |
| `text-inverse` | `#111827` | `17, 24, 39` | Text on light surfaces |

### Usage Guidelines

- Use `text-primary` sparingly for high-priority content.
- Use `text-secondary` for metadata such as dates, locations, and supporting descriptions.
- Use `text-tertiary` for placeholders and low-priority labels.
- Do not rely on low contrast alone to communicate disabled state; combine color with opacity and interaction behavior.

---

## 4.1.4 Border Colors

| Token | HEX | RGB | Usage |
|---|---|---|---|
| `border-subtle` | `#343948` | `52, 57, 72` | Cards, inputs, dividers |
| `border-muted` | `#292031` | `41, 32, 49` | Very subtle separation |
| `border-focus` | `#6366F1` | `99, 102, 241` | Keyboard / input focus |

Borders should normally be 1px. Avoid using multiple strong borders around nested surfaces.

---

## 4.1.5 Semantic Colors

Semantic colors should be muted enough to fit the dark JournalPilot interface while retaining sufficient contrast.

| Token | HEX | RGB | Usage |
|---|---|---|---|
| `success-500` | `#22C55E` | `34, 197, 94` | Successful save, completed processing |
| `warning-500` | `#F59E0B` | `245, 158, 11` | Pending, caution, limited data |
| `error-500` | `#EF4444` | `239, 68, 68` | Errors, destructive actions |
| `info-500` | `#3B82F6` | `59, 130, 246` | Informational states |

For dark surfaces, use a low-opacity semantic background rather than placing saturated semantic colors over large areas.

Example:

```css
background: color-mix(in srgb, var(--color-success-500) 12%, transparent);
color: var(--color-success-500);
```

---

## 4.1.6 Semantic Usage

### Success

Use for:

- Entry successfully saved.
- Upload completed.
- AI processing completed.
- Successful recovery.

### Warning

Use for:

- AI processing pending.
- Limited data.
- Unsaved or potentially destructive state.
- Long-running operations.

### Error

Use for:

- Validation errors.
- Failed uploads.
- AI failures.
- Destructive confirmations.

### Information

Use for:

- Explanatory notices.
- Non-critical system information.
- Contextual guidance.

---

# 4.2 Typography

## 4.2.1 Font Family

### Primary Typeface: Inter

The supplied JournalPilot logo SVG explicitly uses Inter for the wordmark. The application UI should therefore use Inter as the primary typeface to maintain brand consistency.

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Use the same family for headings, body text, controls, metadata, and AI responses unless a future brand decision introduces a dedicated display typeface.

---

## 4.2.2 Font Weights

| Weight | Value | Usage |
|---|---:|---|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, metadata, navigation |
| Semibold | 600 | Buttons, card titles, H3-H5 |
| Bold | 700 | Major headings, important metrics |

Avoid using many weights on a single screen.

---

## 4.2.3 Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---:|---:|---:|---|
| `display` | 36px | 44px | 700 | Major landing / empty-state heading |
| `h1` | 32px | 40px | 700 | Page title |
| `h2` | 24px | 32px | 700 | Major section |
| `h3` | 20px | 28px | 600 | Card / subsection title |
| `h4` | 18px | 26px | 600 | Small section heading |
| `h5` | 16px | 24px | 600 | Component heading |
| `h6` | 14px | 20px | 600 | Compact heading / label |
| `body-lg` | 16px | 26px | 400 | Journal content / prominent body |
| `body` | 14px | 22px | 400 | Default interface text |
| `body-sm` | 13px | 20px | 400 | Supporting content |
| `caption` | 12px | 18px | 500 | Metadata, timestamps |
| `overline` | 11px | 16px | 600 | Rare compact labels |

### Journal Content

Journal writing should prioritize readability over interface density.

Recommended:

- `body-lg` for the primary reading/writing experience.
- 26–30px line height for long-form content.
- A readable maximum content width rather than full-width text.
- Strong spacing between paragraphs.

---

# 4.3 Spacing

JournalPilot uses a 4px base spacing unit.

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |

### Guidelines

- 4–8px: icon-to-text and compact control spacing.
- 12–16px: component internal spacing.
- 20–24px: card and section spacing.
- 32–48px: major layout separation.
- 64px+: page-level or marketing-level separation.

Avoid arbitrary values unless required by a specific visual asset.

---

# 4.4 Border Radius

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 6px | Compact controls |
| `radius-md` | 8px | Inputs, buttons |
| `radius-lg` | 12px | Cards, panels |
| `radius-xl` | 16px | Large panels, chat window |
| `radius-2xl` | 20px | Feature surfaces |
| `radius-full` | 9999px | Pills, avatars, FAB |

The screenshots use rounded cards and panels as a recurring visual characteristic. Prefer `radius-lg` to `radius-xl` for standard application cards.

---

# 4.5 Elevation & Shadows

JournalPilot should use subtle elevation rather than heavy shadows.

| Level | Shadow | Usage |
|---|---|---|
| `elevation-0` | none | Base surface |
| `elevation-1` | `0 1px 2px rgba(0,0,0,.20)` | Cards / small controls |
| `elevation-2` | `0 8px 24px rgba(0,0,0,.24)` | Dropdowns / popovers |
| `elevation-3` | `0 16px 40px rgba(0,0,0,.32)` | Modals / chat window |
| `elevation-4` | `0 24px 64px rgba(0,0,0,.40)` | Large overlays where required |

On the dark UI, surface contrast should do most of the visual work. Do not stack large shadows on already elevated cards.

---

# 4.6 Layout

## 4.6.1 Application Shell
### Sidebar

Recommended:

- Width: 220–240px desktop.
- Darker surface than the main content area.
- Compact navigation items.
- Clear active state using brand accent.
- Avoid excessive separators.

### Main Content

Recommended:

- Flexible width.
- 24–32px horizontal page padding on desktop.
- Maximum readable content width for text-heavy views.
- Full available width for map and data visualization surfaces.

---

## 4.6.2 Responsive Layout

### Desktop

- Persistent sidebar.
- Multi-column dashboard layouts where useful.
- Floating AI assistant available.

### Tablet

- Reduced sidebar width or collapsible navigation.
- Preserve card hierarchy.
- Avoid overly dense multi-column layouts.

### Mobile

- Sidebar becomes a drawer or bottom navigation where appropriate.
- Cards stack vertically.
- AI assistant expands into a near-full-screen interface.
- Journal editor receives the largest available vertical space.

Recommended breakpoints:

| Token | Width |
|---|---:|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

# 5. Core Components

# 5.1 Buttons

## 5.1.1 Primary Button

Purpose: the primary action on a surface.

```text
Background: brand-500
Text: white
Radius: radius-md
Height: 40px
Horizontal padding: 16px
Font: 14px / 600
```

States:

| State | Treatment |
|---|---|
| Default | `brand-500` |
| Hover | `brand-600` |
| Active | `brand-600` + slight visual compression |
| Focus | 2px accessible focus ring |
| Disabled | Reduced opacity, no pointer interaction |
| Loading | Preserve width; replace label with loading indicator |

---

## 5.1.2 Secondary Button

```text
Background: bg-secondary
Text: text-primary
Border: 1px solid border-subtle
Radius: radius-md
```

Use for actions that are important but secondary to the primary action.

---

## 5.1.3 Ghost Button

```text
Background: transparent
Text: text-secondary
Border: none
```

On hover, introduce a subtle surface background rather than a strong color change.

---

## 5.1.4 Destructive Button

Use `error-500` primarily for destructive actions.

For standard destructive buttons, prefer a dark tinted error surface with error-colored text rather than a large saturated red block.

Permanent deletion should require explicit confirmation.

---

## 5.1.5 Icon Button

Recommended:

- 36–40px square.
- `radius-md`.
- Icon size: 18–20px.
- Tooltip for unfamiliar icons.
- Accessible label for icon-only controls.

---

# 5.2 Form Elements

## 5.2.1 Input

```text
Height: 40–44px
Background: bg-primary
Border: 1px solid border-subtle
Radius: radius-md
Text: text-primary
Placeholder: text-tertiary
Padding: 12px
```

Focus:

```text
Border: border-focus
Focus ring: brand-400 with accessible contrast
```

Error:

```text
Border: error-500
Supporting message: error-500
```

---

## 5.2.2 Textarea

Use the same visual treatment as inputs but allow flexible height.

For journal writing, use a dedicated editor surface rather than styling the primary writing area as a standard form textarea.

---

## 5.2.3 Labels

- 13–14px.
- Medium weight.
- `text-secondary`.
- 6–8px spacing above the control.
- Required fields should be communicated accessibly.

---

## 5.2.4 Validation Messages

Validation messages should:

- appear close to the relevant control;
- explain what needs to change;
- avoid technical implementation details;
- remain concise.

---

# 5.3 Cards

Cards are used to group related information rather than to decorate the interface.

```text
Background: bg-secondary
Border: 1px solid border-subtle
Radius: radius-lg
Padding: 16–24px
Elevation: elevation-1 or none
```

Use cards for:

- journal summaries;
- statistics;
- reflection sections;
- memory previews;
- AI evidence;
- grouped controls.

Avoid placing cards inside cards unless the hierarchy clearly requires it.

---

# 5.4 Modals

Use modals for focused decisions or short interactions, not for primary journal writing.

```text
Overlay: rgba(0, 0, 0, 0.55)
Background: bg-secondary
Radius: radius-xl
Shadow: elevation-3
Max width: 480–640px for standard dialogs
Padding: 24px
```

Modal structure:

```text
Title
Supporting description
Content
Actions
```

The primary action should be visually clear and destructive actions should use the destructive treatment.

---

# 5.5 Navigation

## Sidebar Navigation

Navigation items should use:

- 36–40px height.
- 8–12px horizontal padding.
- 8px icon/text gap.
- `radius-md`.
- `brand-500` or a subtle brand-tinted surface for the active state.

The active state should be immediately recognizable without relying only on color.

---

# 5.6 Empty States

Empty states should answer three questions:

1. What is empty?
2. Why is it empty?
3. What can I do next?

Use:

- small relevant illustration/icon when useful;
- concise heading;
- short supporting text;
- one primary next action.

Avoid oversized illustrations that distract from the product.

---

# 6. Journal-Specific Components

# 6.1 Journal Entry Editor

The editor is the most important content surface in JournalPilot.

### Design Goals

- Minimal distraction.
- High readability.
- Clear save state.
- Easy metadata access.
- Comfortable long-form writing.

The writing area should use `body-lg` typography and generous vertical spacing.

---

# 6.2 Entry Card

An entry preview should prioritize:

1. Date / time.
2. Short content preview.
3. Important media or location indicators.
4. Optional processing state.

Do not show every piece of metadata on a compact card.

---

# 6.3 Timeline

The timeline should visually emphasize time progression rather than creating a dense data table.

Recommended:

- Group entries by date.
- Use subtle dividers.
- Use stronger typography for date groups.
- Keep entry cards visually lightweight.

---

# 6.4 Calendar

Calendar should use brand accent to indicate selected dates and subtle indicators for dates containing memories.

Do not make every date visually prominent.

---

# 6.5 Places

Place views should prioritize:

- location name;
- number of associated memories;
- representative memory;
- geographic context.

Map colors belong primarily to the mapping provider and should not redefine the JournalPilot brand palette.

---

# 6.6 Statistics

Statistics should communicate trends without turning JournalPilot into an analytics dashboard.

Use:

- large primary metric;
- short supporting label;
- restrained visualization;
- consistent semantic colors.

Avoid excessive charts in the MVP.

---

# 7. AI Assistant Chat Widget

## 7.1 Design Goal

The JournalPilot AI assistant should feel like a persistent companion to the journal rather than an unrelated chatbot.

The assistant should visually inherit the JournalPilot system:

- dark surfaces;
- indigo accent;
- Inter typography;
- subtle borders;
- restrained elevation;
- rounded geometry.

The assistant should remain visually subordinate to the journal editor while being easy to access from anywhere in the application.

---

# 7.2 Floating Action Button (FAB)

## Desktop

Recommended:

```text
Size: 56 × 56px
Position: 24px from right
Position: 24px from bottom
Radius: 9999px
Background: brand-500
Icon: 22–24px
Shadow: elevation-2
```

Use the JournalPilot symbol or a recognizable AI/chat icon.

The symbol should remain visually simple at small sizes.

### Hover

- Background → `brand-600`.
- Slight elevation increase.
- Optional 1px upward translation.

### Focus

Use a visible keyboard focus ring.

### Disabled

The FAB should normally not be disabled. If unavailable, provide an explanatory state rather than silently disabling it.

---

# 7.3 FAB Placement

The FAB must not overlap critical controls.

Avoid overlap with:

- primary editor controls;
- mobile bottom navigation;
- important map controls;
- toast notifications.

On mobile, the FAB should move upward when a bottom navigation or browser-safe-area requires it.

---

# 7.4 Chat Window

### Desktop

Recommended dimensions:

```text
Width: 380–420px
Height: 560–680px
Max height: calc(100vh - 48px)
Radius: radius-xl
Background: bg-secondary
Border: 1px solid border-subtle
Shadow: elevation-3
```

---

# 7.5 Chat Header

Recommended:

- Height: 56–64px.
- JournalPilot symbol/avatar: 28–32px.
- Name: 14–16px, semibold.
- Supporting state: 12px.
- Close/minimize action: icon button.

The assistant identity should remain consistent throughout the application.

---

# 7.6 Message Area

The message area should:

- scroll independently from the header and composer;
- preserve comfortable vertical spacing;
- automatically scroll to new messages when appropriate;
- allow users to inspect supporting memories.

Recommended horizontal padding: 16px.

---

# 7.7 User Message Bubble

```text
Background: brand-500
Text: #FFFFFF
Alignment: right
Max width: 80%
Radius: 16px 16px 4px 16px
Padding: 10px 14px
```

The user bubble should be visually distinct but not overly saturated.

---

# 7.8 AI Message Bubble

AI responses should feel more integrated with the application than user messages.

Recommended:

```text
Background: bg-primary
Text: text-primary
Alignment: left
Max width: 88%
Border: 1px solid border-subtle
Radius: 16px 16px 16px 4px
Padding: 12px 14px
```

AI messages should support:

- paragraphs;
- lists;
- links where applicable;
- memory references;
- concise evidence previews.

---

# 7.9 Retrieval Evidence

When an AI response is grounded in memories, evidence can appear beneath the response.

Evidence cards should use `bg-secondary` or `bg-tertiary` with subtle borders.

The user should be able to open the original journal entry.

---

# 7.10 Composer

Recommended:

```text
Min height: 44px
Background: bg-primary
Border: 1px solid border-subtle
Radius: radius-lg
Padding: 8px 10px
```

The composer should support multiline input when appropriate while keeping the send action immediately accessible.

---

# 7.11 Send Button

Recommended:

```text
Size: 32–36px
Radius: radius-md
Background: brand-500
Icon: 16–18px
```

States:

| State | Treatment |
|---|---|
| Empty input | Disabled / low emphasis |
| Ready | `brand-500` |
| Hover | `brand-600` |
| Sending | Loading indicator |
| Error | Return to sendable state with error feedback |

---

# 7.12 Typing / Thinking Indicator

Use a subtle three-dot or pulse indicator.

```text
JournalPilot is thinking · · ·
```

Avoid implying human typing. The indicator should communicate AI generation or processing rather than simulate a person.

---

# 7.13 Streaming Response

If AI responses stream progressively:

- preserve the message bubble while content arrives;
- avoid repeated layout shifts;
- show a subtle generating indicator near the end of the response;
- keep the stop/cancel action accessible if implemented.

---

# 7.14 AI Error State

Example:

```text
I couldn't retrieve your memories right now.

[ Try again ]
```

Do not expose provider-specific errors such as raw SDK messages to users.

---

# 7.15 No Relevant Memories

Example:

```text
I couldn't find a relevant memory for that question.

You could try:
• adding a date or time period
• mentioning a location
• asking about a different memory
```

This state should reinforce the product's grounded-memory behavior rather than pretending an answer exists.

---

# 8. Content Design

## 8.1 Journal Writing

Journal writing should be optimized for readability:

- 16px minimum body size.
- 1.6+ line height for long-form text.
- Maximum readable line length.
- Clear paragraph spacing.
- Minimal visual chrome.

## 8.2 Markdown Rendering

Markdown should render using the same typography and spacing tokens as the rest of the application.

Supported content should have consistent styles for:

- headings;
- paragraphs;
- lists;
- links;
- blockquotes;
- code;
- emphasis.

## 8.3 AI Content

AI-generated text should use the same core content typography as journal content while being visually identified through the AI message container and evidence treatment.

---

# 9. Forms & Validation

## 9.1 Validation Principles

Validation should be:

- immediate where helpful;
- specific;
- concise;
- actionable;
- consistent across forms.

## 9.2 Auto-Save / Drafts

The entry editor may maintain a local draft while the user writes.

The UI should communicate draft state without interrupting writing.

Recommended states:

```text
Draft saved
Saving...
Saved
Unable to save draft
```

The local draft should be cleared after successful persistence according to the final user-flow behavior.

---

# 10. Accessibility

## 10.1 Keyboard Navigation

All interactive controls must be reachable using the keyboard.

## 10.2 Focus

Focus must be visible against the dark interface.

Use `border-focus` and/or a 2px focus ring rather than removing the browser focus indicator without replacement.

## 10.3 Color Contrast

Do not use color as the only mechanism for:

- active state;
- error state;
- success state;
- processing state;
- disabled state.

Pair color with text, icons, borders, or position.

## 10.4 Images

User-uploaded images should have appropriate alternative text where the content meaning is known. Decorative images should not receive redundant alternative text.

## 10.5 Reduced Motion

Respect `prefers-reduced-motion`.

When reduced motion is enabled:

- remove non-essential movement;
- reduce transitions;
- do not rely on animation to communicate state.

---

# 11. Interaction Patterns

## 11.1 Create

```text
Open Create
 ↓
Enter Information
 ↓
Validate
 ↓
Save
 ↓
Success Feedback
```

## 11.2 Edit

```text
Open Item
 ↓
Edit
 ↓
Save
 ↓
Updated State
```

## 11.3 Destructive Action

```text
Delete
 ↓
Confirmation
 ↓
Destructive Action
 ↓
Success / Error Feedback
```

Permanent deletion should always be clearly distinguished from moving an entry to Trash.

## 11.4 Loading

Prefer skeletons or localized loading indicators when the layout is known. Avoid blocking the entire application for background AI processing.

## 11.5 Error Recovery

Every recoverable error should provide an obvious next action when possible:

```text
Error
 ↓
Explain
 ↓
Retry / Correct / Go Back
```

---

# 12. Page-Level Layouts

## 12.1 Authentication

Authentication pages should be visually simpler than the authenticated application.

Recommended structure:

```text
Brand
 ↓
Authentication Card
 ↓
Supporting Authentication Actions
```

## 12.2 Journal Dashboard

The dashboard should prioritize:

1. Current journal context.
2. Recent memories.
3. Quick creation.
4. AI access.
5. Relevant statistics or navigation.

## 12.3 Journal View

Use timeline/list presentation for memory browsing and preserve clear access to entry creation.

## 12.4 Entry Detail / Editor

The content should dominate the page. Metadata and secondary actions should remain visually secondary.

## 12.5 Timeline / Calendar

These views should optimize for temporal exploration rather than visual decoration.

## 12.6 Places

Use the map as the primary geographic surface and provide a clear way to inspect associated memories.

## 12.7 Statistics

Use restrained cards and visualizations. Avoid making statistics more prominent than journaling itself.

## 12.8 AI Chat

The chat page or persistent assistant should make the distinction between user questions, AI answers, and evidence obvious.

## 12.9 Weekly Reflection

The reflection page should feel like a calm reading experience rather than a dashboard.

---

# 13. Design Tokens

The implementation should expose the design system as reusable tokens rather than hard-coded values scattered throughout the application.

Example CSS structure:

```css
:root {
  --color-brand-300: #818CF8;
  --color-brand-400: #6366F1;
  --color-brand-500: #4F46E5;
  --color-brand-600: #4338CA;

  --color-bg-base: #0F0C16;
  --color-bg-primary: #1D1B21;
  --color-bg-secondary: #292031;
  --color-bg-tertiary: #343948;

  --color-text-primary: #FDFDFD;
  --color-text-secondary: #B0AEB5;
  --color-text-tertiary: #82868E;
  --color-text-inverse: #111827;

  --color-border-subtle: #343948;
  --color-border-muted: #292031;
  --color-border-focus: #6366F1;

  --color-success-500: #22C55E;
  --color-warning-500: #F59E0B;
  --color-error-500: #EF4444;
  --color-info-500: #3B82F6;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;
}
```

The exact implementation may use Tailwind CSS theme tokens or another token system, but component styling should reference semantic tokens rather than repeating raw values.

---

# 14. Component Usage Rules

## 14.1 Reuse Existing Components

Before creating a component, check whether an existing component can support the use case through composition or variants.

## 14.2 Create a New Component When

Create a new reusable component when:

- the pattern appears in multiple locations;
- the interaction has meaningful independent behavior;
- accessibility behavior needs to be encapsulated;
- a domain-specific JournalPilot pattern is emerging.

## 14.3 Avoid Premature Abstraction

Do not create a generic abstraction for a component that appears only once unless it has significant complexity or is expected to become reusable.

## 14.4 Variants

Prefer explicit variants over one-off CSS overrides.

Example:

```text
Button
├── primary
├── secondary
├── ghost
└── destructive
```

rather than creating separate unrelated button implementations.

---

# 15. MVP Design Coverage

| Area | MVP | Post-MVP | Status |
|---|:---:|:---:|---|
| Authentication | ✓ | | Defined |
| Journal Management | ✓ | | Defined |
| Entry Editor | ✓ | | Defined |
| Image Upload | ✓ | | Defined |
| Location | ✓ | | Defined |
| Timeline | ✓ | | Defined |
| Calendar | ✓ | | Defined |
| Places | ✓ | | Defined |
| Statistics | ✓ | | Defined |
| AI Chat | ✓ | | Defined |
| AI Evidence | ✓ | | Defined |
| AI Processing States | ✓ | | Defined |
| Weekly Reflection | ✓ | | Defined |
| Trash / Recovery | ✓ | | Defined |
| Voice UI | | ✓ | Deferred |
| Mobile Application | | ✓ | Deferred |
| Advanced AI Agents | | ✓ | Deferred |
| Profile Management | | ✓ | Deferred |
| Settings | | ✓ | Deferred |

---

# 16. Design Boundaries

## 16.1 USER-FLOWS.md

Defines:

- user actions;
- product flows;
- alternative paths;
- system states visible to users;
- end-to-end user journeys.

## 16.2 DESIGN-SYSTEM.md

Defines:

- visual identity;
- design tokens;
- reusable components;
- interaction patterns;
- accessibility conventions;
- AI interface behavior;
- page-level visual structure.

## 16.3 ARCHITECTURE.md

Defines:

- application components;
- API boundaries;
- database architecture;
- storage;
- workers;
- AI provider abstraction;
- infrastructure.

## 16.4 DATA-MODEL.md

Defines:

- entities;
- relationships;
- ownership;
- persistence;
- derived AI data.

## 16.5 TESTING.md

Defines how the design and behavior are verified through automated and manual testing.

---

# 17. Final Design Principles

1. **Write first.** The journal editor is the center of the product.
2. **Keep the interface calm.** Use contrast and spacing instead of visual noise.
3. **Use indigo intentionally.** `#4F46E5` is the primary JournalPilot brand accent.
4. **Prefer layered dark surfaces.** Depth should come from subtle surface differences.
5. **Make AI understandable.** Clearly distinguish AI responses, processing states, and errors.
6. **Make evidence discoverable.** Users should be able to inspect the memories behind AI answers.
7. **Keep controls consistent.** Reuse components and interaction patterns.
8. **Do not hide important states.** Saving, processing, errors, and empty states should be visible.
9. **Prioritize accessibility.** Keyboard, focus, contrast, labels, and reduced motion are first-class requirements.
10. **Design for the MVP.** Avoid building a large design system for hypothetical features.

---