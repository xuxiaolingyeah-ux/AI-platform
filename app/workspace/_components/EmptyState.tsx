'use client';

import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  onCreateProject: () => void;
}

export default function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mb-4">
        <FolderOpen size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">还没有项目</h3>
      <p className="text-sm text-gray-500 mb-6">
        创建你的第一个项目，开始用 AI 辅助产品需求管理
      </p>
      <Button onClick={onCreateProject} size="lg">
        创建第一个项目
      </Button>
    </div>
  );
}
