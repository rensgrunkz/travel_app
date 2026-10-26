import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Calendar, Users, MapPin, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, TrendingUp, TrendingDown, Wallet, RefreshCw } from 'lucide-react';
import { SEED_BOOKINGS, SEED_PAYMENTS, SEED_TRANSACTIONS, SEED_ACTIVITY_LOGS } from '../data/seed';

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const { bookings, transactions } = useData();
  const [showReset, setShowReset] = useState(false);

  const resetData = () => {
    localStorage.setItem('agan_bookings', JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem('agan_payments', JSON.stringify(SEED_PAYMENTS));
    localStorage.setItem('agan_transactions', JSON.stringify(SEED_TRANSACTIONS));
    localStorage.setItem('agan_logs', JSON.stringify(SEED_ACTIVITY_LOGS));
    window.location.reload();
  };

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);

  const todayBookings = bookings.filter(b => b.reservation_date === today);
  const monthBookings = bookings.filter(b => b.reservation_date.startsWith(thisMonth));
  const todayIncome = transactions.filter(t => t.transaction_date === today && t.transaction_type === 'income').reduce((s, t) => s + t.income_amount, 0);
  const todayExpense = transactions.filter(t => t.transaction_date === today && t.transaction_type === 'expense').reduce((s, t) => s + t.expense_amount, 0);
  const monthIncome = transactions.filter(t => t.transaction_date.startsWith(thisMonth) && t.transaction_type === 'income').reduce((s, t) => s + t.income_amount, 0);
  const monthExpense = transactions.filter(t => t.transaction_date.startsWith(thisMonth) && t.transaction_type === 'expense').reduce((s, t) => s + t.expense_amount, 0);
  const outstanding = bookings.reduce((s, b) => s + b.remaining_balance, 0);

  const hasFinance = hasPermission('finance.view');

  const stats = [
    { label: 'Total Booking Hari Ini', value: todayBookings.length, icon: <Calendar size={24} />, color: 'bg-blue-500' },
    { label: 'Total Penumpang Hari Ini', value: todayBookings.reduce((s, b) => s + b.passenger_count, 0), icon: <Users size={24} />, color: 'bg-indigo-500' },
    { label: 'Booking Malang', value: todayBookings.filter(b => b.area === 'Malang').length, icon: <MapPin size={24} />, color: 'bg-green-500' },
    { label: 'Booking Surabaya', value: todayBookings.filter(b => b.area === 'Surabaya').length, icon: <MapPin size={24} />, color: 'bg-teal-500' },
    { label: 'Pending', value: todayBookings.filter(b => b.booking_status === 'Pending').length, icon: <Clock size={24} />, color: 'bg-yellow-500' },
    { label: 'Confirmed', value: todayBookings.filter(b => b.booking_status === 'Confirmed').length, icon: <CheckCircle size={24} />, color: 'bg-blue-500' },
    { label: 'Completed', value: todayBookings.filter(b => b.booking_status === 'Completed').length, icon: <CheckCircle size={24} />, color: 'bg-green-500' },
    { label: 'Cancelled', value: todayBookings.filter(b => b.booking_status === 'Cancelled').length, icon: <XCircle size={24} />, color: 'bg-red-500' },
  ];

  const financeStats = [
    { label: 'Pemasukan Hari Ini', value: todayIncome, icon: <TrendingUp size={24} />, color: 'bg-green-500' },
    { label: 'Pengeluaran Hari Ini', value: todayExpense, icon: <TrendingDown size={24} />, color: 'bg-red-500' },
    { label: 'Saldo Hari Ini', value: todayIncome - todayExpense, icon: <Wallet size={24} />, color: 'bg-blue-500' },
    { label: 'Piutang', value: outstanding, icon: <AlertCircle size={24} />, color: 'bg-orange-500' },
    { label: 'Pemasukan Bulan Ini', value: monthIncome, icon: <TrendingUp size={24} />, color: 'bg-emerald-500' },
    { label: 'Pengeluaran Bulan Ini', value: monthExpense, icon: <TrendingDown size={24} />, color: 'bg-rose-500' },
    { label: 'Saldo Bulan Ini', value: monthIncome - monthExpense, icon: <DollarSign size={24} />, color: 'bg-indigo-500' },
  ];

  const sortedTodayBookings = [...todayBookings].sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Selamat datang, <span className="font-medium text-blue-600">{user?.name}</span></p>
        </div>
        {user?.role === 'SUPER_ADMIN' && (
          <button onClick={() => setShowReset(true)} className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
            <RefreshCw size={14} /> Reset Data
          </button>
        )}
      </div>

      {/* Reset Confirmation */}
      {showReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Reset Data</h3>
            <p className="text-gray-600 text-sm mb-4">Ini akan mengembalikan semua data ke kondisi awal (seed data). Semua perubahan akan hilang.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowReset(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Batal</button>
              <button onClick={resetData} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">Ya, Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Finance Stats */}
      {hasFinance && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">📊 Keuangan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {financeStats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-800">Rp{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`${stat.color} p-2.5 rounded-lg text-white`}>{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Reservations */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">📋 Reservasi Hari Ini</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ID Booking</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Area</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Jam</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Admin</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedTodayBookings.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada reservasi hari ini</td></tr>
              ) : sortedTodayBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                  <td className="px-4 py-3 font-medium">{b.passenger_name}</td>
                  <td className="px-4 py-3">{b.area}</td>
                  <td className="px-4 py-3">{b.reservation_time}</td>
                  <td className="px-4 py-3">{b.handled_by}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(b.booking_status)}`}>{b.booking_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
