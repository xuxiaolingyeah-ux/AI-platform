'use client';

import { useState, useRef, useCallback } from 'react';
import type { ProjectFile, FileTreeNode as FileTreeNodeType } from '@/lib/types';
import { useFileTree } from '@/lib/contexts/FileTreeContext';
import { FileText, Code, ChevronLeft, ChevronRight, Archive, FileEdit, FolderArchive, Download, CheckSquare, Square } from 'lucide-react';
import FileTree from './FileTree';

interface FilePanelProps {
  projectId: string;
  files: ProjectFile[];
  archiveFiles: ProjectFile[];
  draftFiles: ProjectFile[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpload: (file: File) => void;
  onDownload: (file: ProjectFile) => void;
  onBatchDownload: (fileIds: string[]) => void;
  onArchiveFile: (fileId: string) => void;
}

type TabType = 'doc' | 'code';

export default function FilePanel({
  projectId,
  files,
  archiveFiles,
  draftFiles,
  collapsed,
  onToggleCollapse,
  onUpload,
  onDownload,
  onBatchDownload,
  onArchiveFile,
}: FilePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('doc');
  const [archiveExpanded, setArchiveExpanded] = useState(true);
  const [draftExpanded, setDraftExpanded] = useState(true);
  const { getProjectArchiveTree, getProjectCodeTree, addFolder, addFileNode, renameNode, removeNode, moveNode, removeNodeByFileId } = useFileTree();

  // 当前项目的归档/代码树
  const archiveTree = getProjectArchiveTree(projectId);
  const codeTree = getProjectCodeTree(projectId);

  // ===== 草稿区批量操作 =====
  const [selectedDraftIds, setSelectedDraftIds] = useState<Set<string>>(new Set());
  const allDraftSelected = draftFiles.length > 0 && selectedDraftIds.size === draftFiles.length;

  const toggleDraftSelect = (fileId: string) => {
    setSelectedDraftIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const toggleAllDrafts = () => {
    if (allDraftSelected) {
      setSelectedDraftIds(new Set());
    } else {
      setSelectedDraftIds(new Set(draftFiles.map((f) => f.id)));
    }
  };

  const handleBatchArchive = () => {
    selectedDraftIds.forEach((id) => onArchiveFile(id));
    setSelectedDraftIds(new Set());
  };

  const handleDraftBatchDownload = () => {
    onBatchDownload(Array.from(selectedDraftIds));
  };

  // ===== 拖拽分割线 =====
  const panelRef = useRef<HTMLDivElement>(null);
  const [archiveHeightPercent, setArchiveHeightPercent] = useState(50);
  const draggingRef = useRef(false);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;

    const onMouseMove = (ev: MouseEvent) => {
      if (!draggingRef.current || !panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const totalHeight = rect.height;
      const offsetY = ev.clientY - rect.top;
      const minPercent = 15;
      const maxPercent = 85;
      const percent = Math.max(minPercent, Math.min(maxPercent, (offsetY / totalHeight) * 100));
      setArchiveHeightPercent(percent);
    };

    const onMouseUp = () => {
      draggingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const currentTree = activeTab === 'doc' ? archiveTree : codeTree;
  const treeType = activeTab === 'doc' ? 'archive' as const : 'code' as const;

  const handleAddFolder = (parentId: string | null, name: string) => {
    addFolder(parentId, name, treeType, projectId);
  };

  const handleRename = (nodeId: string, name: string) => {
    renameNode(nodeId, name, treeType);
  };

  const handleDelete = (nodeId: string) => {
    removeNode(nodeId, treeType);
  };

  const handleMoveNode = (nodeId: string, targetParentId: string | null) => {
    return moveNode(nodeId, targetParentId, treeType);
  };

  const handleArchiveBatchDownload = () => {
    onBatchDownload(archiveFiles.map((f) => f.id));
  };

  const handleSingleArchive = (fileId: string) => {
    onArchiveFile(fileId);
  };

  return (
    <aside
      className={`bg-white/50 backdrop-blur-sm border-l border-blue-100/30 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-[44px]' : 'w-[320px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-50">
        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('doc')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'doc'
                  ? 'bg-blue-50 text-blue-600'
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
                  ? 'bg-blue-50 text-blue-600'
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
              ({activeTab === 'doc' ? archiveFiles.length + draftFiles.length : currentTree.length})
            </span>
          </div>
        </div>
      )}

      {/* 文档 Tab */}
      {!collapsed && activeTab === 'doc' && (
        <div className="flex-1 flex flex-col min-h-0" ref={panelRef}>
          {/* ===== 归档区 ===== */}
          <div
            className="flex flex-col min-h-0 border-b border-blue-50/50 overflow-hidden"
            style={{ height: `${archiveHeightPercent}%` }}
          >
            <button
              onClick={() => setArchiveExpanded(!archiveExpanded)}
              className="flex-shrink-0 w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50/50 transition-colors"
            >
              <FolderArchive size={14} className="text-blue-400" />
              <span>归档区</span>
              <span className="text-gray-300">({archiveFiles.length})</span>
              <div className="flex-1" />
              <ChevronRight
                size={12}
                className={`text-gray-400 transition-transform ${archiveExpanded ? 'rotate-90' : ''}`}
              />
            </button>

            {archiveExpanded && (
              <FileTree
                nodes={archiveTree}
                files={archiveFiles}
                onAddFolder={handleAddFolder}
                onUpload={onUpload}
                onDownload={onDownload}
                onRename={handleRename}
                onDelete={handleDelete}
                onMoveNode={handleMoveNode}
                onBatchDownload={handleArchiveBatchDownload}
                readonly={false}
              />
            )}
          </div>

          {/* ===== 可拖拽分割线 ===== */}
          <div
            className="flex-shrink-0 h-[6px] cursor-row-resize bg-transparent hover:bg-blue-100/40 transition-colors flex items-center justify-center group"
            onMouseDown={handleDividerMouseDown}
          >
            <div className="w-8 h-1 rounded-full bg-gray-200 group-hover:bg-blue-300 transition-colors" />
          </div>

          {/* ===== 草稿区 ===== */}
          <div className="flex flex-col min-h-0 overflow-hidden" style={{ height: `${100 - archiveHeightPercent}%` }}>
            <button
              onClick={() => setDraftExpanded(!draftExpanded)}
              className="flex-shrink-0 w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50/50 transition-colors"
            >
              <FileEdit size={14} className="text-amber-400" />
              <span>草稿区</span>
              <span className="text-gray-300">({draftFiles.length})</span>
              <div className="flex-1" />
              <ChevronRight
                size={12}
                className={`text-gray-400 transition-transform ${draftExpanded ? 'rotate-90' : ''}`}
              />
            </button>

            {draftExpanded && (
              <div className="flex-1 flex flex-col min-h-0">
                {draftFiles.length > 0 && (
                  <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 border-b border-amber-50">
                    <button
                      onClick={toggleAllDrafts}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="全选/取消全选"
                    >
                      {allDraftSelected ? (
                        <CheckSquare size={14} className="text-blue-500" />
                      ) : (
                        <Square size={14} />
                      )}
                      全选
                    </button>
                    <div className="flex-1" />
                    {selectedDraftIds.size > 0 && (
                      <>
                        <button
                          onClick={handleBatchArchive}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Archive size={11} />
                          批量归档 ({selectedDraftIds.size})
                        </button>
                        <button
                          onClick={handleDraftBatchDownload}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Download size={11} />
                          下载
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-2 pb-2">
                  {draftFiles.length === 0 ? (
                    <div className="text-center py-6 px-4">
                      <FileEdit size={20} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-xs text-gray-400">暂无草稿</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">AI 生成的文档将自动出现在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {draftFiles.map((file) => (
                        <div
                          key={file.id}
                          className="group flex items-center gap-2 pl-4 pr-2.5 py-2 rounded-lg hover:bg-gray-50/80 transition-colors"
                        >
                          <button
                            onClick={() => toggleDraftSelect(file.id)}
                            className="flex-shrink-0 text-gray-300 hover:text-blue-500 transition-colors"
                          >
                            {selectedDraftIds.has(file.id) ? (
                              <CheckSquare size={14} className="text-blue-500" />
                            ) : (
                              <Square size={14} />
                            )}
                          </button>

                          <FileText size={14} className="flex-shrink-0 text-amber-500" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-700 truncate">{file.name}</div>
                            <div className="text-[10px] text-gray-400">
                              {file.type} · {file.source === 'agent' ? 'AI 生成' : '上传'}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onDownload(file)}
                              className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                              title="下载"
                            >
                              <Download size={12} />
                            </button>
                            <button
                              onClick={() => handleSingleArchive(file.id)}
                              className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="归档到归档区"
                            >
                              <span className="flex items-center gap-1">
                                <Archive size={11} />
                                归档
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 代码 Tab */}
      {!collapsed && activeTab === 'code' && (
        <FileTree
          nodes={codeTree}
          files={files}
          onAddFolder={(parentId, name) => addFolder(parentId, name, 'code', projectId)}
          onUpload={onUpload}
          onDownload={onDownload}
          onRename={(nodeId, name) => renameNode(nodeId, name, 'code')}
          onDelete={(nodeId) => removeNode(nodeId, 'code')}
          onMoveNode={(nodeId, target) => moveNode(nodeId, target, 'code')}
          onBatchDownload={() => handleArchiveBatchDownload()}
          readonly={true}
        />
      )}
    </aside>
  );
}
