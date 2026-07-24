'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '@/lib/contexts/ProjectContext';
import { useChat } from '@/lib/contexts/ChatContext';
import { useFiles } from '@/lib/contexts/FileContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFileTree } from '@/lib/contexts/FileTreeContext';
import ProjectTopBar from './_components/ProjectTopBar';
import SessionPanel from './_components/SessionPanel';
import ChatArea from './_components/ChatArea';
import FilePanel from './_components/FilePanel';
import type { ProjectFile } from '@/lib/types';
import type { AttachedFile } from './_components/ChatInput';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { isAuthenticated } = useAuth();
  const { getProject } = useProjects();
  const chat = useChat();
  const filesCtx = useFiles();
  const fileTree = useFileTree();

  const [filePanelCollapsed, setFilePanelCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [sessionAgentConfirmed, setSessionAgentConfirmed] = useState(false);
  const initRef = useRef(false);

  const project = getProject(projectId);
  const projectSessions = chat.sessions.filter((s) => s.projectId === projectId);
  const projectFiles = filesCtx.getProjectFiles(projectId);
  const currentMessages = chat.activeSessionId ? chat.getSessionMessages(chat.activeSessionId) : [];

  // 认证检查
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [isAuthenticated, router]);

  // 检查当前活跃会话是否已确认专家
  useEffect(() => {
    if (chat.activeSessionId) {
      if (chat.activeSessionId.startsWith('pending-')) {
        // pending 会话：需要确认专家
        setSessionAgentConfirmed(false);
      } else {
        // 已有会话：已确认
        setSessionAgentConfirmed(true);
      }
    }
  }, [chat.activeSessionId]);

  // 初始化会话（仅一次）
  useEffect(() => {
    if (ready && !initRef.current && !chat.activeSessionId) {
      initRef.current = true;
      // 不自动创建会话，等用户点击"新建会话"
    }
  }, [ready, chat.activeSessionId]);

  // 当有新文件生成时，自动同步到文件树
  useEffect(() => {
    projectFiles.forEach((file) => {
      const existsInDocTree = fileTree.docTree.some((n) => n.fileId === file.id);
      const existsInCodeTree = fileTree.codeTree.some((n) => n.fileId === file.id);
      if (!existsInDocTree && !existsInCodeTree) {
        const isCode = file.name.endsWith('.html') || file.name.endsWith('.js') || file.name.endsWith('.css');
        fileTree.addFileNode(null, file.name, file.id, isCode ? 'code' : 'doc');
      }
    });
  }, [projectFiles, fileTree]);

  if (!ready) return null;

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">项目不存在</h2>
          <p className="text-sm text-gray-500 mb-4">该项目可能已被删除</p>
          <button onClick={() => router.push('/workspace')} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            ← 返回工作台
          </button>
        </div>
      </div>
    );
  }

  const handleNewSession = () => {
    // 使用默认产品专家创建 pending 会话
    chat.initPendingSession(projectId, 'agent-product-expert');
  };

  const handleConfirmAgent = (agentId: string) => {
    // 确保 pending 会话存在（如果没有就创建一个）
    const sid = chat.pendingSessionId || chat.initPendingSession(projectId, agentId);
    chat.confirmSessionAgent(sid, agentId);
    setSessionAgentConfirmed(true);
  };

  const handleSend = async (content: string, attachedFiles: AttachedFile[]) => {
    const sessionId = chat.activeSessionId || chat.initPendingSession(projectId, 'agent-product-expert');

    // 文字和附件合并为一条消息发送
    const fileInfos = attachedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));

    await chat.sendMessage(sessionId, content, projectId, fileInfos.length > 0 ? fileInfos : undefined, (f) => filesCtx.addFile(f));
  };

  const handleSaveTempFile = (messageId: string) => {
    const msg = currentMessages.find((m) => m.id === messageId);
    if (msg?.metadata?.fileName && msg?.metadata?.fileType) {
      const saved = filesCtx.saveTempFile(projectId, msg.sessionId, msg.metadata.fileName, msg.metadata.fileType);
      fileTree.addFileNode(null, saved.name, saved.id, 'doc');
    }
  };

  const handleFilePanelUpload = (file: File) => {
    const saved = filesCtx.saveTempFile(projectId, chat.activeSessionId || '', file.name, file.type);
    fileTree.addFileNode(null, saved.name, saved.id, 'doc');
  };

  const handleDownload = (file: ProjectFile) => {
    if (file.content) {
      const blob = new Blob([file.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name; a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(`模拟下载：${file.name}`);
    }
  };

  const handleBatchDownload = (fileIds: string[]) => {
    fileIds.forEach((id) => {
      const f = projectFiles.find((ff) => ff.id === id);
      if (f) handleDownload(f);
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      <ProjectTopBar projectName={project.name} />

      <div className="flex-1 flex min-h-0">
        <SessionPanel
          sessions={projectSessions}
          activeSessionId={chat.activeSessionId}
          pendingSessionId={chat.pendingSessionId}
          onNewSession={handleNewSession}
          onSwitchSession={chat.switchSession}
          onRenameSession={chat.renameSession}
          onDeleteSession={chat.deleteSession}
        />

        <ChatArea
          projectName={project.name}
          messages={currentMessages}
          isStreaming={chat.isStreaming}
          sessionAgentConfirmed={sessionAgentConfirmed}
          onConfirmAgent={handleConfirmAgent}
          onSend={handleSend}
          onSaveTempFile={handleSaveTempFile}
        />

        <FilePanel
          files={projectFiles}
          collapsed={filePanelCollapsed}
          onToggleCollapse={() => setFilePanelCollapsed(!filePanelCollapsed)}
          onUpload={handleFilePanelUpload}
          onDownload={handleDownload}
          onBatchDownload={handleBatchDownload}
        />
      </div>
    </div>
  );
}
