// ============================================================
// 用户
// ============================================================
export interface User {
  id: string;
  username: string;
  password: string; // Demo 明文
  avatar?: string;
}

// ============================================================
// 项目
// ============================================================
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 会话
// ============================================================
export interface Session {
  id: string;
  projectId: string;
  title: string;
  agentId?: string;           // 绑定的专家 ID（首条消息后锁定）
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Agent 对话阶段
// ============================================================
export type AgentStage = 'clarify' | 'analysis' | 'prd' | 'review' | 'complete';

export const STAGE_LABELS: Record<AgentStage, string> = {
  clarify: '需求澄清',
  analysis: '竞品分析',
  prd: 'PRD 撰写',
  review: '评审清单',
  complete: '已完成',
};

export const STAGE_ORDER: AgentStage[] = ['clarify', 'analysis', 'prd', 'review', 'complete'];

// ============================================================
// 消息
// ============================================================
export type MessageType = 'text' | 'document' | 'tempFile';

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'agent';
  content: string;
  type: MessageType;
  metadata?: {
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    stage?: AgentStage;
    docId?: string;
    attachedFiles?: string;   // JSON string of { name, size, type }[]
  };
  createdAt: string;
}

// ============================================================
// 文件
// ============================================================
export type FileSource = 'agent' | 'user_upload' | 'github_sync';

export interface ProjectFile {
  id: string;
  projectId: string;
  sessionId?: string;
  name: string;
  type: string;
  content?: string;
  source: FileSource;
  githubSynced: boolean;
  createdAt: string;
}

// ============================================================
// 专家 Agent
// ============================================================
export interface Agent {
  id: string;
  name: string;
  description: string;
  roleCapability: string;    // Markdown 长文本 — 角色能力描述
  relatedSkillIds: string[]; // 关联的 Skill ID 列表
  modelConfig: string;       // 模型配置，如 "deepseek-v4-pro"
  createdBy: string;
  updatedAt: string;
}

// ============================================================
// Skill
// ============================================================
export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;           // Markdown 长文本 — 具体内容
  createdBy: string;
  updatedAt: string;
}

// ============================================================
// 文件树节点
// ============================================================
export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;   // null = 根目录
  fileId?: string;           // 如果是文件节点，关联 ProjectFile.id
  projectId: string;         // 所属项目 ID，用于隔离不同项目的文件树
}

// ============================================================
// GitHub
// ============================================================
export interface GitHubRepo {
  owner: string;
  repo: string;
  branch: string;
}

export interface GitHubFileItem {
  name: string;
  path: string;
  type: string;
}
