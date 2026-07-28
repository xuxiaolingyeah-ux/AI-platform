'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export default function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      setError('请输入项目名称');
      return;
    }
    onCreate(name.trim(), description.trim());
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
    <Modal open={open} onClose={handleClose} title="新建项目">
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
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
          <Button onClick={handleCreate}>创建项目</Button>
        </div>
      </div>
    </Modal>
  );
}
