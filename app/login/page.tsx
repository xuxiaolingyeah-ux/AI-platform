'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { User, Lock, ArrowRight, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    <div className="min-h-screen flex relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover,
        .login-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(15, 23, 42, 0.5) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}} />
      {/* ===== 全屏背景图 ===== */}
      <div className="absolute inset-0 z-0">
        <img
          src="/login-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* ===== 左侧品牌区 ===== */}
      <div className="relative z-10 flex-1 flex">
        <div
          className={`px-12 lg:px-20 pt-12 lg:pt-16 transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Logo + 标题 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white/80 text-2xl font-bold tracking-wider uppercase">
              Oceanus
            </span>
          </div>

          <p className="text-lg text-white/70 leading-relaxed max-w-md mt-8">
            让专业能力，成为可执行的组织资产
          </p>

          {/* 底部细线装饰 */}
          <div className="mt-12 flex items-center gap-3">
            <div className="w-12 h-px bg-gradient-to-r from-blue-400/60 to-transparent" />
            <div className="w-16 h-px bg-gradient-to-r from-blue-400/30 to-transparent" />
          </div>
        </div>
      </div>

      {/* ===== 右侧登录表单区 ===== */}
      <div className="relative z-10 w-full max-w-[520px] flex items-center justify-center p-8">
        <div
          className={`w-full max-w-[360px] transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* 表单容器 — 极淡的玻璃效果 */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 用户名 */}
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <User size={16} />
                  </div>
                  <input
                    className="login-input w-full pl-10 pr-4 py-3 text-sm border rounded-xl text-white placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderColor: 'rgba(100, 116, 139, 0.45)' }}
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm text-white/50 mb-2 font-medium">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    className="login-input w-full pl-10 pr-4 py-3 text-sm border rounded-xl text-white placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderColor: 'rgba(100, 116, 139, 0.45)' }}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-lg flex items-center gap-2">
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
                className="w-full group mt-3"
              >
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl
                  bg-gradient-to-r from-blue-600 to-blue-500 text-white
                  hover:from-blue-500 hover:to-blue-400
                  active:scale-[0.985]
                  shadow-[0_4px_16px_rgba(59,130,246,0.3)]
                  hover:shadow-[0_6px_24px_rgba(59,130,246,0.45)]
                  transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-500 disabled:active:scale-100
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
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* 底部提示 */}
            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <p className="text-center text-xs text-white/20">
                Demo: pm / 123456
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
