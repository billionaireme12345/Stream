import { useState } from 'react';
import { Eye, EyeOff, Smartphone, Lock, Play } from 'lucide-react';
import usersData from '@/data/users.json';
import settingsData from '@/data/settings.json';
import { setSession } from '@/store/useStore';
import type { User } from '@/types';

const users = usersData as User[];

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for UX
    await new Promise(r => setTimeout(r, 800));

    const user = users.find(u => u.mobile === mobile && u.password === password && u.status === 'active');

    if (user) {
      setSession({ userId: user.id, name: user.name, mobile: user.mobile });
      onLogin();
    } else {
      // Redirect to Google on failed login
      window.location.href = settingsData.redirectOnFailedLogin;
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg shadow-primary/30">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">StreamVault</h1>
          <p className="text-text-secondary mt-1">Private Premium Streaming</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-2xl border border-border p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">Sign in to access your content</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Mobile Number</label>
              <div className="relative">
                <Smartphone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => { setMobile(e.target.value); setError(''); }}
                  placeholder="Enter mobile number"
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-light border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3.5 bg-surface-light border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !mobile || !password}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:from-primary-light hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-text-muted text-xs">
              This is an invitation-only platform. Contact the administrator for access.
            </p>
          </div>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          © 2025 StreamVault. All rights reserved.
        </p>
      </div>
    </div>
  );
}
