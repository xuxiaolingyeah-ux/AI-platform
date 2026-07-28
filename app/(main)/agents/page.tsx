'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useAgents } from '@/lib/contexts/AgentContext';
import { Bot, ArrowRight } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';

export default function AgentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { agents } = useAgents();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  if (!checked) return null;

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">专家市场</h2>
          <p className="text-sm text-gray-500 mt-1">选择适合的 AI 专家，加速你的产品工作流</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => router.push(`/agents/${agent.id}`)}
              className="group bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">{agent.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{agent.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{agent.createdBy}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(agent.updatedAt)}</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
