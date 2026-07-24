'use client';

import { useState } from 'react';
import type { ProjectFile, FileTreeNode as FileTreeNodeType } from '@/lib/types';
import { useFileTree } from '@/lib/contexts/FileTreeContext';
import { FileText, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import FileTree from './FileTree';

interface FilePanelProps {
  files: ProjectFile[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpload: (file: File) => void;
  onDownload: (file: ProjectFile) => void;
  onBatchDownload: (fileIds: string[]) => void;
}

type TabType = 'doc' | 'code';

export default function FilePanel({
  files,
  collapsed,
  onToggleCollapse,
  onUpload,
  onDownload,
  onBatchDownload,
}: FilePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('doc');
  const { docTree, codeTree, addFolder, addFileNode, renameNode, removeNode, moveNode } = useFileTree();

  const currentTree = activeTab === 'doc' ? docTree : codeTree;

  const handleAddFolder = (parentId: string | null, name: string) => {
    addFolder(parentId, name, activeTab);
  };

  const handleUpload = (file: File) => {
    onUpload(file);
  };

  const handleRename = (nodeId: string, name: string) => {
    renameNode(nodeId, name, activeTab);
  };

  const handleDelete = (nodeId: string) => {
    removeNode(nodeId, activeTab);
  };

  const handleMoveNode = (nodeId: string, targetParentId: string | null) => {
    return moveNode(nodeId, targetParentId, activeTab);
  };

  const handleBatchDownload = () => {
    onBatchDownload(files.map((f) => f.id));
  };

  return (
    <aside
      className={`bg-white/50 backdrop-blur-sm border-l border-indigo-100/30 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-[44px]' : 'w-[320px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-50">
        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('doc')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'doc'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FileText size={14} />
              文档
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Code size={14} />
              代码
            </button>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-white/80 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* 折叠状态显示竖排文字 */}
      {collapsed && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 -rotate-90 whitespace-nowrap">
            <span className="text-xs text-gray-400 font-medium tracking-wider">
              {activeTab === 'doc' ? '文档' : '代码'}
            </span>
            <span className="text-[10px] text-gray-300">
              ({currentTree.length})
            </span>
          </div>
        </div>
      )}

      {/* 文件树 */}
      {!collapsed && (
        <FileTree
          nodes={currentTree}
          files={files}
          onAddFolder={handleAddFolder}
          onUpload={handleUpload}
          onDownload={onDownload}
          onRename={handleRename}
          onDelete={handleDelete}
          onMoveNode={handleMoveNode}
          onBatchDownload={handleBatchDownload}
          readonly={activeTab === 'code'}
        />
      )}
    </aside>
  );
}
