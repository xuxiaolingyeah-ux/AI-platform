'use client';

import { useState } from 'react';
import { useAgents } from '@/lib/contexts/AgentContext';
import { Bot, ChevronDown } from 'lucide-react';

export default function ExpertSelector() {
  const { agents, selectedAgent, selectAgent } = useAgents();
  const [open, setOpen] = useState(false);

  if (agents.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
      >
        <Bot size={14} />
        <span>{selectedAgent?.name || '选择专家'}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 z-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[200px] overflow-hidden">
            {agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  selectAgent(agent.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bot size={15} />
                <div className="text-left">
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs text-gray-400">{agent.modelConfig}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
