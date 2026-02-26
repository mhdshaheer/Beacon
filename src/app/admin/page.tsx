'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
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

  return (
    <div className="p-8 pb-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Platform Overview</h1>
        <p className="text-gray-500">Quick statistics and system health for the Beacon platform.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard 
          label="Total Registered Users" 
          value={data.users.total} 
          icon={<Users className="w-6 h-6" />} 
          color="bg-blue-500/20 text-blue-400" 
          link="/admin/users"
        />
        <StatCard 
          label="Scholarship Applications" 
          value={data.applications.total} 
          icon={<FileText className="w-6 h-6" />} 
          color="bg-emerald-500/20 text-emerald-400" 
          link="/admin/applicants"
        />
        <StatCard 
          label="Successful Payments" 
          value={data.applications.paid} 
          icon={<CreditCard className="w-6 h-6" />} 
          color="bg-amber-500/20 text-amber-400" 
          link="/admin/payments"
        />
        <StatCard 
          label="System Administrators" 
          value={data.users.admins} 
          icon={<ShieldCheck className="w-6 h-6" />} 
          color="bg-purple-500/20 text-purple-400" 
          link="/admin/users"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Growth Chart Placeholder */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Platform Growth
            </h3>
            <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12% this month</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4 pt-10">
            {data.chartData.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className="relative w-full flex justify-center items-end gap-1 h-32">
                   <motion.div 
                     initial={{ height: 0 }} 
                     animate={{ height: `${(d.users / 60) * 100}%` }}
                     className="w-1.5 md:w-3 bg-blue-500/50 rounded-t-sm"
                   />
                   <motion.div 
                     initial={{ height: 0 }} 
                     animate={{ height: `${(d.applications / 60) * 100}%` }}
                     className="w-1.5 md:w-3 bg-emerald-500/70 rounded-t-sm"
                   />
                </div>
                <span className="text-[10px] md:text-xs text-gray-500 rotate-45 md:rotate-0 mt-2">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-8">
             <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 bg-blue-500/50 rounded-full" /> Total Users
             </div>
             <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 bg-emerald-500/70 rounded-full" /> Applications
             </div>
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div className="space-y-6">
           <div className="glass-card p-8 h-full flex flex-col">
              <h3 className="text-xl font-semibold mb-6">Management Centers</h3>
              <div className="space-y-4 flex-1">
                 <QuickLink 
                    title="User Management" 
                    description="Update roles, permissions, and account statuses."
                    href="/admin/users"
                    icon={<Users className="w-5 h-5 text-blue-400" />}
                 />
                 <QuickLink 
                    title="Application Review" 
                    description="Process scholarship applications and verify levels."
                    href="/admin/applicants"
                    icon={<FileText className="w-5 h-5 text-emerald-400" />}
                 />
                 <QuickLink 
                    title="Payment Tracking" 
                    description="Monitor Razorpay transactions and status."
                    href="/admin/payments"
                    icon={<CreditCard className="w-5 h-5 text-amber-400" />}
                 />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, link }: any) {
  return (
    <Link href={link}>
      <motion.div 
        whileHover={{ scale: 1.02, translateY: -5 }}
        className="glass-card p-6 cursor-pointer group"
      >
        <div className={`p-4 rounded-xl w-fit mb-6 transition-all group-hover:scale-110 ${color}`}>
          {icon}
        </div>
        <div className="text-gray-500 text-sm font-medium mb-1">{label}</div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
      </motion.div>
    </Link>
  );
}

function QuickLink({ title, description, href, icon }: any) {
  return (
    <Link href={href}>
      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-2.5 bg-black/50 rounded-lg">
               {icon}
            </div>
            <div>
               <div className="font-semibold text-sm">{title}</div>
               <div className="text-xs text-gray-500 line-clamp-1">{description}</div>
            </div>
         </div>
         <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition-colors" />
      </div>
    </Link>
  );
}
