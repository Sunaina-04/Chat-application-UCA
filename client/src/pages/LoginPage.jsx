import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';

export const LoginPage = () => {
  const { login, demoLogin, demoUsers } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(emailOrUsername, password);
      navigate('/chats');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (userId) => {
    setError('');
    setIsLoading(true);
    try {
      await demoLogin(userId);
      navigate('/chats');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))] flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Decorative ambient glowing circles */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-chatdark-card/80 backdrop-blur-xl border border-chatdark-border rounded-3xl p-8 shadow-2xl z-10 animate-slide-up">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-glow-brand mb-3">
            <Sparkles className="w-7 h-7 animate-pulse-subtle" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">ChatSpace</h1>
          <p className="text-xs text-slate-400 mt-1">Real-Time Topic-Based Workspace & Personal Messaging</p>
        </div>

        {/* 1-Click Quick Demo Sign-In Bar (Highlight of Demo Mode) */}
        <div className="mb-6 p-3.5 bg-chatdark-sidebar/90 border border-brand-500/30 rounded-2xl shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Accounts</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Instant Test</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(demoUsers.length > 0 ? demoUsers : [
              { _id: 'user_soham', username: 'Soham', bio: 'CSE Owner' },
              { _id: 'user_rahul', username: 'Rahul', bio: 'Admin' },
              { _id: 'user_aman', username: 'Aman', bio: 'Backend' },
              { _id: 'user_priya', username: 'Priya', bio: 'Design' },
            ]).map((demo) => (
              <button
                key={demo._id}
                type="button"
                onClick={() => handleDemoSignIn(demo._id)}
                className="flex items-center gap-2 p-2 rounded-xl bg-chatdark-card hover:bg-brand-600/30 border border-chatdark-border/80 hover:border-brand-500/60 transition-all text-left group"
              >
                <Avatar src={demo.avatar} name={demo.username} size="xs" />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-brand-300 truncate">
                    {demo.username}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{demo.bio || 'Member'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 text-center">
            {error}
          </div>
        )}

        {/* Traditional Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="soham@chatspace.dev or Soham"
                className="w-full bg-chatdark-sidebar border border-chatdark-border focus:border-brand-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-chatdark-sidebar border border-chatdark-border focus:border-brand-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl shadow-glow-brand transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-bold hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
