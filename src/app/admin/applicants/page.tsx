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

export default function ApplicantsManagement() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/applications')
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
  const applications = data.applications;

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
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="glass-button px-4 py-2 rounded-lg text-sm outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="National">National</option>
              <option value="State">State</option>
              <option value="District">District</option>
            </select>
            <button className="glass-button p-2.5 rounded-lg">
              <Filter className="w-4 h-4" />
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
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      app.footballInfo.level === 'National' ? 'bg-purple-500/10 text-purple-400' :
                      app.footballInfo.level === 'State' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {app.footballInfo.level}
                    </span>
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
                       <button className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-400" title="Approve">
                         <Check className="w-4 h-4" />
                       </button>
                       <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400" title="Reject">
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
