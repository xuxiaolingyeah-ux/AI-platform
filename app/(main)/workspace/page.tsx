'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useProjects } from '@/lib/contexts/ProjectContext';
import ProjectCardList from '@/app/workspace/_components/ProjectCardList';
import NewProjectModal from '@/app/workspace/_components/NewProjectModal';
import EditProjectModal from '@/app/workspace/_components/EditProjectModal';
import DeleteConfirmModal from '@/app/workspace/_components/DeleteConfirmModal';
import { Plus } from 'lucide-react';
import type { Project } from '@/lib/types';

export default function WorkspacePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { projects, createProject, deleteProject, updateProject } = useProjects();

  const [showNewModal, setShowNewModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  if (!checked) {
    return null;
  }

  const handleCreate = (name: string, description: string) => {
    const project = createProject(name, description);
    router.push(`/project/${project.id}`);
  };

  const handleEdit = (name: string, description: string) => {
    if (editTarget) {
      updateProject(editTarget.id, { name, description });
      setEditTarget(null);
    }
  };

  const handleProjectClick = (id: string) => {
    router.push(`/project/${id}`);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProject(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">我的项目</h2>
            <p className="text-sm text-gray-500 mt-1">管理和创建你的产品需求项目</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/20 transition-all duration-200"
          >
            <Plus size={17} />
            新建项目
          </button>
        </div>

        <ProjectCardList
          projects={projects}
          onProjectClick={handleProjectClick}
          onEditClick={setEditTarget}
          onDeleteClick={setDeleteTarget}
          onCreateClick={() => setShowNewModal(true)}
        />
      </main>

      <NewProjectModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={handleCreate}
      />

      <EditProjectModal
        open={!!editTarget}
        project={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        projectName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
