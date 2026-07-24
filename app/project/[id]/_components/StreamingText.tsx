'use client';

import MarkdownRenderer from './MarkdownRenderer';

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
}

export default function StreamingText({ content, isStreaming }: StreamingTextProps) {
  if (!content && !isStreaming) return null;

  return (
    <div className={isStreaming ? 'typing-cursor' : ''}>
      {content ? (
        <MarkdownRenderer content={content} />
      ) : (
        <span className="inline-flex gap-1 py-2">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      )}
    </div>
  );
}
