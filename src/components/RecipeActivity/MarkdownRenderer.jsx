import ReactMarkdown from "react-markdown";

export default function MarkdownRenderer({ content, className = "prose prose-sm md:prose-base lg:prose-lg prose-slate max-w-none" }) {
  return (
    <ReactMarkdown 
      className={className}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[color:var(--color-primary)]" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-xl md:text-2xl font-bold mb-3 mt-6 text-[color:var(--color-primary)]" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-sm md:text-base leading-relaxed mb-4 text-[color:var(--color-text)]" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside pl-2 md:pl-4 space-y-2 mb-4 marker:text-[color:var(--color-accent)]" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-2 md:pl-4 space-y-2 marker:font-bold marker:text-[color:var(--color-accent)]" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="ml-2 md:ml-3 text-sm md:text-base text-[color:var(--color-text)]" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-bold text-[color:var(--color-primary)]" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-[var(--color-text)]" {...props} />
        ),
        code: ({ node, ...props }) => (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs md:text-sm text-[var(--color-text)] font-mono" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}