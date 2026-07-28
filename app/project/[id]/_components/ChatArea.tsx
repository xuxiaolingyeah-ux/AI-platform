'use client';

import { useEffect, useRef } from 'react';
import type { Message, ProjectFile } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatInput, { type AttachedFile, type ReferencedDoc } from './ChatInput';
import WelcomeMessage from './WelcomeMessage';

interface ChatAreaProps {
  projectName: string;
  messages: Message[];
  isStreaming: boolean;
  sessionAgentConfirmed: boolean;
  onConfirmAgent: (agentId: string) => void;
  onSend: (content: string, files: AttachedFile[], referencedDocs?: ReferencedDoc[]) => void;
  onSaveTempFile: (messageId: string) => void;
  /** 可引用的文档（归档区 + 草稿区） */
  availableDocs: ProjectFile[];
}

export default function ChatArea({
  projectName,
  messages,
  isStreaming,
  sessionAgentConfirmed,
  onConfirmAgent,
  onSend,
  onSaveTempFile,
  availableDocs,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white/40 to-white/60">
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty && !sessionAgentConfirmed ? (
          <WelcomeMessage projectName={projectName} onConfirm={onConfirmAgent} />
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            已选择专家，开始对话吧
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming &&
                  msg.role === 'agent' &&
                  idx === messages.length - 1
                }
                onSaveTempFile={
                  msg.type === 'tempFile'
                    ? () => onSaveTempFile(msg.id)
                    : undefined
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 - 专家确认后才显示 */}
      {sessionAgentConfirmed && (
        <ChatInput
          onSend={onSend}
          disabled={isStreaming}
          availableDocs={availableDocs}
        />
      )}
    </div>
  );
}
