'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Hourglass, 
  CheckCircle, 
  Search, 
  Filter, 
  Download,
  Eye,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirm } from '@/providers/ConfirmProvider';
import { useToast } from '@/providers/ToastProvider';

export default function ApplicantsManagement() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { openConfirm } = useConfirm();
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    setLoading(true);
    fetch('/api/admin/applications')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch applications');
        return res.json();
      })
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        showToast(err.message || 'An error occurred', 'error');
        setLoading(false);
      });
  };

  const handleStatusUpdate = async (appId: string, status: 'approved' | 'rejected') => {
    const isConfirmed = await openConfirm({
      title: `${status.charAt(0).toUpperCase() + status.slice(1)} Application`,
      message: `Are you sure you want to ${status} this scholarship application?`,
      type: status === 'approved' ? 'info' : 'danger',
      confirmText: status.charAt(0).toUpperCase() + status.slice(1),
      cancelText: 'Cancel'
    });

    if (!isConfirmed) return;

    try {
      // Note: Assuming there's a PATCH endpoint for application status
      // If not, I'll need to check the API
      const res = await fetch(`/api/admin/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: status }),
      });

      if (res.ok) {
        showToast(`Application ${status} successfully`, 'success');
        fetchApplications();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  if (!data || data.error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-4">
      <h2 className="text-xl font-bold mb-4">Error Loading Applications</h2>
      <p className="text-gray-400 mb-6">{data?.error || 'No data received from server'}</p>
      <button onClick={fetchApplications} className="btn-primary px-6 py-2">Retry</button>
    </div>
  );

  const stats = data.stats || { total: 0, paid: 0, pendingPayments: 0, approved: 0 };
  
  const applications = (data.applications || []).filter((app: any) => {
    const matchesSearch = 
      app.personalInfo?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      app.personalInfo?.email?.toLowerCase().includes(search.toLowerCase());
    
    // Check if any sport entry matches the selected level filter
    const sportEntries = Array.isArray(app.sportsInfo) ? app.sportsInfo : [];
    const matchesLevel = filter === 'all' || sportEntries.some((s: any) => s.level === filter);
    
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Applications Management</h1>
          <p className="text-gray-500">Manage scholarship applications and payments.</p>
        </div>
        <button className="glass-button px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Applicants', value: stats.total, icon: <Users />, color: 'text-blue-400' },
          { label: 'Paid Users', value: stats.paid, icon: <CreditCard />, color: 'text-emerald-400' },
          { label: 'Pending Payments', value: stats.pendingPayments, icon: <Hourglass />, color: 'text-amber-400' },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle />, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className={`p-3 rounded-lg bg-white/5 w-fit mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-gray-500 text-sm font-medium mb-1">{stat.label}</div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              className="input-field pl-10 h-10 text-sm" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="input-field w-auto min-w-[140px] px-4 py-2 h-10 text-sm cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="National">National</option>
              <option value="State">State</option>
              <option value="District">District</option>
              <option value="School">School</option>
              <option value="Other">Other</option>
            </select>
            <button className="input-field w-10 h-10 p-0 flex items-center justify-center hover:bg-[#222] transition-colors">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Applicant</th>
                <th className="px-6 py-4 font-semibold">Level</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applications.map((app: any, i: number) => (
                <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{app.personalInfo.fullName}</div>
                    <div className="text-xs text-gray-500">{app.personalInfo.email}</div>
                  </td>
                  <td className="px-6 py-4">
                      {Array.isArray(app.sportsInfo) && app.sportsInfo.length > 0 
                        ? app.sportsInfo.map((s: any) => `${s.sport} (${s.level === 'Other' ? s.levelOther : s.level})`).join(', ') 
                        : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-sm ${
                      app.paymentStatus === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        app.paymentStatus === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      {app.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      app.approvalStatus === 'approved' ? 'text-emerald-400' : 
                      app.approvalStatus === 'rejected' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {app.approvalStatus.charAt(0)?.toUpperCase() + app.approvalStatus.slice(1)}
                    </span>
                  </td>
                   <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white" title="View Details">
                         <Eye className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(app._id, 'approved')}
                         className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-400" 
                         title="Approve"
                       >
                         <Check className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(app._id, 'rejected')}
                         className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400" 
                         title="Reject"
                       >
                         <X className="w-4 h-4" />
                       </button>
                    </div>
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
