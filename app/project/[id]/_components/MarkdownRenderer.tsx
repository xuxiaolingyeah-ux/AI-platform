'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-indigo-600 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-pre:bg-slate-900 prose-pre:text-gray-100 prose-table:text-sm prose-th:bg-indigo-50/50 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-li:text-gray-700 prose-blockquote:border-indigo-300 prose-blockquote:bg-indigo-50/30 prose-blockquote:py-0.5 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
