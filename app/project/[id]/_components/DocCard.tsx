'use client';

import { FileText, CheckCircle } from 'lucide-react';

interface DocCardProps {
  fileName: string;
}

export default function DocCard({ fileName }: DocCardProps) {
  return (
    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 animate-fade-in">
      <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
      <FileText size={15} className="text-emerald-500 flex-shrink-0" />
      <span>
        已自动保存文档到文件区：<span className="font-medium">{fileName}</span>
      </span>
    </div>
  );
}
