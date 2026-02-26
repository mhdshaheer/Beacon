'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Eye, 
  XCircle, 
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  CreditCard,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    } else if (status === 'unauthenticated') {
       window.location.href = '/login';
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/user/dashboard');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved': return { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, label: 'Approved', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'rejected': return { icon: <XCircle className="w-5 h-5 text-red-500" />, label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10' };
      case 'viewed': return { icon: <Eye className="w-5 h-5 text-blue-400" />, label: 'Viewed', color: 'text-blue-400', bg: 'bg-blue-400/10' };
      default: return { icon: <Clock className="w-5 h-5 text-amber-500" />, label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const application = data?.application;
  const payments = data?.payments || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background decor */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-bold text-gradient">Beacon Hub</span>
         </div>
         <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <UserIcon className="w-4 h-4 text-emerald-400" />
               </div>
               <span className="text-sm font-medium text-gray-300">{session?.user?.name}</span>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-400"
            >
               <LogOut className="w-5 h-5" />
            </button>
         </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Dashboard Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome Back, {session?.user?.name?.split(' ')[0]}!</h2>
                  <p className="text-gray-500">Track and manage your scholarship applications.</p>
               </div>
               {!application && (
                  <Link href="/dashboard/apply" className="btn-primary flex items-center gap-2 shadow-xl shadow-emerald-500/20">
                    <Plus className="w-5 h-5" /> Start Application
                  </Link>
               )}
            </div>

            {/* Application Status Card */}
            <div className="glass-card p-8 border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                  <h3 className="text-xl font-bold">Registration Status</h3>
                  {application ? (
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusInfo(application.approvalStatus).bg} ${getStatusInfo(application.approvalStatus).color} text-xs font-bold uppercase tracking-widest`}>
                       {getStatusInfo(application.approvalStatus).icon}
                       {getStatusInfo(application.approvalStatus).label}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600 font-bold uppercase tracking-widest italic">No Active Application</span>
                  )}
               </div>

               {application ? (
                 <div className="space-y-10">
                    {/* Status Tracker */}
                    <div className="relative">
                       <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                       <div 
                         className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-1000"
                         style={{ 
                           width: ['approved', 'rejected'].includes(application.approvalStatus) ? '100%' : 
                                  application.approvalStatus === 'viewed' ? '50%' : '15%' 
                         }}
                       />
                       <div className="relative flex justify-between">
                          {[
                            { step: 'Pending', active: true, done: application.approvalStatus !== 'pending' },
                            { step: 'Viewed', active: application.approvalStatus !== 'pending', done: ['approved', 'rejected'].includes(application.approvalStatus) },
                            { step: 'Final Result', active: ['approved', 'rejected'].includes(application.approvalStatus), done: false }
                          ].map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-[#080808] transition-all duration-500 ${
                                 s.done ? 'bg-emerald-500 border-emerald-500' : 
                                 s.active ? 'border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20' : 'border-white/10'
                               }`}>
                                  {s.done ? <CheckCircle2 className="w-4 h-4 text-black" /> : <div className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />}
                               </div>
                               <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${s.active ? 'text-emerald-400' : 'text-gray-600'}`}>{s.step}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 lg:flex items-center justify-between gap-6">
                       <div className="mb-4 lg:mb-0">
                          <h4 className="font-bold text-gray-300 mb-1">Application for {application?.footballInfo?.position || 'Talent Scholarship'}</h4>
                          <p className="text-xs text-gray-600">Submitted on {new Date(application.createdAt).toLocaleDateString()}</p>
                       </div>
                       <Link href="/dashboard/apply" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors group">
                          Edit Detail <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                 </div>
               ) : (
                 <div className="py-12 flex flex-col items-center gap-4 border border-dashed border-white/10 rounded-3xl">
                    <CheckCircle2 className="w-12 h-12 text-gray-700" />
                    <p className="text-gray-500 text-sm text-center max-w-xs">You haven't submitted your football details for the 2026 scholarship season yet.</p>
                 </div>
               )}
            </div>
          </div>

          {/* Side Section: Payments History */}
          <div className="space-y-8">
             <div className="glass-card p-8 border border-white/10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                   </div>
                   <h3 className="text-xl font-bold">Payments</h3>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                   {payments.length > 0 ? payments.map((p: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                               <History className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-gray-300">Registration Fee</p>
                               <p className="text-[10px] text-gray-600 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">₹{p.amount}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Success</p>
                         </div>
                      </div>
                   )) : (
                      <div className="flex flex-col items-center justify-center py-10 opacity-30 gap-3">
                         <History className="w-10 h-10" />
                         <p className="text-xs uppercase tracking-[0.2em]">No records</p>
                      </div>
                   )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-500 text-sm">Total Contribution</span>
                      <span className="text-xl font-bold">₹{payments.reduce((acc: number, p: any) => acc + p.amount, 0)}</span>
                   </div>
                   <p className="text-[10px] text-gray-700 leading-relaxed italic">
                      All scholarship fees contribute directly to the athlete empowerment fund.
                   </p>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
