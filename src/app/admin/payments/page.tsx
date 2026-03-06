'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/providers/ToastProvider';

export default function PaymentsManagement() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [retrying, setRetrying] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    setLoading(true);
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Admin-triggered retry (creates new Razorpay order for the user)
  const handleRetry = async (payment: any) => {
    // This opens Razorpay checkout on admin side for testing / reissue
    setRetrying(payment._id);
    try {
      const res = await fetch('/api/payment/retry', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create retry order');

      const options = {
        key: data.key,
        amount: data.amount,
        currency: 'INR',
        name: 'Beacon Scholarship',
        description: 'Scholarship Registration Fee (Retry)',
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            showToast('Payment retried successfully!', 'success');
            fetchPayments();
          } else {
            showToast('Retry verification failed.', 'error');
          }
        },
        prefill: data.prefill,
        theme: { color: '#10b981' },
        modal: { ondismiss: () => setRetrying(null) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showToast(err.message || 'Retry failed', 'error');
    } finally {
      setRetrying(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  if (!data || data.error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-4">
      <h2 className="text-xl font-bold mb-4">Error Loading Payments</h2>
      <p className="text-gray-400 mb-6">{data?.error || 'No data received from server'}</p>
      <button onClick={fetchPayments} className="btn-primary px-6 py-2">Retry</button>
    </div>
  );

  const stats = data.stats;
  const payments = data.payments || [];

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch = 
      (payment.razorpayOrderId || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (payment.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
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
          {/* Stats badges */}
          <div className="glass-card flex items-center gap-3 px-5 py-2.5 rounded-xl">
            <IndianRupee className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Total Revenue</div>
              <div className="text-sm font-bold text-emerald-500">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <div className="glass-card flex items-center gap-3 px-5 py-2.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Paid</div>
              <div className="text-sm font-bold">{stats.paidCount}</div>
            </div>
          </div>
          <div className="glass-card flex items-center gap-3 px-5 py-2.5 rounded-xl">
            <XCircle className="w-4 h-4 text-red-400" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Failed</div>
              <div className="text-sm font-bold text-red-400">{stats.failedCount}</div>
            </div>
          </div>
          <button className="glass-button px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Filters */}
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
            {(['all', 'paid', 'failed', 'created'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  filterStatus === s
                    ? s === 'paid' ? 'bg-emerald-500 text-black' 
                    : s === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/10 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {s === 'all' ? 'All' : s === 'paid' ? 'Paid' : s === 'failed' ? 'Failed' : 'Pending'}
              </button>
            ))}
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
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : filteredPayments.map((payment: any) => (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm font-mono">
                      {payment.razorpayPaymentId || <span className="text-gray-600 italic">Not captured</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter font-mono">
                      ORD: {payment.razorpayOrderId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{payment.userId?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{payment.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold flex items-center gap-0.5 text-white">
                      <IndianRupee className="w-3 h-3 text-gray-400" />
                      {payment.amount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      payment.status === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : payment.status === 'failed' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {payment.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> 
                       : payment.status === 'failed' ? <XCircle className="w-3 h-3" /> 
                       : <Clock className="w-3 h-3" />}
                      {payment.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(payment.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {payment.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(payment)}
                          disabled={retrying === payment._id}
                          title="Retry Payment"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase hover:bg-amber-500/20 transition-all disabled:opacity-50"
                        >
                          {retrying === payment._id 
                            ? <Loader2 className="w-3 h-3 animate-spin" /> 
                            : <RefreshCw className="w-3 h-3" />}
                          Retry
                        </button>
                      )}
                      {payment.razorpayPaymentId && (
                        <a
                          href={`https://dashboard.razorpay.com/app/payments/${payment.razorpayPaymentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Razorpay"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
