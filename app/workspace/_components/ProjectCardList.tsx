'use client';

import type { Project } from '@/lib/types';
import ProjectCard from './ProjectCard';
import EmptyState from './EmptyState';

interface ProjectCardListProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
  onEditClick: (project: Project) => void;
  onDeleteClick: (project: Project) => void;
  onCreateClick: () => void;
}

export default function ProjectCardList({
  projects,
  onProjectClick,
  onEditClick,
  onDeleteClick,
  onCreateClick,
}: ProjectCardListProps) {
  if (projects.length === 0) {
    return <EmptyState onCreateProject={onCreateClick} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project.id)}
          onEdit={() => onEditClick(project)}
          onDelete={() => onDeleteClick(project)}
        />
      ))}
    </div>
  );
}
