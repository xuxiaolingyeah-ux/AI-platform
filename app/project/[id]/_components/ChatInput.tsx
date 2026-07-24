'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { Send, Plus, Loader2, Sparkles, FileText, X } from 'lucide-react';
import SkillSelector from './SkillSelector';

export interface AttachedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
}

interface ChatInputProps {
  onSend: (message: string, files: AttachedFile[]) => void;
  disabled: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [skillOpen, setSkillOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if ((!trimmed && attachedFiles.length === 0) || disabled) return;
    onSend(trimmed, attachedFiles);
    setInput('');
    setAttachedFiles([]);
  }, [input, attachedFiles, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !skillOpen) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // 检测 / 唤醒技能选择
    // 在行首或空格后输入 / 时触发
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/$/);

    if (slashMatch && !skillOpen) {
      setSkillOpen(true);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const attached: AttachedFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || 'unknown',
      };
      setAttachedFiles((prev) => [...prev, attached]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      textareaRef.current?.focus();
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSkillSelect = (skillName: string) => {
    // 替换末尾的 / 为技能名称
    const cursorPos = textareaRef.current?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursorPos);
    const textAfterCursor = input.slice(cursorPos);
    const slashIndex = textBeforeCursor.search(/(?:^|\s)\/$/);

    if (slashIndex !== -1) {
      const newBefore = textBeforeCursor.slice(0, slashIndex) + textBeforeCursor.slice(slashIndex).replace(/\s?\/$/, '');
      const skillTag = newBefore ? `${newBefore} /${skillName} ` : `/${skillName} `;
      setInput(skillTag + textAfterCursor);
    } else {
      setInput((prev) => prev + `/${skillName} `);
    }

    setSkillOpen(false);
    // 焦点回到输入框
    setTimeout(() => {
      textareaRef.current?.focus();
      const len = input.length;
      textareaRef.current?.setSelectionRange(len + skillName.length + 3, len + skillName.length + 3);
    }, 0);
  };

  const canSend = (input.trim() || attachedFiles.length > 0) && !disabled;

  return (
    <div className="border-t border-indigo-100/30 bg-white/60 backdrop-blur-sm px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* 附件标签列表 */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs"
              >
                <FileText size={13} className="text-indigo-500" />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                  <span className="text-[10px] text-indigo-400">{file.size}</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={disabled}
                  className="ml-1 p-0.5 rounded hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                  aria-label="移除文件"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 输入框行：召唤技能 + 附件按钮 + textarea + 发送按钮 */}
        <div className="relative flex items-end gap-1.5 bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-xl focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all duration-200 px-1.5 py-1.5">
          {/* 召唤技能按钮 */}
          <button
            onClick={() => setSkillOpen(!skillOpen)}
            disabled={disabled}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-colors disabled:opacity-50"
            aria-label="召唤技能"
            title="召唤技能 (输入 / 唤醒)"
          >
            <Sparkles size={17} />
          </button>

          {/* 附件上传按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50"
            aria-label="上传临时文件"
            title="上传文件到当前对话"
          >
            <Plus size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (/ 召唤技能, Enter 发送)"
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none text-sm py-1.5 px-1 bg-transparent outline-none disabled:text-gray-400 max-h-[150px]"
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all duration-200"
            aria-label="发送"
          >
            {disabled ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>

          {/* 技能选择面板 */}
          <SkillSelector
            open={skillOpen}
            onClose={() => setSkillOpen(false)}
            onSelect={handleSkillSelect}
          />
        </div>
      </div>
    </div>
  );
}
