'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { ProjectFile, FileSource } from '@/lib/types';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

interface FileState {
  files: ProjectFile[];
  addFile: (file: ProjectFile) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<ProjectFile>) => void;
  getProjectFiles: (projectId: string) => ProjectFile[];
  getArchiveFiles: (projectId: string) => ProjectFile[];
  getDraftFiles: (projectId: string, sessionId: string) => ProjectFile[];
  archiveFile: (fileId: string) => ProjectFile | null;
  removeSessionDrafts: (sessionId: string) => void;
  toggleGithubSynced: (fileIds: string[]) => void;
  saveTempFile: (projectId: string, sessionId: string, name: string, type: string) => ProjectFile;
}

const FileContext = createContext<FileState | null>(null);

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useLocalStorage<ProjectFile[]>('pm-workbench-files', []);

  const addFile = useCallback(
    (file: ProjectFile) => {
      setFiles((prev) => [file, ...prev]);
    },
    [setFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [setFiles]
  );

  const updateFile = useCallback(
    (id: string, updates: Partial<ProjectFile>) => {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    },
    [setFiles]
  );

  const getProjectFiles = useCallback(
    (projectId: string) => files.filter((f) => f.projectId === projectId),
    [files]
  );

  /** 归档区：sessionId 为空的文件（项目级共享） */
  const getArchiveFiles = useCallback(
    (projectId: string) => files.filter((f) => f.projectId === projectId && !f.sessionId),
    [files]
  );

  /** 草稿区：属于指定会话的文件 */
  const getDraftFiles = useCallback(
    (projectId: string, sessionId: string) =>
      files.filter((f) => f.projectId === projectId && f.sessionId === sessionId),
    [files]
  );

  /** 将草稿文件归档：复制一份到归档区（新 ID、sessionId 为空），原草稿保留 */
  const archiveFile = useCallback(
    (fileId: string): ProjectFile | null => {
      let newFile: ProjectFile | null = null;
      setFiles((prev) => {
        const source = prev.find((f) => f.id === fileId);
        if (!source) return prev;
        newFile = {
          ...source,
          id: generateId(),
          sessionId: undefined,
          githubSynced: false,
          createdAt: nowISO(),
        };
        return [newFile, ...prev];
      });
      return newFile;
    },
    [setFiles]
  );

  /** 删除会话时清理其草稿文件 */
  const removeSessionDrafts = useCallback(
    (sessionId: string) => {
      setFiles((prev) => prev.filter((f) => f.sessionId !== sessionId));
    },
    [setFiles]
  );

  const toggleGithubSynced = useCallback(
    (fileIds: string[]) => {
      setFiles((prev) =>
        prev.map((f) =>
          fileIds.includes(f.id) ? { ...f, githubSynced: true } : f
        )
      );
    },
    [setFiles]
  );

  const saveTempFile = useCallback(
    (projectId: string, sessionId: string, name: string, type: string): ProjectFile => {
      const file: ProjectFile = {
        id: generateId(),
        projectId,
        sessionId,
        name,
        type,
        source: 'user_upload' as FileSource,
        githubSynced: false,
        createdAt: nowISO(),
      };
      setFiles((prev) => [file, ...prev]);
      return file;
    },
    [setFiles]
  );

  return (
    <FileContext.Provider
      value={{
        files,
        addFile,
        removeFile,
        updateFile,
        getProjectFiles,
        getArchiveFiles,
        getDraftFiles,
        archiveFile,
        removeSessionDrafts,
        toggleGithubSynced,
        saveTempFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles(): FileState {
  const ctx = useContext(FileContext);
  if (!ctx) throw new Error('useFiles must be used within FileProvider');
  return ctx;
}
