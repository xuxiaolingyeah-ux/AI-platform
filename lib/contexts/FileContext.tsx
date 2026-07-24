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
