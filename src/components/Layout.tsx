import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calendar, Users, MapPin, Activity, DollarSign, FileText, Settings, LogOut, Menu, X, ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  permission?: string;
  children?: { label: string; path: string; permission?: string }[];
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]);
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, permission: 'dashboard.view' },
    { label: 'Booking', icon: <Calendar size={20} />, permission: 'booking.view', children: [
      { label: 'Semua Booking', path: '/bookings', permission: 'booking.view' },
      { label: 'Malang', path: '/bookings/malang', permission: 'booking.view' },
      { label: 'Surabaya', path: '/bookings/surabaya', permission: 'booking.view' },
    ]},
    { label: 'Data Penumpang', path: '/passengers', icon: <Users size={20} />, permission: 'passenger.view' },
    { label: 'Tracking', icon: <MapPin size={20} />, permission: 'tracking.view', children: [
      { label: 'Tracking Admin', path: '/tracking', permission: 'tracking.view' },
      { label: 'Activity Log', path: '/activity-log', permission: 'activity.view' },
    ]},
    { label: 'Keuangan', icon: <DollarSign size={20} />, permission: 'finance.view', children: [
      { label: 'Dashboard Keuangan', path: '/finance', permission: 'finance.view' },
      { label: 'Keuangan Harian', path: '/finance/daily', permission: 'finance.view' },
      { label: 'Keuangan Bulanan', path: '/finance/monthly', permission: 'finance.view' },
      { label: 'Pemasukan', path: '/finance/income', permission: 'finance.view' },
      { label: 'Pengeluaran', path: '/finance/expense', permission: 'finance.view' },
      { label: 'Pembayaran Belum Lunas', path: '/finance/outstanding', permission: 'finance.view' },
      { label: 'Laporan Keuangan', path: '/finance/reports', permission: 'report.finance.view' },
    ]},
    { label: 'Master Data', icon: <Settings size={20} />, permission: 'user.view', children: [
      { label: 'User Management', path: '/users', permission: 'user.view' },
      { label: 'Permission', path: '/users/permissions', permission: 'user.permission.manage' },
    ]},
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const renderMenuItem = (item: MenuItem) => {
    if (item.permission && !hasPermission(item.permission)) return null;
    if (item.children) {
      const visibleChildren = item.children.filter(c => !c.permission || hasPermission(c.permission));
      if (visibleChildren.length === 0) return null;
      const isExpanded = expandedMenus.includes(item.label);
      return (
        <div key={item.label}>
          <button onClick={() => toggleMenu(item.label)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
            <span className="flex items-center gap-3">{item.icon}{item.label}</span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {isExpanded && (
            <div className="ml-8 mt-1 space-y-1">
              {visibleChildren.map(child => (
                <Link key={child.path} to={child.path} onClick={() => setSidebarOpen(false)}
                  className={`block px-4 py-2 text-sm rounded-lg transition-colors ${location.pathname === child.path ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link key={item.label} to={item.path!} onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
        {item.icon}{item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-lg font-bold text-white">🚗 AGAN TRAVEL</h1>
            <p className="text-xs text-gray-400 mt-1">Sistem Manajemen Booking</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 rounded-lg w-full transition-colors">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-800">Login sebagai: <span className="text-blue-600">{user?.name}</span></p>
                <p className="text-xs text-gray-500">{user?.role === 'SUPER_ADMIN' ? 'Admin Master Data' : user?.role === 'FINANCE_ADMIN' ? 'Finance Admin' : 'Booking Admin'}</p>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <ShieldAlert size={80} className="text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ACCESS DENIED</h1>
      <p className="text-gray-600 mb-6 max-w-md">Anda tidak memiliki akses ke modul ini. Silakan hubungi Admin Master Data.</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Kembali ke Dashboard
      </button>
    </div>
  );
}

export function ProtectedRoute({ children, permission }: { children: React.ReactNode; permission?: string }) {
  const { hasPermission } = useAuth();
  if (permission && !hasPermission(permission)) return <AccessDenied />;
  return <>{children}</>;
}
