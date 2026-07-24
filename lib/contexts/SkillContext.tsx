'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Skill } from '@/lib/types';
import { MOCK_SKILLS } from '@/lib/mock/skills';

interface SkillContextValue {
  skills: Skill[];
  getSkill: (id: string) => Skill | undefined;
  getSkillsByIds: (ids: string[]) => Skill[];
}

const SkillContext = createContext<SkillContextValue | null>(null);

export function SkillProvider({ children }: { children: ReactNode }) {
  const [skills] = useState<Skill[]>(MOCK_SKILLS);

  const getSkill = useCallback(
    (id: string) => skills.find((s) => s.id === id),
    [skills]
  );

  const getSkillsByIds = useCallback(
    (ids: string[]) => ids.map((id) => skills.find((s) => s.id === id)).filter(Boolean) as Skill[],
    [skills]
  );

  return (
    <SkillContext.Provider value={{ skills, getSkill, getSkillsByIds }}>
      {children}
    </SkillContext.Provider>
  );
}

export function useSkills() {
  const ctx = useContext(SkillContext);
  if (!ctx) throw new Error('useSkills must be used within SkillProvider');
  return ctx;
}
