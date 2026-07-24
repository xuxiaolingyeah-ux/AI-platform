'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { FileTreeNode } from '@/lib/types';
import { generateId } from '@/lib/utils/id';

interface FileTreeContextValue {
  docTree: FileTreeNode[];
  codeTree: FileTreeNode[];
  addFolder: (parentId: string | null, name: string, treeType: 'doc' | 'code') => void;
  addFileNode: (parentId: string | null, name: string, fileId: string, treeType: 'doc' | 'code') => void;
  renameNode: (nodeId: string, newName: string, treeType: 'doc' | 'code') => void;
  removeNode: (nodeId: string, treeType: 'doc' | 'code') => void;
  moveNode: (nodeId: string, targetParentId: string | null, treeType: 'doc' | 'code') => boolean;
  getNodePath: (nodeId: string, treeType: 'doc' | 'code') => string;
}

const FileTreeContext = createContext<FileTreeContextValue | null>(null);

function removeNodeFromTree(nodes: FileTreeNode[], nodeId: string): FileTreeNode[] {
  return nodes
    .filter((n) => n.id !== nodeId)
    .map((n) => ({
      ...n,
      // 我们不在节点中存储 children，通过 parentId 关联
    }));
}

function renameInTree(nodes: FileTreeNode[], nodeId: string, newName: string): FileTreeNode[] {
  return nodes.map((n) => (n.id === nodeId ? { ...n, name: newName } : n));
}

export function FileTreeProvider({ children }: { children: ReactNode }) {
  const [docTree, setDocTree] = useState<FileTreeNode[]>([]);
  const [codeTree, setCodeTree] = useState<FileTreeNode[]>([]);

  const addFolder = useCallback(
    (parentId: string | null, name: string, treeType: 'doc' | 'code') => {
      const newNode: FileTreeNode = {
        id: generateId(),
        name,
        type: 'folder',
        parentId,
      };
      const setTree = treeType === 'doc' ? setDocTree : setCodeTree;
      setTree((prev) => [...prev, newNode]);
    },
    []
  );

  const addFileNode = useCallback(
    (parentId: string | null, name: string, fileId: string, treeType: 'doc' | 'code') => {
      const newNode: FileTreeNode = {
        id: generateId(),
        name,
        type: 'file',
        parentId,
        fileId,
      };
      const setTree = treeType === 'doc' ? setDocTree : setCodeTree;
      setTree((prev) => [...prev, newNode]);
    },
    []
  );

  const renameNode = useCallback(
    (nodeId: string, newName: string, treeType: 'doc' | 'code') => {
      const setTree = treeType === 'doc' ? setDocTree : setCodeTree;
      setTree((prev) => renameInTree(prev, nodeId, newName));
    },
    []
  );

  const removeNode = useCallback(
    (nodeId: string, treeType: 'doc' | 'code') => {
      const setTree = treeType === 'doc' ? setDocTree : setCodeTree;
      setTree((prev) => {
        // 删除节点及其所有子节点
        const idsToRemove = new Set<string>();
        const collectIds = (id: string) => {
          idsToRemove.add(id);
          prev.filter((n) => n.parentId === id).forEach((n) => collectIds(n.id));
        };
        collectIds(nodeId);
        return prev.filter((n) => !idsToRemove.has(n.id));
      });
    },
    []
  );

  const moveNode = useCallback(
    (nodeId: string, targetParentId: string | null, treeType: 'doc' | 'code'): boolean => {
      const setTree = treeType === 'doc' ? setDocTree : setCodeTree;

      // 校验：不能将自己移入自己或自己的子文件夹
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
    []
  );

  const getNodePath = useCallback(
    (nodeId: string, treeType: 'doc' | 'code'): string => {
      const tree = treeType === 'doc' ? docTree : codeTree;
      const parts: string[] = [];
      let current = tree.find((n) => n.id === nodeId);
      while (current) {
        parts.unshift(current.name);
        current = current.parentId ? tree.find((n) => n.id === current!.parentId) : undefined;
      }
      return parts.join('/');
    },
    [docTree, codeTree]
  );

  return (
    <FileTreeContext.Provider
      value={{ docTree, codeTree, addFolder, addFileNode, renameNode, removeNode, moveNode, getNodePath }}
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
