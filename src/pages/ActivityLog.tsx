import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, Filter } from 'lucide-react';

export default function ActivityLog() {
  const { activityLogs } = useData();
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterResult, setFilterResult] = useState('');

  const modules = [...new Set(activityLogs.map(l => l.module))];

  const filtered = useMemo(() => {
    let result = [...activityLogs];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l => l.user_name.toLowerCase().includes(s) || l.description.toLowerCase().includes(s) || l.module.toLowerCase().includes(s));
    }
    if (filterModule) result = result.filter(l => l.module === filterModule);
    if (filterResult) result = result.filter(l => l.result === filterResult);
    return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [activityLogs, search, filterModule, filterResult]);

  const resultColor = (result: string) => {
    if (result === 'SUCCESS') return 'bg-green-100 text-green-800';
    if (result === 'DENIED') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">📝 Activity Log</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari aktivitas..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Modul</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterResult} onChange={e => setFilterResult(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Hasil</option>
            <option value="SUCCESS">Success</option>
            <option value="DENIED">Denied</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Waktu</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Modul</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Aksi</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Deskripsi</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Tidak ada aktivitas</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 font-medium">{log.user_name}</td>
                  <td className="px-4 py-3">{log.module}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-xs max-w-[300px] truncate hidden lg:table-cell">{log.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${resultColor(log.result)}`}>{log.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-2">
        {filtered.map(log => (
          <div key={log.id} className="bg-white rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{log.user_name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${resultColor(log.result)}`}>{log.result}</span>
            </div>
            <p className="text-xs text-gray-600">{log.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <span>{log.module}</span>
              <span>•</span>
              <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
