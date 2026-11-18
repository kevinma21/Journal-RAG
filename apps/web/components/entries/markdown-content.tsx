'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="entry-markdown text-base leading-7 text-text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-5 mt-8 text-3xl font-semibold tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-7 text-2xl font-semibold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-6 text-xl font-semibold first:mt-0">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-brand-400 pl-4 text-text-secondary">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-brand-300 underline decoration-brand-300/50 underline-offset-4 hover:text-brand-200"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-lg border border-border-subtle bg-bg-base p-4 text-sm leading-6">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const block = Boolean(className);
            return block ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code
                className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] text-brand-200"
                {...props}
              >
                {children}
              </code>
            );
          },
          hr: () => <hr className="my-8 border-border-subtle" />,
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border-subtle px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border-muted px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
