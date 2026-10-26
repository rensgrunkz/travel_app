import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Transaction, PaymentMethod } from '../types';
import { Plus, Download, FileText, TrendingUp, TrendingDown, DollarSign, X, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { useLocation, useNavigate } from 'react-router-dom';

type FinanceTab = 'dashboard' | 'daily' | 'monthly' | 'income' | 'expense' | 'outstanding' | 'reports';

export default function Finance() {
  const { user, hasPermission } = useAuth();
  const { transactions, bookings, addTransaction, updateTransaction, deleteTransaction } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (): FinanceTab => {
    const path = location.pathname;
    if (path.includes('/daily')) return 'daily';
    if (path.includes('/monthly')) return 'monthly';
    if (path.includes('/income')) return 'income';
    if (path.includes('/expense')) return 'expense';
    if (path.includes('/outstanding')) return 'outstanding';
    if (path.includes('/reports')) return 'reports';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<FinanceTab>(getTabFromPath());

  const handleTabChange = (tab: FinanceTab) => {
    setActiveTab(tab);
    const paths: Record<FinanceTab, string> = {
      dashboard: '/finance',
      daily: '/finance/daily',
      monthly: '/finance/monthly',
      income: '/finance/income',
      expense: '/finance/expense',
      outstanding: '/finance/outstanding',
      reports: '/finance/reports',
    };
    navigate(paths[tab]);
  };
  const [showForm, setShowForm] = useState(false);
  const [editTrx, setEditTrx] = useState<Transaction | null>(null);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [filterArea, setFilterArea] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().substring(0, 7));
  const [search, setSearch] = useState('');

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'daily', label: 'Harian' },
    { key: 'monthly', label: 'Bulanan' },
    { key: 'income', label: 'Pemasukan' },
    { key: 'expense', label: 'Pengeluaran' },
    { key: 'outstanding', label: 'Piutang' },
    { key: 'reports', label: 'Laporan' },
  ];

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (activeTab === 'income') result = result.filter(t => t.transaction_type === 'income');
    if (activeTab === 'expense') result = result.filter(t => t.transaction_type === 'expense');
    if (dateFrom) result = result.filter(t => t.transaction_date >= dateFrom);
    if (dateTo) result = result.filter(t => t.transaction_date <= dateTo);
    if (filterMethod) result = result.filter(t => t.payment_method === filterMethod);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => t.description.toLowerCase().includes(s) || t.transaction_code.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    }
    return result.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
  }, [transactions, activeTab, dateFrom, dateTo, filterMethod, search]);

  const totalIncome = filteredTransactions.filter(t => t.transaction_type === 'income').reduce((s, t) => s + t.income_amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.expense_amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Outstanding bookings
  const outstandingBookings = useMemo(() => {
    return bookings.filter(b => b.remaining_balance > 0 && b.booking_status !== 'Cancelled')
      .sort((a, b) => a.reservation_date.localeCompare(b.reservation_date));
  }, [bookings]);

  // Monthly data
  const monthlyData = useMemo(() => {
    const monthTrx = transactions.filter(t => t.transaction_date.startsWith(monthYear));
    const monthBookings = bookings.filter(b => b.reservation_date.startsWith(monthYear));
    return {
      totalBookings: monthBookings.length,
      totalPassengers: monthBookings.reduce((s, b) => s + b.passenger_count, 0),
      income: monthTrx.filter(t => t.transaction_type === 'income').reduce((s, t) => s + t.income_amount, 0),
      expense: monthTrx.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.expense_amount, 0),
      outstanding: monthBookings.reduce((s, b) => s + b.remaining_balance, 0),
    };
  }, [transactions, bookings, monthYear]);

  // Export Excel
  const exportExcel = () => {
    const data = filteredTransactions.map(t => ({
      'ID Transaksi': t.transaction_code,
      'Tanggal': t.transaction_date,
      'Jenis': t.transaction_type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      'Kategori': t.category,
      'Keterangan': t.description,
      'Pemasukan': t.income_amount,
      'Pengeluaran': t.expense_amount,
      'Metode': t.payment_method,
      'Dicatat oleh': t.recorded_by,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Keuangan');
    XLSX.writeFile(wb, `Laporan_Keuangan_${dateFrom}_${dateTo}.xlsx`);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('AGAN TRAVEL MALANG', 14, 20);
    doc.setFontSize(12);
    doc.text('LAPORAN KEUANGAN', 14, 30);
    doc.setFontSize(10);
    doc.text(`Periode: ${dateFrom} s/d ${dateTo}`, 14, 38);
    doc.text(`Total Pemasukan: Rp${totalIncome.toLocaleString()}`, 14, 48);
    doc.text(`Total Pengeluaran: Rp${totalExpense.toLocaleString()}`, 14, 55);
    doc.text(`Saldo Bersih: Rp${netBalance.toLocaleString()}`, 14, 62);

    const tableData = filteredTransactions.map(t => [
      t.transaction_code, t.transaction_date, t.category,
      t.transaction_type === 'income' ? `Rp${t.income_amount.toLocaleString()}` : '-',
      t.transaction_type === 'expense' ? `Rp${t.expense_amount.toLocaleString()}` : '-',
      t.payment_method, t.recorded_by
    ]);

    (doc as any).autoTable({
      startY: 70,
      head: [['ID', 'Tanggal', 'Kategori', 'Pemasukan', 'Pengeluaran', 'Metode', 'Oleh']],
      body: tableData,
      styles: { fontSize: 8 },
    });

    doc.save(`Laporan_Keuangan_${dateFrom}_${dateTo}.pdf`);
  };

  const canExport = hasPermission('finance.export');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">💰 Keuangan</h1>
        <div className="flex gap-2">
          {canExport && (
            <>
              <button onClick={exportExcel} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                <Download size={14} /> Excel
              </button>
              <button onClick={exportPDF} className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
                <FileText size={14} /> PDF
              </button>
            </>
          )}
          {hasPermission('finance.create') && (
            <button onClick={() => { setEditTrx(null); setShowForm(true); }} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
              <Plus size={14} /> Transaksi
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 bg-white rounded-xl p-1 shadow-sm border">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key as FinanceTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(activeTab === 'daily' || activeTab === 'income' || activeTab === 'expense' || activeTab === 'reports') && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari transaksi..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Metode</option>
              <option>Cash</option><option>Transfer</option><option>QRIS</option><option>E-Wallet</option><option>Lainnya</option>
            </select>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Pemasukan Hari Ini" value={transactions.filter(t => t.transaction_date === new Date().toISOString().split('T')[0] && t.transaction_type === 'income').reduce((s, t) => s + t.income_amount, 0)} icon={<TrendingUp size={24} />} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Pengeluaran Hari Ini" value={transactions.filter(t => t.transaction_date === new Date().toISOString().split('T')[0] && t.transaction_type === 'expense').reduce((s, t) => s + t.expense_amount, 0)} icon={<TrendingDown size={24} />} color="text-red-600" bg="bg-red-50" />
            <StatCard label="Saldo Hari Ini" value={transactions.filter(t => t.transaction_date === new Date().toISOString().split('T')[0]).reduce((s, t) => s + (t.income_amount - t.expense_amount), 0)} icon={<DollarSign size={24} />} color="text-blue-600" bg="bg-blue-50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="Piutang Total" value={bookings.reduce((s, b) => s + b.remaining_balance, 0)} icon={<DollarSign size={24} />} color="text-orange-600" bg="bg-orange-50" />
            <StatCard label="Transaksi Bulan Ini" value={transactions.filter(t => t.transaction_date.startsWith(new Date().toISOString().substring(0, 7))).length} icon={<FileText size={24} />} color="text-purple-600" bg="bg-purple-50" isCount />
          </div>
        </div>
      )}

      {/* Daily / Income / Expense / Reports */}
      {(activeTab === 'daily' || activeTab === 'income' || activeTab === 'expense' || activeTab === 'reports') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Pemasukan" value={totalIncome} icon={<TrendingUp size={24} />} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Total Pengeluaran" value={totalExpense} icon={<TrendingDown size={24} />} color="text-red-600" bg="bg-red-50" />
            <StatCard label="Saldo Bersih" value={netBalance} icon={<DollarSign size={24} />} color="text-blue-600" bg="bg-blue-50" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Tanggal</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Keterangan</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Pemasukan</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Pengeluaran</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Metode</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Oleh</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Tidak ada transaksi</td></tr>
                  ) : filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{t.transaction_code}</td>
                      <td className="px-4 py-3">{t.transaction_date}</td>
                      <td className="px-4 py-3">{t.category}</td>
                      <td className="px-4 py-3 text-xs max-w-[200px] truncate">{t.description}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{t.income_amount > 0 ? `Rp${t.income_amount.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">{t.expense_amount > 0 ? `Rp${t.expense_amount.toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{t.payment_method}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs">{t.recorded_by}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {hasPermission('finance.update') && <button onClick={() => { setEditTrx(t); setShowForm(true); }} className="p-1 hover:bg-yellow-50 rounded text-yellow-600"><X size={14} /></button>}
                          {hasPermission('finance.delete') && <button onClick={() => deleteTransaction(t.id)} className="p-1 hover:bg-red-50 rounded text-red-600 text-xs">🗑</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t font-medium">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right">TOTAL:</td>
                    <td className="px-4 py-3 text-right text-green-600">Rp{totalIncome.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-600">Rp{totalExpense.toLocaleString()}</td>
                    <td colSpan={3} className="px-4 py-3 text-right text-blue-600">Saldo: Rp{netBalance.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Monthly */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <input type="month" value={monthYear} onChange={e => setMonthYear(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Total Booking" value={monthlyData.totalBookings} icon={<FileText size={24} />} color="text-blue-600" bg="bg-blue-50" isCount />
            <StatCard label="Total Penumpang" value={monthlyData.totalPassengers} icon={<TrendingUp size={24} />} color="text-indigo-600" bg="bg-indigo-50" isCount />
            <StatCard label="Pemasukan" value={monthlyData.income} icon={<TrendingUp size={24} />} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Pengeluaran" value={monthlyData.expense} icon={<TrendingDown size={24} />} color="text-red-600" bg="bg-red-50" />
            <StatCard label="Saldo Bersih" value={monthlyData.income - monthlyData.expense} icon={<DollarSign size={24} />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Piutang" value={monthlyData.outstanding} icon={<DollarSign size={24} />} color="text-orange-600" bg="bg-orange-50" />
          </div>
        </div>
      )}

      {/* Outstanding */}
      {activeTab === 'outstanding' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ID Booking</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Area</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Tanggal</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Total Tarif</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Sudah Dibayar</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Sisa</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {outstandingBookings.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Tidak ada piutang</td></tr>
                ) : outstandingBookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                    <td className="px-4 py-3 font-medium">{b.passenger_name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{b.area}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{b.reservation_date}</td>
                    <td className="px-4 py-3 text-right">Rp{b.total_fare.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-600">Rp{b.total_paid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">Rp{b.remaining_balance.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs">{b.handled_by}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-orange-50 border-t font-medium">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right">Total Piutang:</td>
                  <td className="px-4 py-3 text-right text-red-600">Rp{outstandingBookings.reduce((s, b) => s + b.remaining_balance, 0).toLocaleString()}</td>
                  <td className="hidden lg:table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Pemasukan" value={totalIncome} icon={<TrendingUp size={24} />} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Total Pengeluaran" value={totalExpense} icon={<TrendingDown size={24} />} color="text-red-600" bg="bg-red-50" />
            <StatCard label="Saldo Bersih" value={netBalance} icon={<DollarSign size={24} />} color="text-blue-600" bg="bg-blue-50" />
          </div>

          {/* Malang vs Surabaya */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📍 Malang</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Booking</span><span className="font-medium">{bookings.filter(b => b.area === 'Malang' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Penumpang</span><span className="font-medium">{bookings.filter(b => b.area === 'Malang' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.passenger_count, 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Tarif</span><span className="font-medium text-green-600">Rp{bookings.filter(b => b.area === 'Malang' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.total_fare, 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sudah Dibayar</span><span className="font-medium">Rp{bookings.filter(b => b.area === 'Malang' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.total_paid, 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Piutang</span><span className="font-medium text-red-600">Rp{bookings.filter(b => b.area === 'Malang' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.remaining_balance, 0).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📍 Surabaya</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Booking</span><span className="font-medium">{bookings.filter(b => b.area === 'Surabaya' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Penumpang</span><span className="font-medium">{bookings.filter(b => b.area === 'Surabaya' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.passenger_count, 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Tarif</span><span className="font-medium text-green-600">Rp{bookings.filter(b => b.area === 'Surabaya' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.total_fare, 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sudah Dibayar</span><span className="font-medium">Rp{bookings.filter(b => b.area === 'Surabaya' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.total_paid, 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Piutang</span><span className="font-medium text-red-600">Rp{bookings.filter(b => b.area === 'Surabaya' && b.reservation_date >= dateFrom && b.reservation_date <= dateTo).reduce((s, b) => s + b.remaining_balance, 0).toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* Per Admin */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Laporan Per Admin</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Admin</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Booking</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Total Tarif</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Terbayar</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Piutang</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...new Set(bookings.map(b => b.handled_by))].map(admin => {
                    const adminBookings = bookings.filter(b => b.handled_by === admin && b.reservation_date >= dateFrom && b.reservation_date <= dateTo);
                    return (
                      <tr key={admin} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{admin}</td>
                        <td className="px-4 py-3 text-center">{adminBookings.length}</td>
                        <td className="px-4 py-3 text-right">Rp{adminBookings.reduce((s, b) => s + b.total_fare, 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600">Rp{adminBookings.reduce((s, b) => s + b.total_paid, 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-600">Rp{adminBookings.reduce((s, b) => s + b.remaining_balance, 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form */}
      {showForm && <TransactionForm transaction={editTrx} onClose={() => { setShowForm(false); setEditTrx(null); }}
        onSave={(data) => {
          if (editTrx) { updateTransaction({ ...editTrx, ...data }); }
          else { addTransaction({ ...data, recorded_by: user!.name }); }
          setShowForm(false); setEditTrx(null);
        }} />}
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, isCount }: { label: string; value: number; icon: React.ReactNode; color: string; bg: string; isCount?: boolean }) {
  return (
    <div className={`${bg} rounded-xl p-4 border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className={`text-xl font-bold ${color}`}>{isCount ? value : `Rp${value.toLocaleString()}`}</p>
        </div>
        <div className={`${color} opacity-60`}>{icon}</div>
      </div>
    </div>
  );
}

function TransactionForm({ transaction, onClose, onSave }: { transaction: Transaction | null; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    transaction_date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
    transaction_type: transaction?.transaction_type || 'income' as 'income' | 'expense',
    category: transaction?.category || 'Pembayaran Reservasi',
    description: transaction?.description || '',
    income_amount: transaction?.income_amount || 0,
    expense_amount: transaction?.expense_amount || 0,
    payment_method: transaction?.payment_method || 'Cash' as PaymentMethod,
    payment_status: transaction?.payment_status || 'Lunas',
    notes: transaction?.notes || '',
    booking_id: transaction?.booking_id || null,
  });

  const incomeCategories = ['Pembayaran Reservasi', 'DP', 'Pelunasan', 'Tambahan Penumpang', 'Tambahan Bagasi', 'Biaya Tambahan', 'Lainnya'];
  const expenseCategories = ['BBM', 'Tol', 'Parkir', 'Makan/Minum Driver', 'Komisi Driver', 'Maintenance', 'Operasional', 'Refund', 'Lainnya'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Transaksi</label>
            <select value={form.transaction_type} onChange={e => setForm({ ...form, transaction_type: e.target.value as any, category: e.target.value === 'income' ? 'Pembayaran Reservasi' : 'BBM' })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {(form.transaction_type === 'income' ? incomeCategories : expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input type="date" value={form.transaction_date} onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
              <input type="number" min="0" value={form.transaction_type === 'income' ? form.income_amount : form.expense_amount}
                onChange={e => {
                  const val = parseInt(e.target.value) || 0;
                  if (form.transaction_type === 'income') setForm({ ...form, income_amount: val, expense_amount: 0 });
                  else setForm({ ...form, expense_amount: val, income_amount: 0 });
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
              <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option>Cash</option><option>Transfer</option><option>QRIS</option><option>E-Wallet</option><option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option>Belum Bayar</option><option>DP</option><option>Lunas</option><option>Refund</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
