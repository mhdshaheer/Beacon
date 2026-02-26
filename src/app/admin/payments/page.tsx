'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentsManagement() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  const stats = data.stats;
  const payments = data.payments || [];

  const filteredPayments = payments.filter((payment: any) => {
     const matchesSearch = 
       payment.razorpayOrderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (payment.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
     return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-gray-500">Monitor and track scholarship fee transactions via Razorpay.</p>
        </div>
        <div className="flex gap-4">
           {/* Summary badges */}
           <div className="glass-card flex items-center gap-3 px-6 py-2.5 rounded-xl">
             <IndianRupee className="w-4 h-4 text-emerald-500" />
             <div className="text-sm font-semibold text-emerald-500">
               {stats.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} Total
             </div>
           </div>
           <button className="glass-button px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold">
             <Download className="w-4 h-4" /> Export CSV
           </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Table Filters */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              className="input-field pl-10 h-10 text-sm" 
              placeholder="Search by Order ID or User Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="glass-button px-4 py-2 rounded-lg text-sm outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="paid">Success</option>
              <option value="failed">Failed</option>
              <option value="created">Created</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Transaction ID / Order ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.map((payment: any, i: number) => (
                <tr key={payment._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm">{payment.razorpayPaymentId || 'N/A'}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">ORD: {payment.razorpayOrderId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{payment.userId?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{payment.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold flex items-center gap-0.5">
                       <IndianRupee className="w-3 h-3 text-gray-500" />
                       {(payment.amount / 100).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                      payment.status === 'paid' ? 'text-emerald-400' : 
                      payment.status === 'failed' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {payment.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : 
                       payment.status === 'failed' ? <XCircle className="w-3 h-3" /> : 
                       <Clock className="w-3 h-3" />}
                      {payment.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(payment.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white group">
                      <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
