'use client';

import { useState, useCallback, type DragEvent } from 'react';
import { FileText, Folder, FolderOpen, ChevronRight, MoreVertical, Download, Trash2, Pencil } from 'lucide-react';
import type { FileTreeNode as FileTreeNodeType, ProjectFile } from '@/lib/types';

interface FileTreeNodeProps {
  node: FileTreeNodeType;
  children: FileTreeNodeType[];
  allNodes: FileTreeNodeType[];
  files: ProjectFile[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDownload: (file: ProjectFile) => void;
  onMoveNode: (nodeId: string, targetParentId: string | null) => boolean;
  depth?: number;
  readonly?: boolean;
}

export default function FileTreeNode({
  node,
  children,
  allNodes,
  files,
  selectedId,
  onSelect,
  onRename,
  onDelete,
  onDownload,
  onMoveNode,
  depth = 0,
  readonly = false,
}: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [contextOpen, setContextOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [dragOver, setDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isFolder = node.type === 'folder';
  const isSelected = selectedId === node.id;
  const linkedFile = node.fileId ? files.find((f) => f.id === node.fileId) : null;
  const hasChildren = children.length > 0;

  const handleToggle = () => {
    if (isFolder) {
      setExpanded(!expanded);
    }
    onSelect(isFolder ? node.id : node.id);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== node.name) {
      onRename(node.id, editName.trim());
    }
    setEditing(false);
    setEditName(node.name);
  };

  const handleContextAction = (action: string) => {
    setContextOpen(false);
    switch (action) {
      case 'rename':
        setEditing(true);
        setEditName(node.name);
        break;
      case 'delete':
        onDelete(node.id);
        break;
      case 'download':
        if (linkedFile) onDownload(linkedFile);
        break;
    }
  };

  // ===== 拖拽事件 =====
  const handleDragStart = useCallback((e: DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  }, [node.id]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    if (!isFolder || readonly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  }, [isFolder, readonly]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    // 只在真正离开时取消高亮
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!target.contains(relatedTarget)) {
      setDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!isFolder || readonly) return;

    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === node.id) return;

    onMoveNode(draggedId, node.id);
  }, [isFolder, readonly, node.id, onMoveNode]);

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 group ${
          isDragging ? 'opacity-40' : ''
        } ${
          dragOver
            ? 'bg-blue-100 border-2 border-blue-400 border-dashed'
            : isSelected
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={handleToggle}
        draggable={!readonly}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 展开/折叠 */}
        {isFolder ? (
          <ChevronRight
            size={14}
            className={`flex-shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        ) : (
          <span className="w-[14px] flex-shrink-0" />
        )}

        {/* 图标 */}
        {isFolder ? (
          expanded ? (
            <FolderOpen size={15} className={`flex-shrink-0 ${dragOver ? 'text-blue-500' : 'text-blue-400'}`} />
          ) : (
            <Folder size={15} className={`flex-shrink-0 ${dragOver ? 'text-blue-500' : 'text-blue-400'}`} />
          )
        ) : (
          <FileText size={15} className="flex-shrink-0 text-gray-400" />
        )}

        {/* 名称 */}
        {editing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setEditing(false);
                setEditName(node.name);
              }
            }}
            className="flex-1 text-xs px-1 py-0.5 border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-300"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-xs truncate">{node.name}</span>
        )}

        {/* 拖拽提示 */}
        {dragOver && isFolder && (
          <span className="text-[10px] text-blue-500 font-medium">释放到此处</span>
        )}

        {/* 操作菜单（非只读模式） */}
        {!readonly && !editing && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextOpen(!contextOpen);
              }}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
            >
              <MoreVertical size={12} />
            </button>

            {contextOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setContextOpen(false); }} />
                <div className="absolute right-0 top-full mt-0.5 z-20 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[100px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleContextAction('rename'); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    <Pencil size={12} /> 重命名
                  </button>
                  {linkedFile && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleContextAction('download'); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      <Download size={12} /> 下载
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleContextAction('delete'); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 子节点 */}
      {isFolder && expanded && (
        <div>
          {children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              children={allNodes.filter((n) => n.parentId === child.id)}
              allNodes={allNodes}
              files={files}
              selectedId={selectedId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onDownload={onDownload}
              onMoveNode={onMoveNode}
              depth={depth + 1}
              readonly={readonly}
            />
          ))}
          {children.length === 0 && (
            <div
              className="py-1 text-xs text-gray-400 italic"
              style={{ paddingLeft: `${8 + (depth + 1) * 16 + 14 + 15 + 4}px` }}
            >
              空文件夹
            </div>
          )}
        </div>
      )}
    </div>
  );
}
