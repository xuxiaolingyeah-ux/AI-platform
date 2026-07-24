'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Agent } from '@/lib/types';
import { MOCK_AGENTS } from '@/lib/mock/agents';

interface AgentContextValue {
  agents: Agent[];
  selectedAgentId: string | null;
  selectedAgent: Agent | null;
  getAgent: (id: string) => Agent | undefined;
  selectAgent: (id: string) => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents] = useState<Agent[]>(MOCK_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(MOCK_AGENTS[0]?.id || null);

  const getAgent = useCallback(
    (id: string) => agents.find((a) => a.id === id),
    [agents]
  );

  const selectAgent = useCallback((id: string) => {
    setSelectedAgentId(id);
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;

  return (
    <AgentContext.Provider
      value={{ agents, selectedAgentId, selectedAgent, getAgent, selectAgent }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgents must be used within AgentProvider');
  return ctx;
}
