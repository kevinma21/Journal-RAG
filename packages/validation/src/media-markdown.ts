import { fromMarkdown } from 'mdast-util-from-markdown';

const prefix = 'journalpilot-media:';
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

export function mediaReferenceId(url: string) {
  if (!url.startsWith(prefix)) return null;
  const id = url.slice(prefix.length);
  return uuid.test(id) ? id.toLowerCase() : '';
}

export function mediaMarkdown(id: string, alt: string) {
  const label = alt.replace(/[\r\n]+/g, ' ').replace(/[\\[\]]/g, '\\$&');
  return `![${label}](${prefix}${id})`;
}

export function mediaReferences(markdown: string) {
  const tree = fromMarkdown(markdown);
  const definitions = new Map<string, string>();
  const images: { id: string; start: number; end: number }[] = [];
  const references: typeof images = [];

  function visit(node: (typeof tree.children)[number] | typeof tree) {
    if (node.type === 'definition' && !definitions.has(node.identifier)) {
      definitions.set(node.identifier, node.url);
    }
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start !== undefined && end !== undefined) {
      if (node.type === 'image') {
        const id = mediaReferenceId(node.url);
        if (id !== null) images.push({ id, start, end });
      }
      if (node.type === 'imageReference') references.push({ id: node.identifier, start, end });
    }

    if ('children' in node) {
      for (const child of node.children) visit(child);
    }
  }

  visit(tree);
  for (const ref of references) {
    const id = mediaReferenceId(definitions.get(ref.id) ?? '');
    if (id !== null) images.push({ ...ref, id });
  }
  return images;
}

export function removeMediaReference(markdown: string, mediaId: string) {
  return mediaReferences(markdown)
    .filter(({ id }) => id === mediaId)
    .sort((a, b) => b.start - a.start)
    .reduce((content, { start, end }) => content.slice(0, start) + content.slice(end), markdown);
}
