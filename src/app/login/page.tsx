'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || 'Invalid credentials. Please try again.');
        setLoading(false);
      } else {
        // Redirect will happen after state update if we don't do it here
        // But since redirect is false, we must handle it
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 md:p-10 border border-white/10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-12 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-12 pr-12 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-400 hover:underline font-semibold">
              Register Now
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 scale-110">
             <UserIcon className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm italic">"Only dedication matters"</p>
        </div>

        <Suspense fallback={<div className="glass-card p-12 flex justify-center"><Loader2 className="animate-spin" /></div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em]">
          Beacon Scholarship &copy; 2026 &bull; Secure Access
        </div>
      </motion.div>
    </div>
  );
}
