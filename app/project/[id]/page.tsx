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
  const archiveFiles = filesCtx.getArchiveFiles(projectId);
  const draftFiles = chat.activeSessionId
    ? filesCtx.getDraftFiles(projectId, chat.activeSessionId)
    : [];
  /** 可引用的文档 = 归档区 + 当前会话草稿区 */
  const availableDocs = [...archiveFiles, ...draftFiles];
  const currentMessages = chat.activeSessionId ? chat.getSessionMessages(chat.activeSessionId) : [];

  // 认证检查
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [isAuthenticated, router]);

  // 进入项目时，校验 activeSessionId 是否属于当前项目
  useEffect(() => {
    if (!ready) return;
    // 当前活跃会话不属于本项目 → 清空并自动选本项目第一个会话
    if (chat.activeSessionId) {
      const belongsToProject = projectSessions.some((s) => s.id === chat.activeSessionId);
      if (!belongsToProject) {
        if (projectSessions.length > 0) {
          chat.switchSession(projectSessions[0].id);
        } else {
          // 没有会话则触发新建
          handleNewSession();
        }
      }
    } else {
      // 无活跃会话 → 选第一个或新建
      if (projectSessions.length > 0) {
        chat.switchSession(projectSessions[0].id);
      } else {
        handleNewSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, projectId]);

  // 检查当前活跃会话是否已确认专家
  useEffect(() => {
    if (chat.activeSessionId) {
      if (chat.activeSessionId.startsWith('pending-')) {
        setSessionAgentConfirmed(false);
      } else {
        setSessionAgentConfirmed(true);
      }
    }
  }, [chat.activeSessionId]);

  // 初始化会话（仅一次）
  useEffect(() => {
    if (ready && !initRef.current && !chat.activeSessionId) {
      initRef.current = true;
    }
  }, [ready, chat.activeSessionId]);

  // 当有新文件生成时，自动同步到归档树
  useEffect(() => {
    const projectArchiveTree = fileTree.getProjectArchiveTree(projectId);
    archiveFiles.forEach((file) => {
      const existsInArchiveTree = projectArchiveTree.some((n) => n.fileId === file.id);
      if (!existsInArchiveTree) {
        fileTree.addFileNode(null, file.name, file.id, 'archive', projectId);
      }
    });
  }, [archiveFiles, fileTree, projectId]);

  if (!ready) return null;

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">项目不存在</h2>
          <p className="text-sm text-gray-500 mb-4">该项目可能已被删除</p>
          <button onClick={() => router.push('/workspace')} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            ← 返回工作台
          </button>
        </div>
      </div>
    );
  }

  const handleNewSession = () => {
    chat.initPendingSession(projectId, 'agent-product-expert');
  };

  const handleConfirmAgent = (agentId: string) => {
    const sid = chat.pendingSessionId || chat.initPendingSession(projectId, agentId);
    chat.confirmSessionAgent(sid, agentId);
    setSessionAgentConfirmed(true);
  };

  const handleSend = async (content: string, attachedFiles: AttachedFile[], referencedDocs?: { fileId: string; name: string }[]) => {
    const sessionId = chat.activeSessionId || chat.initPendingSession(projectId, 'agent-product-expert');

    const fileInfos = attachedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));

    // 如果引用了文档，将文档内容拼接到消息中
    let finalContent = content;
    if (referencedDocs && referencedDocs.length > 0) {
      const docContents = referencedDocs
        .map((ref) => {
          const doc = projectFiles.find((f) => f.id === ref.fileId);
          if (doc?.content) {
            return `[文档: ${doc.name}]\n${doc.content}`;
          }
          return `[文档: ${ref.name}]`;
        })
        .filter(Boolean)
        .join('\n\n---\n\n');
      finalContent = content
        ? `${content}\n\n--- 引用文档 ---\n\n${docContents}`
        : `请阅读以下文档：\n\n${docContents}`;
    }

    await chat.sendMessage(sessionId, finalContent, projectId, fileInfos.length > 0 ? fileInfos : undefined, (f) => filesCtx.addFile(f));
  };

  const handleSaveTempFile = (messageId: string) => {
    const msg = currentMessages.find((m) => m.id === messageId);
    if (msg?.metadata?.fileName && msg?.metadata?.fileType) {
      const saved = filesCtx.saveTempFile(projectId, msg.sessionId, msg.metadata.fileName, msg.metadata.fileType);
      fileTree.addFileNode(null, saved.name, saved.id, 'archive', projectId);
    }
  };

  const handleFilePanelUpload = (file: File) => {
    const saved = filesCtx.saveTempFile(projectId, chat.activeSessionId || '', file.name, file.type);
    fileTree.addFileNode(null, saved.name, saved.id, 'archive', projectId);
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

  /** 归档草稿文件：复制一份到归档区（新 ID），原草稿保留 */
  const handleArchiveFile = (fileId: string) => {
    const newFile = filesCtx.archiveFile(fileId);
    if (newFile) {
      fileTree.addFileNode(null, newFile.name, newFile.id, 'archive', projectId);
    }
  };

  /** 删除会话时同时清理其草稿文件 */
  const handleDeleteSession = (sessionId: string) => {
    filesCtx.removeSessionDrafts(sessionId);
    chat.deleteSession(sessionId);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <ProjectTopBar projectName={project.name} />

      <div className="flex-1 flex min-h-0">
        <SessionPanel
          sessions={projectSessions}
          activeSessionId={chat.activeSessionId}
          pendingSessionId={chat.pendingSessionId}
          onNewSession={handleNewSession}
          onSwitchSession={chat.switchSession}
          onRenameSession={chat.renameSession}
          onDeleteSession={handleDeleteSession}
        />

        <ChatArea
          projectName={project.name}
          messages={currentMessages}
          isStreaming={chat.isStreaming}
          sessionAgentConfirmed={sessionAgentConfirmed}
          onConfirmAgent={handleConfirmAgent}
          onSend={handleSend}
          onSaveTempFile={handleSaveTempFile}
          availableDocs={availableDocs}
        />

        <FilePanel
          projectId={projectId}
          files={projectFiles}
          archiveFiles={archiveFiles}
          draftFiles={draftFiles}
          collapsed={filePanelCollapsed}
          onToggleCollapse={() => setFilePanelCollapsed(!filePanelCollapsed)}
          onUpload={handleFilePanelUpload}
          onDownload={handleDownload}
          onBatchDownload={handleBatchDownload}
          onArchiveFile={handleArchiveFile}
        />
      </div>
    </div>
  );
}
