'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { FileTreeNode } from '@/lib/types';
import { generateId } from '@/lib/utils/id';

interface FileTreeContextValue {
  /** 归档区文件树（项目级，支持文件夹组织） */
  archiveTree: FileTreeNode[];
  /** 代码区文件树 */
  codeTree: FileTreeNode[];
  /** 获取指定项目的归档树节点 */
  getProjectArchiveTree: (projectId: string) => FileTreeNode[];
  /** 获取指定项目的代码树节点 */
  getProjectCodeTree: (projectId: string) => FileTreeNode[];
  addFolder: (parentId: string | null, name: string, treeType: 'archive' | 'code', projectId: string) => void;
  addFileNode: (parentId: string | null, name: string, fileId: string, treeType: 'archive' | 'code', projectId: string) => void;
  renameNode: (nodeId: string, newName: string, treeType: 'archive' | 'code') => void;
  removeNode: (nodeId: string, treeType: 'archive' | 'code') => void;
  moveNode: (nodeId: string, targetParentId: string | null, treeType: 'archive' | 'code') => boolean;
  getNodePath: (nodeId: string, treeType: 'archive' | 'code') => string;
  /** 清除归档区中属于某个 fileId 的节点 */
  removeNodeByFileId: (fileId: string, treeType: 'archive' | 'code') => void;
}

const FileTreeContext = createContext<FileTreeContextValue | null>(null);

function removeNodeFromTree(nodes: FileTreeNode[], nodeId: string): FileTreeNode[] {
  const idsToRemove = new Set<string>();
  const collectIds = (id: string) => {
    idsToRemove.add(id);
    nodes.filter((n) => n.parentId === id).forEach((n) => collectIds(n.id));
  };
  collectIds(nodeId);
  return nodes.filter((n) => !idsToRemove.has(n.id));
}

function renameInTree(nodes: FileTreeNode[], nodeId: string, newName: string): FileTreeNode[] {
  return nodes.map((n) => (n.id === nodeId ? { ...n, name: newName } : n));
}

export function FileTreeProvider({ children }: { children: ReactNode }) {
  const [archiveTree, setArchiveTree] = useState<FileTreeNode[]>([]);
  const [codeTree, setCodeTree] = useState<FileTreeNode[]>([]);

  const getTreeSetter = (treeType: 'archive' | 'code') =>
    treeType === 'archive' ? setArchiveTree : setCodeTree;

  const getTreeGetter = (treeType: 'archive' | 'code') =>
    treeType === 'archive' ? archiveTree : codeTree;

  const getProjectArchiveTree = useCallback(
    (projectId: string) => archiveTree.filter((n) => n.projectId === projectId),
    [archiveTree]
  );

  const getProjectCodeTree = useCallback(
    (projectId: string) => codeTree.filter((n) => n.projectId === projectId),
    [codeTree]
  );

  const addFolder = useCallback(
    (parentId: string | null, name: string, treeType: 'archive' | 'code', projectId: string) => {
      const newNode: FileTreeNode = {
        id: generateId(),
        name,
        type: 'folder',
        parentId,
        projectId,
      };
      getTreeSetter(treeType)((prev) => [...prev, newNode]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const addFileNode = useCallback(
    (parentId: string | null, name: string, fileId: string, treeType: 'archive' | 'code', projectId: string) => {
      const newNode: FileTreeNode = {
        id: generateId(),
        name,
        type: 'file',
        parentId,
        fileId,
        projectId,
      };
      getTreeSetter(treeType)((prev) => [...prev, newNode]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const renameNode = useCallback(
    (nodeId: string, newName: string, treeType: 'archive' | 'code') => {
      getTreeSetter(treeType)((prev) => renameInTree(prev, nodeId, newName));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const removeNode = useCallback(
    (nodeId: string, treeType: 'archive' | 'code') => {
      getTreeSetter(treeType)((prev) => removeNodeFromTree(prev, nodeId));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const removeNodeByFileId = useCallback(
    (fileId: string, treeType: 'archive' | 'code') => {
      getTreeSetter(treeType)((prev) => prev.filter((n) => n.fileId !== fileId));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const moveNode = useCallback(
    (nodeId: string, targetParentId: string | null, treeType: 'archive' | 'code'): boolean => {
      const setTree = getTreeSetter(treeType);

      if (targetParentId) {
        const isDescendant = (ancestorId: string, checkId: string, nodes: FileTreeNode[]): boolean => {
          if (ancestorId === checkId) return true;
          const children = nodes.filter((n) => n.parentId === ancestorId);
          return children.some((c) => isDescendant(c.id, checkId, nodes));
        };

        let valid = true;
        setTree((prev) => {
          if (isDescendant(nodeId, targetParentId, prev)) {
            valid = false;
            return prev;
          }
          return prev;
        });
        if (!valid) return false;
      }

      setTree((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, parentId: targetParentId } : n))
      );
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getNodePath = useCallback(
    (nodeId: string, treeType: 'archive' | 'code'): string => {
      const tree = getTreeGetter(treeType);
      const parts: string[] = [];
      let current = tree.find((n) => n.id === nodeId);
      while (current) {
        parts.unshift(current.name);
        current = current.parentId ? tree.find((n) => n.id === current!.parentId) : undefined;
      }
      return parts.join('/');
    },
    [archiveTree, codeTree]
  );

  return (
    <FileTreeContext.Provider
      value={{
        archiveTree,
        codeTree,
        getProjectArchiveTree,
        getProjectCodeTree,
        addFolder,
        addFileNode,
        renameNode,
        removeNode,
        moveNode,
        getNodePath,
        removeNodeByFileId,
      }}
    >
      {children}
    </FileTreeContext.Provider>
  );
}

export function useFileTree() {
  const ctx = useContext(FileTreeContext);
  if (!ctx) throw new Error('useFileTree must be used within FileTreeProvider');
  return ctx;
}
