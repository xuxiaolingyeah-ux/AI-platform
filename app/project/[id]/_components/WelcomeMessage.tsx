'use client';

import { useState } from 'react';
import { Zap, Bot, Cpu, ChevronRight } from 'lucide-react';
import type { Agent } from '@/lib/types';
import { useAgents } from '@/lib/contexts/AgentContext';

interface WelcomeMessageProps {
  projectName: string;
  onConfirm: (agentId: string) => void;
}

export default function WelcomeMessage({ projectName, onConfirm }: WelcomeMessageProps) {
  const { agents } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center mb-5 shadow-xl shadow-indigo-500/20">
        <Zap size={30} className="text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        欢迎来到「{projectName}」
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        在开始之前，请选择本次会话使用的专家
      </p>

      {/* 专家选择列表 */}
      <div className="w-full max-w-md space-y-2 mb-8">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-50/60 shadow-md shadow-indigo-500/10'
                  : 'border-gray-100 bg-white/60 hover:border-gray-200 hover:bg-white'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20'
                  : 'bg-gray-100'
              }`}>
                <Bot size={20} className={isSelected ? 'text-white' : 'text-gray-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {agent.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {agent.modelConfig}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{agent.description}</p>
              </div>
              <div className={`flex-shrink-0 mt-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-gray-300'
              }`}>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 确认按钮 */}
      <button
        onClick={() => onConfirm(selectedAgentId)}
        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/20 transition-all duration-200"
      >
        开始对话
        <ChevronRight size={16} />
      </button>

      {/* 提示 */}
      <p className="text-xs text-gray-400 mt-4">
        选择后，本次会话将锁定该专家，后续不可切换
      </p>
    </div>
  );
}
