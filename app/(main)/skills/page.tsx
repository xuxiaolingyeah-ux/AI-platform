'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSkills } from '@/lib/contexts/SkillContext';
import { Puzzle, ArrowRight } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';

export default function SkillsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { skills } = useSkills();
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Skill 市场</h2>
          <p className="text-sm text-gray-500 mt-1">浏览可用的 AI 技能，了解每个 Skill 的功能和使用方式</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => router.push(`/skills/${skill.id}`)}
              className="group bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center border border-indigo-100">
                  <Puzzle size={24} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">{skill.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-indigo-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{skill.createdBy}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(skill.updatedAt)}</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
