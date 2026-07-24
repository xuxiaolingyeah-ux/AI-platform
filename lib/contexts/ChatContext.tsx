'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { Session, Message, AgentStage, ProjectFile } from '@/lib/types';
import { generateId } from '@/lib/utils/id';
import { nowISO } from '@/lib/utils/date';
import { getAgentReply, getDocumentForStage, STAGE_DOC_NAMES } from '@/lib/mock/agent-flow';
import { simulateStream } from '@/lib/utils/mock-sse';

interface ChatState {
  sessions: Session[];
  messages: Message[];
  activeSessionId: string | null;
  isStreaming: boolean;
  pendingSessionId: string | null;
  pendingSessionAgentId: string | null;
  // 操作
  initPendingSession: (projectId: string, agentId: string) => string;
  confirmSessionAgent: (sessionId: string, agentId: string) => void;
  getSessionAgentId: (sessionId: string) => string | undefined;
  sendMessage: (
    sessionId: string,
    content: string,
    projectId: string,
    attachedFiles?: { name: string; size: string; type: string }[],
    onFileGenerated?: (file: ProjectFile) => void
  ) => Promise<void>;
  switchSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  getSessionMessages: (sessionId: string) => Message[];
  getSessionMessageCount: (sessionId: string) => number;
  addTempFileMessage: (sessionId: string, fileName: string, fileType: string) => void;
}

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useLocalStorage<Session[]>('pm-workbench-sessions', []);
  const [messages, setMessages] = useLocalStorage<Message[]>('pm-workbench-messages', []);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [pendingSessionAgentId, setPendingSessionAgentId] = useState<string | null>(null);
  const streamRef = useRef<{ stop: () => void } | null>(null);

  const initPendingSession = useCallback(
    (projectId: string, agentId: string): string => {
      const tempId = `pending-${generateId()}`;
      setPendingSessionId(tempId);
      setPendingSessionAgentId(agentId);
      setActiveSessionId(tempId);
      return tempId;
    },
    []
  );

  const confirmSessionAgent = useCallback(
    (sessionId: string, agentId: string) => {
      // 更新 pending 状态
      setPendingSessionAgentId(agentId);
    },
    []
  );

  const getSessionAgentId = useCallback(
    (sessionId: string): string | undefined => {
      const session = sessions.find((s) => s.id === sessionId);
      return session?.agentId;
    },
    [sessions]
  );

  const switchSession = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId);
      setPendingSessionId(null);
      setPendingSessionAgentId(null);
    },
    []
  );

  const sendMessage = useCallback(
    async (
      sessionId: string,
      content: string,
      projectId: string,
      attachedFiles?: { name: string; size: string; type: string }[],
      onFileGenerated?: (file: ProjectFile) => void
    ) => {
      // 1. 添加用户消息（文字+附件合并为一条）
      const displayContent = content.trim() || (attachedFiles && attachedFiles.length > 0 ? `发送了 ${attachedFiles.length} 个文件` : '');
      const userMsg: Message = {
        id: generateId(),
        sessionId,
        role: 'user',
        content: displayContent,
        type: 'text',
        metadata: attachedFiles && attachedFiles.length > 0 ? {
          attachedFiles: JSON.stringify(attachedFiles),
        } : undefined,
        createdAt: nowISO(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // 统计用户消息数来确定内部阶段
      const allMsgs = [...messages, userMsg];
      const sessionMsgs = allMsgs.filter((m) => m.sessionId === sessionId);
      const userMsgCount = sessionMsgs.filter((m) => m.role === 'user').length;

      // 如果是 pending 会话的首条消息，正式创建（锁定 agentId）
      if (sessionId.startsWith('pending-')) {
        const title = content.slice(0, 20) + (content.length > 20 ? '...' : '');
        const agentId = pendingSessionAgentId || 'agent-product-expert';
        const session: Session = {
          id: sessionId,
          projectId,
          title,
          agentId,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        setSessions((prev) => [session, ...prev]);
        setPendingSessionId(null);
        setPendingSessionAgentId(null);
      } else {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, updatedAt: nowISO() } : s))
        );
      }

      // 2. 确定内部阶段（不对外暴露）
      const stages: AgentStage[] = ['clarify', 'analysis', 'prd', 'review', 'complete'];
      const stage = stages[Math.min(userMsgCount, stages.length - 1)];

      const agentReply = getAgentReply(stage);

      // 3. 创建 Agent 消息（流式填充）
      const agentMsgId = generateId();
      const agentMsg: Message = {
        id: agentMsgId,
        sessionId,
        role: 'agent',
        content: '',
        type: 'text',
        createdAt: nowISO(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsStreaming(true);

      // 4. 模拟流式输出
      await new Promise<void>((resolve) => {
        streamRef.current = simulateStream(
          agentReply,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentMsgId ? { ...m, content: m.content + chunk } : m
              )
            );
          },
          () => {
            setIsStreaming(false);
            resolve();
          },
          { speed: 25, chunkSize: 3 }
        );
      });

      // 5. 检查是否需要产出文档
      const docStageMap: Partial<Record<AgentStage, AgentStage>> = {
        analysis: 'clarify',
        prd: 'analysis',
        review: 'prd',
        complete: 'review',
      };

      if (stage !== 'clarify') {
        const docStage = docStageMap[stage];
        if (docStage && onFileGenerated) {
          const docName = STAGE_DOC_NAMES[docStage];
          const docContent = getDocumentForStage(docStage);
          if (docName && docContent) {
            const file: ProjectFile = {
              id: generateId(),
              projectId,
              sessionId,
              name: docName,
              type: 'md',
              content: docContent,
              source: 'agent',
              githubSynced: false,
              createdAt: nowISO(),
            };
            onFileGenerated(file);

            const docMsg: Message = {
              id: generateId(),
              sessionId,
              role: 'agent',
              content: `已生成文档：${docName}`,
              type: 'document',
              metadata: { docId: file.id, fileName: docName },
              createdAt: nowISO(),
            };
            setMessages((prev) => [...prev, docMsg]);
          }
        }
      }
    },
    [messages, setMessages, setSessions, pendingSessionAgentId]
  );

  const renameSession = useCallback(
    (sessionId: string, title: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title, updatedAt: nowISO() } : s))
      );
    },
    [setSessions]
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setMessages((prev) => prev.filter((m) => m.sessionId !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setPendingSessionId(null);
        setPendingSessionAgentId(null);
      }
    },
    [setSessions, setMessages, activeSessionId]
  );

  const getSessionMessages = useCallback(
    (sessionId: string) => messages.filter((m) => m.sessionId === sessionId),
    [messages]
  );

  const getSessionMessageCount = useCallback(
    (sessionId: string) => messages.filter((m) => m.sessionId === sessionId).length,
    [messages]
  );

  const addTempFileMessage = useCallback(
    (sessionId: string, fileName: string, fileType: string) => {
      const msg: Message = {
        id: generateId(),
        sessionId,
        role: 'user',
        content: `上传了文件：${fileName}`,
        type: 'tempFile',
        metadata: { fileName, fileType },
        createdAt: nowISO(),
      };
      setMessages((prev) => [...prev, msg]);
    },
    [setMessages]
  );

  return (
    <ChatContext.Provider
      value={{
        sessions,
        messages,
        activeSessionId,
        isStreaming,
        pendingSessionId,
        pendingSessionAgentId,
        initPendingSession,
        confirmSessionAgent,
        getSessionAgentId,
        sendMessage,
        switchSession,
        renameSession,
        deleteSession,
        getSessionMessages,
        getSessionMessageCount,
        addTempFileMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatState {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
