'use client';

import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Shield, 
  User as UserIcon, 
  Search, 
  Filter, 
  MoreVertical,
  Trash2,
  Mail,
  Calendar,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersManagement() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  const stats = data?.stats;
  const users = data?.users || [];

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage all registered users and their platform permissions.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', value: stats?.total || 0, icon: <UsersIcon />, color: 'text-blue-400' },
          { label: 'Admins', value: stats?.admins || 0, icon: <Shield />, color: 'text-purple-400' },
          { label: 'Regular Users', value: stats?.regularUsers || 0, icon: <UserIcon />, color: 'text-emerald-400' },
          { label: 'New This Week', value: stats?.recentUsers || 0, icon: <Clock />, color: 'text-amber-400' },
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

      {/* Control Section */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              className="input-field pl-10 h-10 text-sm" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="glass-button px-4 py-2 rounded-lg text-sm outline-none"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
            <button className="glass-button p-2.5 rounded-lg" onClick={fetchUsers}>
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined At</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? filteredUsers.map((user: any, i: number) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                         title={user.role === 'admin' ? 'Make User' : 'Make Admin'}
                         onClick={() => toggleRole(user._id, user.role)}
                       >
                         <Shield className="w-4 h-4" />
                       </button>
                       <button 
                         className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                         title="Delete User"
                         onClick={() => deleteUser(user._id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                     No users found matching your search.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
