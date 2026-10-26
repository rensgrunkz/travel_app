import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Area } from '../types';
import { Search, Users } from 'lucide-react';

export default function Passengers() {
  const { bookings } = useData();
  const [activeTab, setActiveTab] = useState<Area | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...bookings];
    if (activeTab !== 'all') result = result.filter(b => b.area === activeTab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(b => b.passenger_name.toLowerCase().includes(s) || b.phone.includes(s));
    }
    return result.sort((a, b) => b.reservation_date.localeCompare(a.reservation_date));
  }, [bookings, activeTab, search]);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800', 'Confirmed': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800', 'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalMalang = bookings.filter(b => b.area === 'Malang').length;
  const totalSurabaya = bookings.filter(b => b.area === 'Surabaya').length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">👥 Data Penumpang</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          Semua ({bookings.length})
        </button>
        <button onClick={() => setActiveTab('Malang')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'Malang' ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          Malang ({totalMalang})
        </button>
        <button onClick={() => setActiveTab('Surabaya')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'Surabaya' ? 'bg-teal-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          Surabaya ({totalSurabaya})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama atau nomor WhatsApp..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ID Booking</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden sm:table-cell">WhatsApp</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Jumlah</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Area</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Rute</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Tidak ada data penumpang</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                  <td className="px-4 py-3 font-medium">{b.passenger_name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{b.phone}</td>
                  <td className="px-4 py-3 text-center">{b.passenger_count}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${b.area === 'Malang' ? 'bg-green-100 text-green-800' : 'bg-teal-100 text-teal-800'}`}>{b.area}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs">{b.origin} → {b.destination}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">{b.reservation_date} {b.reservation_time}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(b.booking_status)}`}>{b.booking_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <Users size={24} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Total Penumpang</p>
            <p className="text-xl font-bold">{filtered.reduce((s, b) => s + b.passenger_count, 0)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <Users size={24} className="text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Malang</p>
            <p className="text-xl font-bold">{filtered.filter(b => b.area === 'Malang').reduce((s, b) => s + b.passenger_count, 0)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
          <Users size={24} className="text-teal-500" />
          <div>
            <p className="text-xs text-gray-500">Surabaya</p>
            <p className="text-xl font-bold">{filtered.filter(b => b.area === 'Surabaya').reduce((s, b) => s + b.passenger_count, 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
