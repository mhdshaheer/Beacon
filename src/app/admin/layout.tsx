'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  FileText
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useConfirm } from '@/providers/ConfirmProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { openConfirm } = useConfirm();

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/admin' },
    { icon: <Users className="w-5 h-5" />, label: 'Users', href: '/admin/users' },
    { icon: <FileText className="w-5 h-5" />, label: 'Applications', href: '/admin/applicants' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Payments', href: '/admin/payments' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/admin/settings' },
  ];

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#080808] hidden md:flex flex-col">
        <div className="p-8">
          <div className="text-xl font-bold text-gradient">Beacon Admin</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-emerald-500 text-black font-semibold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={async () => {
              const ok = await openConfirm({
                title: 'Logout',
                message: 'Are you sure you want to log out of the admin portal?',
                confirmText: 'Logout',
                cancelText: 'Stay'
              });
              if (ok) signOut({ callbackUrl: '/admin/login' });
            }}
            className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen bg-grid opacity-20 absolute inset-0 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
