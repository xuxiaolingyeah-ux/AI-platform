'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Zap, Bot, Puzzle, LayoutDashboard, ChevronDown, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  {
    section: 'market',
    items: [
      { icon: Bot, label: '专家市场', href: '/agents' },
      { icon: Puzzle, label: 'Skill 市场', href: '/skills' },
    ],
  },
  {
    section: 'workspace',
    label: '工作台',
    items: [
      { icon: LayoutDashboard, label: '工作台', href: '/workspace' },
    ],
  },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    router.replace('/login');
  };

  return (
    <div className="h-full flex">
      {/* ===== 左侧侧边栏 ===== */}
      <aside className="w-56 flex-shrink-0 bg-white/60 backdrop-blur-xl border-r border-blue-100/50 flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Zap size={16} />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">Oceanus</span>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="px-5 py-2">
          <div className="h-px bg-gradient-to-r from-blue-100/50 to-transparent" />
        </div>

        {/* 导航 */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              {group.label && (
                <div className="px-3 mb-1.5">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => router.push(item.href)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon size={17} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* ===== 右侧内容区 ===== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* 顶部用户栏（右上角） */}
        <div className="h-12 flex items-center justify-end px-6 border-b border-blue-100/30 bg-white/40 backdrop-blur-sm flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white text-[10px] font-semibold">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span>{currentUser?.username}</span>
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
        </div>

        {/* 页面内容 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
