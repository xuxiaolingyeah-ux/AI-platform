'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { Send, Plus, Loader2, Sparkles, FileText, X, AtSign } from 'lucide-react';
import SkillSelector from './SkillSelector';
import type { ProjectFile } from '@/lib/types';

export interface AttachedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
}

export interface ReferencedDoc {
  fileId: string;
  name: string;
}

interface ChatInputProps {
  onSend: (message: string, files: AttachedFile[], referencedDocs?: ReferencedDoc[]) => void;
  disabled: boolean;
  /** 可引用的文档列表（归档区 + 草稿区） */
  availableDocs: ProjectFile[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ChatInput({ onSend, disabled, availableDocs }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [skillOpen, setSkillOpen] = useState(false);
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [referencedDocs, setReferencedDocs] = useState<ReferencedDoc[]>([]);
  const [docFilter, setDocFilter] = useState('');
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docPickerRef = useRef<HTMLDivElement>(null);

  // 过滤可用文档
  const filteredDocs = docFilter
    ? availableDocs.filter((d) => d.name.toLowerCase().includes(docFilter.toLowerCase()))
    : availableDocs;

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    }
  }, [input]);

  // 键盘导航文档选择器
  useEffect(() => {
    if (!docPickerOpen) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedDocIndex((prev) => Math.min(prev + 1, filteredDocs.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedDocIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredDocs[selectedDocIndex]) {
          handleDocSelect(filteredDocs[selectedDocIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setDocPickerOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docPickerOpen, filteredDocs, selectedDocIndex]);

  // 点击外部关闭文档选择器
  useEffect(() => {
    if (!docPickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (docPickerRef.current && !docPickerRef.current.contains(e.target as Node)) {
        setDocPickerOpen(false);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [docPickerOpen]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if ((!trimmed && attachedFiles.length === 0) || disabled) return;
    onSend(trimmed, attachedFiles, referencedDocs.length > 0 ? referencedDocs : undefined);
    setInput('');
    setAttachedFiles([]);
    setReferencedDocs([]);
  }, [input, attachedFiles, referencedDocs, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !skillOpen && !docPickerOpen) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);

    // 检测 / 唤醒技能选择
    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/$/);
    if (slashMatch && !skillOpen && !docPickerOpen) {
      setSkillOpen(true);
      return;
    }

    // 检测 @ 唤醒文档引用
    const atMatch = textBeforeCursor.match(/(?:^|\s)@$/);
    if (atMatch && !docPickerOpen && !skillOpen) {
      setDocPickerOpen(true);
      setDocFilter('');
      setSelectedDocIndex(0);
      return;
    }

    // 如果文档选择器已打开，更新过滤关键词
    if (docPickerOpen) {
      const atPos = textBeforeCursor.lastIndexOf('@');
      if (atPos === -1) {
        setDocPickerOpen(false);
      } else {
        const filter = textBeforeCursor.slice(atPos + 1);
        setDocFilter(filter);
        setSelectedDocIndex(0);
      }
    }
  };

  const handleDocSelect = (doc: ProjectFile) => {
    // 替换 @xxx 为文档引用标记
    const cursorPos = textareaRef.current?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursorPos);
    const textAfterCursor = input.slice(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const newBefore = textBeforeCursor.slice(0, atIndex);
      const docTag = newBefore ? `${newBefore} @[${doc.name}] ` : `@[${doc.name}] `;
      setInput(docTag + textAfterCursor);
    }

    // 添加到引用列表
    if (!referencedDocs.find((r) => r.fileId === doc.id)) {
      setReferencedDocs((prev) => [...prev, { fileId: doc.id, name: doc.name }]);
    }

    setDocPickerOpen(false);
    setDocFilter('');

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleRemoveDocRef = (fileId: string) => {
    setReferencedDocs((prev) => prev.filter((r) => r.fileId !== fileId));
    // 同时从输入框中移除对应的 @[name]
    setInput((prev) => {
      const doc = referencedDocs.find((r) => r.fileId === fileId);
      if (doc) {
        return prev.replace(new RegExp(`@\\[${doc.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\s?`, 'g'), '');
      }
      return prev;
    });
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
    setTimeout(() => {
      textareaRef.current?.focus();
      const len = input.length;
      textareaRef.current?.setSelectionRange(len + skillName.length + 3, len + skillName.length + 3);
    }, 0);
  };

  const canSend = (input.trim() || attachedFiles.length > 0) && !disabled;

  return (
    <div className="border-t border-blue-100/30 bg-white/60 backdrop-blur-sm px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {/* 引用文档标签 */}
        {referencedDocs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {referencedDocs.map((doc) => (
              <div
                key={doc.fileId}
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs"
              >
                <AtSign size={11} className="text-amber-500" />
                <span className="truncate max-w-[160px]">{doc.name}</span>
                <button
                  onClick={() => handleRemoveDocRef(doc.fileId)}
                  disabled={disabled}
                  className="ml-0.5 p-0.5 rounded hover:bg-amber-100 text-amber-400 hover:text-amber-600 transition-colors"
                  aria-label="取消引用"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 附件标签列表 */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs"
              >
                <FileText size={13} className="text-blue-500" />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                  <span className="text-[10px] text-blue-400">{file.size}</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={disabled}
                  className="ml-1 p-0.5 rounded hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                  aria-label="移除文件"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 输入框行 */}
        <div className="relative flex items-end gap-1.5 bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-xl focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-300 transition-all duration-200 px-1.5 py-1.5">
          {/* 召唤技能按钮 */}
          <button
            onClick={() => setSkillOpen(!skillOpen)}
            disabled={disabled}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 transition-colors disabled:opacity-50"
            aria-label="召唤技能"
            title="召唤技能 (输入 / 唤醒)"
          >
            <Sparkles size={17} />
          </button>

          {/* 附件上传按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
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
            placeholder="输入消息... (/ 召唤技能, @ 引用文档, Enter 发送)"
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none text-sm py-1.5 px-1 bg-transparent outline-none disabled:text-gray-400 max-h-[150px]"
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all duration-200"
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

          {/* 文档引用选择器 */}
          {docPickerOpen && (
            <div
              ref={docPickerRef}
              className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-72 overflow-hidden animate-fade-in"
            >
              <div className="px-3 py-2 border-b border-gray-50">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  引用文档
                </span>
                <span className="text-[10px] text-gray-300 ml-2">
                  (归档区 {availableDocs.filter((d) => !d.sessionId).length} + 草稿区 {availableDocs.filter((d) => d.sessionId).length})
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {filteredDocs.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-gray-400">
                    暂无可用文档
                  </div>
                ) : (
                  filteredDocs.map((doc, idx) => {
                    const isDraft = !!doc.sessionId;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleDocSelect(doc)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                          idx === selectedDocIndex
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <FileText size={14} className={`flex-shrink-0 ${isDraft ? 'text-amber-400' : 'text-blue-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{doc.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {isDraft ? '草稿区' : '归档区'} · {doc.type}
                          </div>
                        </div>
                        {referencedDocs.find((r) => r.fileId === doc.id) && (
                          <span className="text-[10px] text-blue-500 font-medium">已引用</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="px-3 py-1.5 border-t border-gray-50">
                <span className="text-[10px] text-gray-400">
                  ↑↓ 选择  ↵ 确认  Esc 取消
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
