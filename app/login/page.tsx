'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Zap, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      router.replace('/workspace');
    } else {
      setError(result.error || '用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f7f8fc]">
      {/* ===== 背景几何装饰 ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 右上大光晕 — 柔和弥漫 */}
        <div
          className="absolute -top-32 -right-32 w-[640px] h-[640px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)',
          }}
        />
        {/* 左下光晕 */}
        <div
          className="absolute -bottom-24 -left-24 w-[560px] h-[560px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)',
          }}
        />

        {/* 水平细线 — 科技感的关键 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200/40 to-transparent" />

        {/* 几条极淡的几何线 */}
        <div className="absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" />
        <div className="absolute bottom-[28%] left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent" />

        {/* 左侧竖线 */}
        <div className="absolute left-[12%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-100/50 to-transparent" />
        {/* 右侧竖线 */}
        <div className="absolute right-[12%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-100/50 to-transparent" />

        {/* 左下角小装饰 — 两条短线构成 L 形 */}
        <div className="absolute bottom-20 left-20 w-8 h-px bg-indigo-300/40" />
        <div className="absolute bottom-20 left-20 w-px h-8 bg-indigo-300/40" />

        {/* 右上角小装饰 */}
        <div className="absolute top-20 right-20 w-8 h-px bg-indigo-300/40" />
        <div className="absolute top-20 right-20 w-px h-8 bg-indigo-300/40" />

        {/* 极淡网格 */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* ===== 主内容区 ===== */}
      <div className={`relative z-10 w-full max-w-[400px] mx-auto px-6 transition-all duration-1000 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={22} className="text-white" />
            </div>
          </div>

          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">DeepStorm</h1>

          <p className="mt-4 text-[15px] text-gray-400 leading-relaxed">
            让 AI 成为你的
            <span className="text-indigo-500 font-medium"> 数字分身</span>
            <span
              className="inline-block w-[2px] h-[17px] bg-indigo-400 ml-1 align-middle transition-opacity"
              style={{ opacity: cursorVisible ? 1 : 0 }}
            />
          </p>
        </div>

        {/* 登录卡片 — 干净的白卡 + 精准阴影 */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(99,102,241,0.06),0_24px_60px_rgba(99,102,241,0.04)] border border-gray-100/80">
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">欢迎回来</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 用户名 */}
              <div>
                <div className="relative">
                  <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'username' ? 'text-indigo-500' : 'text-gray-300'
                  }`}>
                    <User size={15} />
                  </div>
                  <input
                    className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-300 outline-none transition-all duration-300 ${
                      focusedField === 'username'
                        ? 'border-indigo-300 bg-white shadow-[0_0_0_3px_rgba(99,102,241,0.06)]'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    autoFocus
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <div className="relative">
                  <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-indigo-500' : 'text-gray-300'
                  }`}>
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-300 outline-none transition-all duration-300 ${
                      focusedField === 'password'
                        ? 'border-indigo-300 bg-white shadow-[0_0_0_3px_rgba(99,102,241,0.06)]'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="text-[13px] text-red-500 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg animate-fade-in flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group mt-1"
              >
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl
                  bg-gray-900 text-white
                  hover:bg-gray-800
                  active:scale-[0.985]
                  transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:active:scale-100
                ">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      验证中...
                    </>
                  ) : (
                    <>
                      登 录
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* 底部提示 */}
            <div className="pt-1">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] text-gray-300 whitespace-nowrap">
                  Demo: pm / 123456
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <p className="text-center text-[11px] text-gray-300 mt-8">
          &copy; 2025 DeepStorm &middot; AI Product Workbench
        </p>
      </div>
    </div>
  );
}
