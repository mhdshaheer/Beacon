'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, KeyRound, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/providers/ToastProvider';

function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('OTP verified! Now set your new password.', 'success');
        setStep('reset');
      } else {
        showToast(data.error || 'Invalid or expired OTP', 'error');
      }
    } catch (err: unknown) {
      console.error('Verify error:', err);
      showToast('An error occurred during verification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Password reset successful! Please login.', 'success');
        router.push('/login');
      } else {
        showToast(data.error || 'Something went wrong', 'error');
      }
    } catch (err: unknown) {
      console.error('Reset error:', err);
      showToast('An error occurred during reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 md:p-10 border border-white/10 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {step === 'verify' ? (
          <motion.form
            key="verify-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleVerifyOtp} 
            className="space-y-6"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-field pl-12 h-14 bg-white/5 border-white/10 focus:border-emerald-500/50 text-center text-2xl tracking-[0.5em] font-black text-emerald-400"
                  placeholder="000000"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-3 text-center italic">Enter the 6-digit code sent to {email}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="reset-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleResetPassword}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-2">
               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Code Verified</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-12 h-12 bg-white/5 border-white/10 focus:border-emerald-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Update Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 scale-110">
             <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Security Check</h1>
          <p className="text-gray-500 text-sm italic">Verification keeps your account safe from unauthorized changes</p>
        </div>

        <Suspense fallback={<div className="glass-card p-12 flex justify-center"><Loader2 className="animate-spin" /></div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em]">
          Beacon Scholarship &bull; Final Security Step
        </div>
      </motion.div>
    </div>
  );
}
