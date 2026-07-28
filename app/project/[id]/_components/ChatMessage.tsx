'use client';

import { Avatar } from '@/components/ui';
import type { Message } from '@/lib/types';
import StreamingText from './StreamingText';
import DocCard from './DocCard';
import TempFileCard from './TempFileCard';
import { FileText } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isStreaming: boolean;
  onSaveTempFile?: () => void;
}

export default function ChatMessage({ message, isStreaming, onSaveTempFile }: ChatMessageProps) {
  const isAgent = message.role === 'agent';
  const isDocument = message.type === 'document';
  const isTempFile = message.type === 'tempFile';

  // 解析附件信息
  const attachedFiles = message.metadata?.attachedFiles
    ? JSON.parse(message.metadata.attachedFiles) as { name: string; size: string; type: string }[]
    : null;

  if (isDocument) {
    return (
      <div className="flex justify-start px-4 animate-fade-in">
        <div className="max-w-[85%]">
          <DocCard fileName={message.metadata?.fileName || '文档'} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 px-4 animate-message-in ${
        isAgent ? 'justify-start' : 'justify-end'
      }`}
    >
      {isAgent && (
        <div className="flex-shrink-0 mt-1">
          <Avatar name="Agent" size="sm" isAgent />
        </div>
      )}

      <div className={`max-w-[80%] ${isAgent ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm ${
            isAgent
              ? 'bg-white/80 backdrop-blur-sm border border-blue-100/30 shadow-sm'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          {isAgent ? (
            <StreamingText content={message.content} isStreaming={isStreaming} />
          ) : (
            <>
              {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
              {/* 附件标签 */}
              {attachedFiles && attachedFiles.length > 0 && (
                <div className={`flex flex-wrap gap-1.5 ${message.content ? 'mt-2' : ''}`}>
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/20 text-white/90 text-xs"
                    >
                      <FileText size={12} />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <span className="text-white/50 text-[10px]">{file.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {isTempFile && message.metadata?.fileName && (
          <TempFileCard
            fileName={message.metadata.fileName}
            fileType={message.metadata.fileType || 'unknown'}
            onSaveToWorkspace={onSaveTempFile || (() => {})}
          />
        )}
      </div>

      {!isAgent && (
        <div className="flex-shrink-0 mt-1">
          <Avatar name="我" size="sm" />
        </div>
      )}
    </div>
  );
}
