import { describe, expect, it } from 'vitest';
import { mediaMarkdown, mediaReferences, removeMediaReference } from '@journalpilot/validation';

const id = '7a795ed1-5640-4eb8-8df8-4e36d8206350';

describe('managed Markdown images', () => {
  it('treats user-provided filenames as alt text and preserves surrounding prose on removal', () => {
    const markdown = `Before\n\n${mediaMarkdown(id, 'Park [east]')}\n\nAfter`;
    expect(mediaReferences(markdown).map((reference) => reference.id)).toEqual([id]);
    expect(removeMediaReference(markdown, id)).toBe('Before\n\n\n\nAfter');
  });

  it('handles a referenced image while leaving plain links, code, and outside images alone', () => {
    const code = '`' + mediaMarkdown(id, 'Example') + '`';
    const link = `[Photo](journalpilot-media:${id})`;
    const outside = '![Outside](https://example.com/image.png)';
    const definition = `[covered]: journalpilot-media:${id}`;
    const markdown = [code, link, outside, '![Example][covered]', definition].join('\n\n');
    expect(mediaReferences(markdown).map((reference) => reference.id)).toEqual([id]);
    expect(removeMediaReference(markdown, id)).toBe(
      [code, link, outside, '', definition].join('\n\n'),
    );
  });
});
