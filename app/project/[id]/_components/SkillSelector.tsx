'use client';

import { useState, useRef, useEffect } from 'react';
import { useSkills } from '@/lib/contexts/SkillContext';
import { Puzzle } from 'lucide-react';

interface SkillSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (skillName: string) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export default function SkillSelector({ open, onClose, onSelect }: SkillSelectorProps) {
  const { skills } = useSkills();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // 键盘导航
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, skills.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (skills[selectedIndex]) {
            onSelect(skills[selectedIndex].name);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, skills, selectedIndex, onSelect, onClose]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // 延迟绑定避免立即触发
    setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open || skills.length === 0) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-64 overflow-hidden animate-fade-in"
    >
      <div className="px-3 py-2 border-b border-gray-50">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          选择技能
        </span>
      </div>
      <div className="max-h-[220px] overflow-y-auto">
        {skills.map((skill, idx) => (
          <button
            key={skill.id}
            type="button"
            onClick={() => onSelect(skill.name)}
            className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${
              idx === selectedIndex
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Puzzle size={15} className={`flex-shrink-0 mt-0.5 ${idx === selectedIndex ? 'text-indigo-500' : 'text-gray-400'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{skill.name}</div>
              <div className="text-xs text-gray-400 truncate">{skill.description}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-gray-50">
        <span className="text-[10px] text-gray-400">
          ↑↓ 选择  ↵ 确认  Esc 取消
        </span>
      </div>
    </div>
  );
}
