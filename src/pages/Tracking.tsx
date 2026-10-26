import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Tracking() {
  const { bookings } = useData();
  const { users } = useAuth();

  const adminStats = useMemo(() => {
    const admins = users.filter(u => u.role !== 'SUPER_ADMIN');
    return admins.map(admin => {
      const adminBookings = bookings.filter(b => b.handled_by === admin.name);
      return {
        name: admin.name,
        total: adminBookings.length,
        pending: adminBookings.filter(b => b.booking_status === 'Pending').length,
        confirmed: adminBookings.filter(b => b.booking_status === 'Confirmed').length,
        completed: adminBookings.filter(b => b.booking_status === 'Completed').length,
        cancelled: adminBookings.filter(b => b.booking_status === 'Cancelled').length,
        malang: adminBookings.filter(b => b.area === 'Malang').length,
        surabaya: adminBookings.filter(b => b.area === 'Surabaya').length,
      };
    });
  }, [bookings, users]);

  const chartData = adminStats.map(a => ({ name: a.name, Booking: a.total }));
  const statusData = [
    { name: 'Pending', value: bookings.filter(b => b.booking_status === 'Pending').length, color: '#eab308' },
    { name: 'Confirmed', value: bookings.filter(b => b.booking_status === 'Confirmed').length, color: '#3b82f6' },
    { name: 'Completed', value: bookings.filter(b => b.booking_status === 'Completed').length, color: '#22c55e' },
    { name: 'Cancelled', value: bookings.filter(b => b.booking_status === 'Cancelled').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📊 Tracking Admin</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminStats.map((admin, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">{admin.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-bold text-blue-600">{admin.total}</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="font-bold text-yellow-600">{admin.pending}</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-xs text-gray-500">Confirmed</p>
                <p className="font-bold text-green-600">{admin.confirmed}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="font-bold text-emerald-600">{admin.completed}</p>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <p className="text-xs text-gray-500">Cancelled</p>
                <p className="font-bold text-red-600">{admin.cancelled}</p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <p className="text-xs text-gray-500">Malang/Sby</p>
                <p className="font-bold text-purple-600">{admin.malang}/{admin.surabaya}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Ringkasan Per Admin</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Admin</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Pending</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Confirmed</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Completed</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Cancelled</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Malang</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Surabaya</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {adminStats.map((admin, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{admin.name}</td>
                  <td className="px-4 py-3 text-center font-bold">{admin.total}</td>
                  <td className="px-4 py-3 text-center"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">{admin.pending}</span></td>
                  <td className="px-4 py-3 text-center"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{admin.confirmed}</span></td>
                  <td className="px-4 py-3 text-center"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{admin.completed}</span></td>
                  <td className="px-4 py-3 text-center"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">{admin.cancelled}</span></td>
                  <td className="px-4 py-3 text-center">{admin.malang}</td>
                  <td className="px-4 py-3 text-center">{admin.surabaya}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Booking Per Admin</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Booking" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Distribusi Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
