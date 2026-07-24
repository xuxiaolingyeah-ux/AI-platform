'use client';

import { File, Download, FolderDown } from 'lucide-react';

interface TempFileCardProps {
  fileName: string;
  fileType: string;
  onSaveToWorkspace: () => void;
}

export default function TempFileCard({
  fileName,
  fileType,
  onSaveToWorkspace,
}: TempFileCardProps) {
  const getFileColor = () => {
    if (fileType.startsWith('image')) return 'text-amber-500 bg-amber-50 border-amber-200';
    if (fileType.includes('pdf')) return 'text-red-500 bg-red-50 border-red-200';
    return 'text-blue-500 bg-blue-50 border-blue-200';
  };

  return (
    <div
      className={`mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${getFileColor()} animate-fade-in`}
    >
      <File size={15} className="flex-shrink-0" />
      <span className="max-w-[180px] truncate">{fileName}</span>
      <span className="text-[10px] opacity-60">临时文件</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSaveToWorkspace();
        }}
        className="ml-1 p-1 rounded hover:bg-white/50 transition-colors"
        title="保存到工作区"
      >
        <FolderDown size={14} />
      </button>
    </div>
  );
}
