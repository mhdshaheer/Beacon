'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  ArrowLeft, 
  CreditCard,
  Loader2,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function UserPaymentsPage() {
  const { data: session, status } = useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayments();
    } else if (status === 'unauthenticated') {
       window.location.href = '/login';
    }
  }, [status]);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/user/dashboard');
      if (!res.ok) throw new Error('Failed to fetch payments data');
      const result = await res.json();
      setPayments(result.payments || []);
    } catch (error: any) {
      console.error('Payments fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p: any) => 
    p.razorpayOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background decor */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
         <Link href="/dashboard" className="flex items-center gap-2 group">
            <LayoutDashboard className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-gradient">Beacon Hub</span>
         </Link>
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

      <main className="relative z-10 max-w-5xl mx-auto p-6 md:p-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-emerald-400 text-sm font-medium mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Payment History</h1>
            <p className="text-gray-500">View and download your scholarship transaction receipts.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-card px-6 py-3 border border-white/10 rounded-2xl flex items-center gap-4">
               <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <IndianRupee className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Spent</p>
                  <p className="text-xl font-bold">₹{totalPaid}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by Order ID or Status..."
              className="input-field pl-12 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="glass-button h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold border border-white/10">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="glass-card border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500">
                  <th className="px-8 py-5">Transaction Details</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.length > 0 ? filteredPayments.map((p, i) => (
                  <motion.tr 
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                          p.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-gray-500'
                        }`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-200">Registration Fee</p>
                          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter">ID: {p.razorpayOrderId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-300">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-600 uppercase">
                          {new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-black text-white">₹{p.amount}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                        p.status === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : p.status === 'failed'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {p.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : p.status === 'failed' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {p.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {p.status === 'paid' && (
                        <button className="p-2.5 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-xl border border-white/10 transition-all group-hover:border-emerald-500/50">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-20">
                          <History className="w-16 h-16" />
                          <p className="text-sm font-bold uppercase tracking-[0.3em]">No Transactions Found</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-sm text-gray-500 max-w-sm">
                Showing {filteredPayments.length} transactions. All payments are securely processed via Razorpay.
             </div>
             <div className="flex items-center gap-2">
                <button disabled className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-700">Previous</button>
                <button disabled className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white">1</button>
                <button disabled className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-700">Next</button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
