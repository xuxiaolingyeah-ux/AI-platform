'use client';

import { Plus, MessageSquare } from 'lucide-react';
import type { Session } from '@/lib/types';
import SessionItem from './SessionItem';

interface SessionPanelProps {
  sessions: Session[];
  activeSessionId: string | null;
  pendingSessionId: string | null;
  onNewSession: () => void;
  onSwitchSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onDeleteSession: (id: string) => void;
}

export default function SessionPanel({
  sessions,
  activeSessionId,
  pendingSessionId,
  onNewSession,
  onSwitchSession,
  onRenameSession,
  onDeleteSession,
}: SessionPanelProps) {
  return (
    <aside className="w-[280px] bg-white/50 backdrop-blur-sm border-r border-blue-100/30 flex flex-col flex-shrink-0">
      {/* 新建会话按钮 — 在上方 */}
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/80 backdrop-blur-sm border border-blue-100/50 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all duration-200"
        >
          <Plus size={16} />
          新建会话
        </button>
      </div>

      {/* 分隔线 */}
      <div className="px-3 pb-2">
        <div className="border-t border-blue-50" />
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {pendingSessionId && (
          <div className="flex items-center gap-2 px-3 py-2.5 mx-2 rounded-xl bg-blue-50/80 text-blue-700">
            <MessageSquare size={15} className="flex-shrink-0" />
            <span className="text-sm">新会话</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          </div>
        )}

        {sessions.length === 0 && !pendingSessionId && (
          <div className="text-center py-8 px-4">
            <MessageSquare size={24} className="mx-auto text-blue-200 mb-2" />
            <p className="text-xs text-gray-400">暂无历史会话</p>
            <p className="text-xs text-gray-400">点击上方按钮开始新会话</p>
          </div>
        )}

        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={activeSessionId === session.id}
            onClick={() => onSwitchSession(session.id)}
            onRename={(title) => onRenameSession(session.id, title)}
            onDelete={() => onDeleteSession(session.id)}
          />
        ))}
      </div>
    </aside>
  );
}
