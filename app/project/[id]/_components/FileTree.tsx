'use client';

import { useState } from 'react';
import { FolderPlus, Upload, Download, Plus } from 'lucide-react';
import type { FileTreeNode as FileTreeNodeType, ProjectFile } from '@/lib/types';
import FileTreeNodeComponent from './FileTreeNode';

interface FileTreeProps {
  nodes: FileTreeNodeType[];
  files: ProjectFile[];
  onAddFolder: (parentId: string | null, name: string) => void;
  onUpload: (file: File) => void;
  onDownload: (file: ProjectFile) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onMoveNode: (nodeId: string, targetParentId: string | null) => boolean;
  onBatchDownload: () => void;
  readonly?: boolean;
}

export default function FileTree({
  nodes,
  files,
  onAddFolder,
  onUpload,
  onDownload,
  onRename,
  onDelete,
  onMoveNode,
  onBatchDownload,
  readonly = false,
}: FileTreeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useState<HTMLInputElement | null>(null)[1];

  const rootNodes = nodes.filter((n) => n.parentId === null);

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      // 在选中的文件夹下创建，否则根目录
      const parent = selectedId && nodes.find((n) => n.id === selectedId)?.type === 'folder'
        ? selectedId
        : null;
      onAddFolder(parent, newFolderName.trim());
      setNewFolderName('');
      setAddingFolder(false);
    }
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onUpload(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      {!readonly && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-indigo-50">
          {addingFolder ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddFolder();
                  if (e.key === 'Escape') { setAddingFolder(false); setNewFolderName(''); }
                }}
                placeholder="文件夹名称..."
                className="flex-1 text-xs px-2 py-1 border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-300"
                autoFocus
              />
              <button
                onClick={handleAddFolder}
                className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                确定
              </button>
              <button
                onClick={() => { setAddingFolder(false); setNewFolderName(''); }}
                className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
              >
                取消
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAddingFolder(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="新建文件夹"
              >
                <FolderPlus size={14} />
                新建文件夹
              </button>
              <button
                onClick={handleUploadClick}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="上传文件"
              >
                <Upload size={14} />
                上传
              </button>
              <div className="flex-1" />
              {files.length > 0 && (
                <button
                  onClick={onBatchDownload}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="下载全部"
                >
                  <Download size={14} />
                  下载全部
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* 文件树 */}
      <div className="flex-1 overflow-y-auto py-1">
        {rootNodes.length === 0 && (
          <div className="text-center py-8 px-4">
            <Plus size={20} className="mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-400">暂无文件</p>
            {!readonly && (
              <p className="text-xs text-gray-400 mt-0.5">点击"新建文件夹"或"上传"开始</p>
            )}
          </div>
        )}

        {rootNodes.map((node) => (
          <FileTreeNodeComponent
            key={node.id}
            node={node}
            children={nodes.filter((n) => n.parentId === node.id)}
            allNodes={nodes}
            files={files}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRename={onRename}
            onDelete={onDelete}
            onDownload={onDownload}
            onMoveNode={onMoveNode}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  );
}
