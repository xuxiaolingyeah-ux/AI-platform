'use client';

import { Modal, Button } from '@/components/ui';

interface DeleteConfirmModalProps {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  open,
  projectName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="删除项目">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          确定要删除项目 <span className="font-semibold text-gray-900">「{projectName}」</span> 吗？
        </p>
        <p className="text-xs text-gray-400">
          删除后将同时移除该项目下的所有会话和文件，此操作不可撤销。
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            确认删除
          </Button>
        </div>
      </div>
    </Modal>
  );
}
