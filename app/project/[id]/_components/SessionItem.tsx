'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type { Session } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/date';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

export default function SessionItem({
  session,
  isActive,
  onClick,
  onRename,
  onDelete,
}: SessionItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditTitle(session.title);
      setEditing(false);
    }
  };

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-sm'
          : 'hover:bg-white/60 text-gray-700'
      }`}
      onClick={onClick}
    >
      <MessageSquare size={15} className="flex-shrink-0" />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            className="w-full text-sm bg-white border border-blue-300 rounded-lg px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-400"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="text-sm truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {session.title}
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-gray-400 mr-1">
            {formatRelativeTime(session.updatedAt)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="删除会话"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
