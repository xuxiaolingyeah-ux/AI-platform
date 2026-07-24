'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { Project } from '@/lib/types';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p-demo-1',
    name: '智能客服系统',
    description: '基于大模型的企业级智能客服解决方案，支持多轮对话和意图识别',
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-01-20T10:30:00.000Z',
  },
  {
    id: 'p-demo-2',
    name: '数据中台升级',
    description: '统一数据接入、治理和分析平台，支撑业务决策',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-18T14:00:00.000Z',
  },
  {
    id: 'p-demo-3',
    name: '用户增长策略',
    description: 'Q1 用户增长产品方案，包含裂变、留存和转化策略',
    createdAt: '2025-01-05T08:00:00.000Z',
    updatedAt: '2025-01-12T09:00:00.000Z',
  },
];

interface ProjectState {
  projects: Project[];
  createProject: (name: string, description: string) => Project;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => void;
}

const ProjectContext = createContext<ProjectState | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useLocalStorage<Project[]>('pm-workbench-projects', MOCK_PROJECTS);

  const createProject = useCallback(
    (name: string, description: string): Project => {
      const now = nowISO();
      const project: Project = {
        id: generateId(),
        name,
        description,
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    [setProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [setProjects]
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: nowISO() } : p
        )
      );
    },
    [setProjects]
  );

  return (
    <ProjectContext.Provider
      value={{ projects, createProject, deleteProject, getProject, updateProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects(): ProjectState {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
