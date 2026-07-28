'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useAgents } from '@/lib/contexts/AgentContext';
import { useSkills } from '@/lib/contexts/SkillContext';
import { ArrowLeft, Bot, Puzzle, Cpu } from 'lucide-react';
import MarkdownRenderer from '@/app/project/[id]/_components/MarkdownRenderer';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getAgent } = useAgents();
  const { getSkillsByIds } = useSkills();
  const [checked, setChecked] = useState(false);

  const agent = getAgent(params.id as string);
  const relatedSkills = agent ? getSkillsByIds(agent.relatedSkillIds) : [];

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  if (!checked) return null;

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bot size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">专家不存在</h2>
          <p className="text-sm text-gray-500 mt-1">未找到该专家的信息</p>
          <button
            onClick={() => router.push('/agents')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft size={16} />
            返回专家市场
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/agents')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          返回专家市场
        </button>

        {/* 基本信息卡片 */}
        <div className="bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>创建人：{agent.createdBy}</span>
                <span>更新：{new Date(agent.updatedAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 模型配置 */}
        <div className="bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">模型配置</h3>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-sm text-blue-600 font-medium">
            {agent.modelConfig}
          </div>
        </div>

        {/* 角色能力描述 */}
        <div className="bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">角色能力描述</h3>
          <div className="relative max-h-[420px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-4 scrollbar-thin">
            <div className="prose prose-sm prose-gray max-w-none">
              <MarkdownRenderer content={agent.roleCapability} />
            </div>
            <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none -mb-4" />
          </div>
        </div>

        {/* 关联 Skill */}
        <div className="bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Puzzle size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900 text-lg">关联 Skill</h3>
            <span className="text-xs text-gray-400">({relatedSkills.length})</span>
          </div>

          {relatedSkills.length === 0 ? (
            <p className="text-sm text-gray-400">暂无关联 Skill</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-100"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Puzzle size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{skill.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
