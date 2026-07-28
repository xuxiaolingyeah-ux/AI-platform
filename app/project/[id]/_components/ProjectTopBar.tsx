'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProjectTopBarProps {
  projectName: string;
}

export default function ProjectTopBar({ projectName }: ProjectTopBarProps) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    router.replace('/login');
  };

  return (
    <header className="h-12 glass border-b border-blue-100/30 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="返回工作台"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">返回工作台</span>
        </button>
        <div className="w-px h-5 bg-blue-100" />
        <h1 className="font-semibold text-gray-900 text-sm truncate max-w-[300px]">
          {projectName}
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white text-[10px] font-semibold">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:inline">{currentUser?.username}</span>
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute top-full right-0 mt-1 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-36 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                退出登录
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
