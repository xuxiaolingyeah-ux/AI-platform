'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ProjectProvider } from '@/lib/contexts/ProjectContext';
import { ChatProvider } from '@/lib/contexts/ChatContext';
import { FileProvider } from '@/lib/contexts/FileContext';
import { AgentProvider } from '@/lib/contexts/AgentContext';
import { SkillProvider } from '@/lib/contexts/SkillContext';
import { FileTreeProvider } from '@/lib/contexts/FileTreeContext';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AgentProvider>
          <SkillProvider>
            <ChatProvider>
              <FileProvider>
                <FileTreeProvider>
                  {children}
                </FileTreeProvider>
              </FileProvider>
            </ChatProvider>
          </SkillProvider>
        </AgentProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}
