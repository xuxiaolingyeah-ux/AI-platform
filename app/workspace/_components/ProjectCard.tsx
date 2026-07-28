'use client';

import { Trash2, FolderOpen, Pencil } from 'lucide-react';
import type { Project } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/date';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onClick, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div
      className="group bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
            <FolderOpen size={20} className="text-blue-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {project.description || '暂无描述'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
            aria-label="编辑项目"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            aria-label="删除项目"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-blue-50">
        <span className="text-xs text-gray-400">
          更新于 {formatRelativeTime(project.updatedAt)}
        </span>
      </div>
    </div>
  );
}
