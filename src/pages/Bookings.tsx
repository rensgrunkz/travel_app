import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Booking, BookingStatus, PaymentStatus, Area } from '../types';
import { Plus, Search, Filter, Edit2, Trash2, Eye, X, DollarSign } from 'lucide-react';

export default function Bookings() {
  const { area: areaParam } = useParams<{ area?: string }>();
  const { user, hasPermission } = useAuth();
  const { bookings, addBooking, updateBooking, deleteBooking, addPayment, payments } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Booking | null>(null);
  const [showPayment, setShowPayment] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterAdmin, setFilterAdmin] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const areaFilter = areaParam === 'malang' ? 'Malang' : areaParam === 'surabaya' ? 'Surabaya' : null;

  const filtered = useMemo(() => {
    let result = [...bookings];
    if (areaFilter) result = result.filter(b => b.area === areaFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(b => b.passenger_name.toLowerCase().includes(s) || b.phone.includes(s) || b.booking_code.toLowerCase().includes(s));
    }
    if (filterStatus) result = result.filter(b => b.booking_status === filterStatus);
    if (filterPayment) result = result.filter(b => b.payment_status === filterPayment);
    if (filterAdmin) result = result.filter(b => b.handled_by === filterAdmin);
    return result.sort((a, b) => {
      const dateA = a.reservation_date + a.reservation_time;
      const dateB = b.reservation_date + b.reservation_time;
      return dateA.localeCompare(dateB);
    });
  }, [bookings, areaFilter, search, filterStatus, filterPayment, filterAdmin]);

  const admins = [...new Set(bookings.map(b => b.handled_by))];

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800', 'Confirmed': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800', 'Cancelled': 'bg-red-100 text-red-800',
      'Belum Bayar': 'bg-red-100 text-red-800', 'DP': 'bg-orange-100 text-orange-800',
      'Lunas': 'bg-green-100 text-green-800', 'Refund': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = (id: string) => {
    deleteBooking(id);
    setDeleteConfirm(null);
    setShowDetail(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {areaFilter ? `Booking ${areaFilter}` : 'Semua Booking'}
          </h1>
          <p className="text-sm text-gray-500">{filtered.length} booking ditemukan</p>
        </div>
        {hasPermission('booking.create') && (
          <button onClick={() => { setEditBooking(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <Plus size={18} /> Tambah Booking
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari nama, WhatsApp, ID booking..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Semua Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Semua Pembayaran</option>
            <option value="Belum Bayar">Belum Bayar</option>
            <option value="DP">DP</option>
            <option value="Lunas">Lunas</option>
            <option value="Refund">Refund</option>
          </select>
          <select value={filterAdmin} onChange={e => setFilterAdmin(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Semua Admin</option>
            {admins.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Area</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Tarif</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Bayar</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden xl:table-cell">Admin</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-500">Tidak ada data booking</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                  <td className="px-4 py-3 font-medium">{b.passenger_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{b.area}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{b.reservation_date} {b.reservation_time}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">Rp{b.total_fare.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(b.booking_status)}`}>{b.booking_status}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(b.payment_status)}`}>{b.payment_status}</span></td>
                  <td className="px-4 py-3 hidden xl:table-cell text-xs">{b.handled_by}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setShowDetail(b)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Detail"><Eye size={16} /></button>
                      {hasPermission('booking.update') && <button onClick={() => { setEditBooking(b); setShowForm(true); }} className="p-1.5 hover:bg-yellow-50 rounded text-yellow-600" title="Edit"><Edit2 size={16} /></button>}
                      {hasPermission('booking.delete') && <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Hapus"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showForm && <BookingForm booking={editBooking} onClose={() => { setShowForm(false); setEditBooking(null); }} onSave={(data) => {
        if (editBooking) { updateBooking({ ...editBooking, ...data }); }
        else { addBooking({ ...data, handled_by: user!.name }); }
        setShowForm(false); setEditBooking(null);
      }} />}

      {/* Detail Modal */}
      {showDetail && <BookingDetail booking={showDetail} payments={payments.filter(p => p.booking_id === showDetail.id)} onClose={() => setShowDetail(null)}
        onEdit={() => { setEditBooking(showDetail); setShowForm(true); setShowDetail(null); }}
        onPayment={() => { setShowPayment(showDetail); setShowDetail(null); }}
        onStatusChange={(status) => { updateBooking({ ...showDetail, booking_status: status }); setShowDetail(null); }}
        onDelete={() => setDeleteConfirm(showDetail.id)}
      />}

      {/* Payment Modal */}
      {showPayment && <PaymentForm booking={showPayment} onClose={() => setShowPayment(null)} onSave={(data) => {
        addPayment({ ...data, booking_id: showPayment.id, recorded_by: user!.name });
        setShowPayment(null);
      }} />}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 text-sm mb-4">Apakah Anda yakin ingin menghapus booking ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingForm({ booking, onClose, onSave }: { booking: Booking | null; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    passenger_name: booking?.passenger_name || '',
    phone: booking?.phone || '',
    passenger_count: booking?.passenger_count || 1,
    area: booking?.area || 'Malang' as Area,
    origin: booking?.origin || '',
    destination: booking?.destination || '',
    reservation_date: booking?.reservation_date || new Date().toISOString().split('T')[0],
    reservation_time: booking?.reservation_time || '08:00',
    total_fare: booking?.total_fare || 0,
    booking_status: booking?.booking_status || 'Pending' as BookingStatus,
    notes: booking?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.passenger_name) errs.passenger_name = 'Nama wajib diisi';
    if (!form.phone || !/^[0-9]{10,15}$/.test(form.phone.replace(/\D/g, ''))) errs.phone = 'Nomor WhatsApp tidak valid';
    if (form.passenger_count < 1) errs.passenger_count = 'Minimal 1 penumpang';
    if (!form.origin) errs.origin = 'Asal wajib diisi';
    if (!form.destination) errs.destination = 'Tujuan wajib diisi';
    if (!form.reservation_date) errs.reservation_date = 'Tanggal wajib diisi';
    if (!form.reservation_time) errs.reservation_time = 'Jam wajib diisi';
    if (form.total_fare < 0) errs.total_fare = 'Tarif tidak boleh negatif';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const totalPaid = booking?.total_paid || 0;
    const remaining = form.total_fare - totalPaid;
    let paymentStatus: PaymentStatus = 'Belum Bayar';
    if (totalPaid === 0) paymentStatus = 'Belum Bayar';
    else if (totalPaid >= form.total_fare) paymentStatus = 'Lunas';
    else paymentStatus = 'DP';
    onSave({ ...form, total_paid: totalPaid, remaining_balance: remaining, payment_status: paymentStatus });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{booking ? 'Edit Booking' : 'Tambah Booking'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penumpang *</label>
            <input type="text" value={form.passenger_name} onChange={e => setForm({ ...form, passenger_name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.passenger_name ? 'border-red-500' : ''}`} />
            {errors.passenger_name && <p className="text-xs text-red-500 mt-1">{errors.passenger_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp *</label>
            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`} placeholder="08xxxxxxxxxx" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Penumpang *</label>
              <input type="number" min="1" value={form.passenger_count} onChange={e => setForm({ ...form, passenger_count: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
              <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value as Area })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Malang">Malang</option>
                <option value="Surabaya">Surabaya</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asal *</label>
              <input type="text" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.origin ? 'border-red-500' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan *</label>
              <input type="text" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.destination ? 'border-red-500' : ''}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
              <input type="date" value={form.reservation_date} onChange={e => setForm({ ...form, reservation_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam *</label>
              <input type="time" value={form.reservation_time} onChange={e => setForm({ ...form, reservation_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Tarif (Rp) *</label>
            <input type="number" min="0" value={form.total_fare} onChange={e => setForm({ ...form, total_fare: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {booking && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Booking</label>
              <select value={form.booking_status} onChange={e => setForm({ ...form, booking_status: e.target.value as BookingStatus })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              {booking ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookingDetail({ booking, payments, onClose, onEdit, onPayment, onStatusChange, onDelete }: {
  booking: Booking; payments: any[]; onClose: () => void; onEdit: () => void; onPayment: () => void;
  onStatusChange: (status: BookingStatus) => void; onDelete: () => void;
}) {
  const { hasPermission } = useAuth();
  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800', 'Confirmed': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800', 'Cancelled': 'bg-red-100 text-red-800',
      'Belum Bayar': 'bg-red-100 text-red-800', 'DP': 'bg-orange-100 text-orange-800',
      'Lunas': 'bg-green-100 text-green-800', 'Refund': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Detail Reservasi</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="ID Booking" value={booking.booking_code} />
            <InfoRow label="Nama Penumpang" value={booking.passenger_name} />
            <InfoRow label="WhatsApp" value={booking.phone} />
            <InfoRow label="Jumlah Penumpang" value={String(booking.passenger_count)} />
            <InfoRow label="Area" value={booking.area} />
            <InfoRow label="Asal → Tujuan" value={`${booking.origin} → ${booking.destination}`} />
            <InfoRow label="Tanggal Reservasi" value={booking.reservation_date} />
            <InfoRow label="Jam Reservasi" value={booking.reservation_time} />
            <InfoRow label="Total Tarif" value={`Rp${booking.total_fare.toLocaleString()}`} />
            <InfoRow label="Total Dibayar" value={`Rp${booking.total_paid.toLocaleString()}`} />
            <InfoRow label="Sisa Pembayaran" value={`Rp${booking.remaining_balance.toLocaleString()}`} />
            <InfoRow label="Admin Handle" value={booking.handled_by} />
            <div>
              <span className="text-xs text-gray-500">Status Booking</span>
              <div className="mt-1"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(booking.booking_status)}`}>{booking.booking_status}</span></div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Status Pembayaran</span>
              <div className="mt-1"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(booking.payment_status)}`}>{booking.payment_status}</span></div>
            </div>
          </div>
          {booking.notes && <InfoRow label="Catatan" value={booking.notes} />}
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            <span>Created: {new Date(booking.created_at).toLocaleString('id-ID')}</span>
            <span>Updated: {new Date(booking.updated_at).toLocaleString('id-ID')}</span>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">Riwayat Pembayaran</h4>
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                    <div>
                      <span className="font-medium">{p.payment_type}</span>
                      <span className="text-gray-500 text-xs ml-2">{p.payment_method}</span>
                    </div>
                    <span className="font-medium text-green-600">Rp{p.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-3 flex flex-wrap gap-2">
            {hasPermission('booking.update') && (
              <>
                <button onClick={onEdit} className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600">Edit</button>
                <button onClick={onPayment} className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 flex items-center gap-1"><DollarSign size={14} /> Tambah Pembayaran</button>
                <select onChange={e => { if (e.target.value) onStatusChange(e.target.value as BookingStatus); }} defaultValue=""
                  className="px-3 py-2 border rounded-lg text-xs">
                  <option value="">Ubah Status...</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </>
            )}
            {hasPermission('booking.delete') && (
              <button onClick={onDelete} className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">Hapus</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({ booking, onClose, onSave }: { booking: Booking; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: booking.remaining_balance,
    payment_method: 'Cash' as const,
    payment_type: 'DP',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Tambah Pembayaran</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p>Booking: <span className="font-mono font-medium">{booking.booking_code}</span></p>
            <p>Sisa: <span className="font-bold text-red-600">Rp{booking.remaining_balance.toLocaleString()}</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jumlah (Rp) *</label>
            <input type="number" min="1" max={booking.remaining_balance} value={form.amount} onChange={e => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Metode</label>
              <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option>Cash</option><option>Transfer</option><option>QRIS</option><option>E-Wallet</option><option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select value={form.payment_type} onChange={e => setForm({ ...form, payment_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option>DP</option><option>Pelunasan</option><option>Tambahan</option>
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
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Simpan Pembayaran</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
