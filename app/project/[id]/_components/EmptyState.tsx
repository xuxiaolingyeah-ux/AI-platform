'use client';

import { FolderOpen } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="text-center py-12 px-4">
      <FolderOpen size={28} className="mx-auto text-gray-300 mb-2" />
      <p className="text-xs text-gray-400">暂无文件</p>
      <p className="text-xs text-gray-400 mt-1">
        对话中生成的文档将自动出现在这里
      </p>
    </div>
  );
}
