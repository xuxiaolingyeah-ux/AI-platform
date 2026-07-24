'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import type { Project } from '@/lib/types';

interface EditProjectModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

export default function EditProjectModal({ open, project, onClose, onSave }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('请输入项目名称');
      return;
    }
    onSave(name.trim(), description.trim());
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="编辑项目">
      <div className="space-y-4">
        <Input
          label="项目名称"
          placeholder="例如：用户画像2.0"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          autoFocus
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            项目描述
          </label>
          <textarea
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={3}
            placeholder="简单描述这个项目的目标和范围"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSave}>保存修改</Button>
        </div>
      </div>
    </Modal>
  );
}
