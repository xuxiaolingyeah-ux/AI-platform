'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSkills } from '@/lib/contexts/SkillContext';
import { ArrowLeft, Puzzle } from 'lucide-react';
import MarkdownRenderer from '@/app/project/[id]/_components/MarkdownRenderer';

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getSkill } = useSkills();
  const [checked, setChecked] = useState(false);

  const skill = getSkill(params.id as string);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  if (!checked) return null;

  if (!skill) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Puzzle size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Skill 不存在</h2>
          <p className="text-sm text-gray-500 mt-1">未找到该 Skill 的信息</p>
          <button
            onClick={() => router.push('/skills')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <ArrowLeft size={16} />
            返回 Skill 市场
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
          onClick={() => router.push('/skills')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          返回 Skill 市场
        </button>

        {/* 基本信息卡片 */}
        <div className="bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center border border-indigo-100">
              <Puzzle size={28} className="text-indigo-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>创建人：{skill.createdBy}</span>
                <span>更新：{new Date(skill.updatedAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 具体内容 */}
        <div className="bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">具体内容</h3>
          <div className="relative max-h-[420px] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-4 scrollbar-thin">
            <div className="prose prose-sm prose-gray max-w-none">
              <MarkdownRenderer content={skill.content} />
            </div>
            <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none -mb-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
