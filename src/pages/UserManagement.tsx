import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Role, ALL_PERMISSIONS, SUPER_ADMIN_PERMISSIONS, FINANCE_ADMIN_PERMISSIONS, BOOKING_ADMIN_PERMISSIONS } from '../types';
import { hashPassword } from '../data/seed';
import { Plus, Edit2, Trash2, X, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function UserManagement() {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) return;
    deleteUser(id);
    setDeleteConfirm(null);
  };

  const toggleStatus = (user: User) => {
    updateUser({ ...user, status: user.status === 'active' ? 'inactive' : 'active' });
  };

  const roleLabel = (role: Role) => {
    if (role === 'SUPER_ADMIN') return 'Admin Master Data';
    if (role === 'FINANCE_ADMIN') return 'Finance Admin';
    return 'Booking Admin';
  };

  const roleColor = (role: Role) => {
    if (role === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-800';
    if (role === 'FINANCE_ADMIN') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">👤 User Management</h1>
        <button onClick={() => { setEditUser(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Finance</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Last Login</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(u.role)}`}>{roleLabel(u.role)}</span></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(u)} className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.permissions.includes('finance.view') ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">{u.last_login ? new Date(u.last_login).toLocaleString('id-ID') : 'Belum login'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditUser(u); setShowForm(true); }} className="p-1.5 hover:bg-yellow-50 rounded text-yellow-600"><Edit2 size={16} /></button>
                      <button onClick={() => setShowPermissions(u)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Shield size={16} /></button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form */}
      {showForm && <UserForm user={editUser} onClose={() => { setShowForm(false); setEditUser(null); }} onSave={(data) => {
        if (editUser) {
          updateUser({ ...editUser, ...data });
        } else {
          const newUser: User = {
            ...data,
            id: 'u_' + Date.now(),
            password_hash: hashPassword(data.password || 'default123'),
            created_at: new Date().toISOString(),
            last_login: null,
          };
          addUser(newUser);
        }
        setShowForm(false); setEditUser(null);
      }} />}

      {/* Permissions Modal */}
      {showPermissions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Permission: {showPermissions.name}</h3>
              <button onClick={() => setShowPermissions(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {['Dashboard', 'Booking', 'Passenger', 'Tracking', 'Activity', 'Finance', 'Report', 'User'].map(module => {
                  const modulePerms = ALL_PERMISSIONS.filter(p => p.module === module);
                  if (modulePerms.length === 0) return null;
                  return (
                    <div key={module}>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">{module}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {modulePerms.map(perm => {
                          const has = showPermissions.permissions.includes(perm.code);
                          return (
                            <div key={perm.code} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs ${has ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                              {has ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              {perm.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {showPermissions.id !== currentUser?.id && (
              <div className="p-4 border-t">
                <button onClick={() => {
                  const newPerms = [...showPermissions.permissions];
                  updateUser({ ...showPermissions, permissions: newPerms });
                  setShowPermissions(null);
                }} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 text-sm mb-4">Apakah Anda yakin ingin menghapus user ini?</p>
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

function UserForm({ user, onClose, onSave }: { user: User | null; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    role: user?.role || 'BOOKING_ADMIN' as Role,
    status: user?.status || 'active' as 'active' | 'inactive',
    permissions: user?.permissions || BOOKING_ADMIN_PERMISSIONS,
  });

  const handleRoleChange = (role: Role) => {
    let perms: string[];
    if (role === 'SUPER_ADMIN') perms = SUPER_ADMIN_PERMISSIONS;
    else if (role === 'FINANCE_ADMIN') perms = FINANCE_ADMIN_PERMISSIONS;
    else perms = BOOKING_ADMIN_PERMISSIONS;
    setForm({ ...form, role, permissions: perms });
  };

  const togglePermission = (code: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter(p => p !== code)
        : [...prev.permissions, code]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{user ? 'Edit User' : 'Tambah User'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Nama *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username *</label>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={form.role} onChange={e => handleRoleChange(e.target.value as Role)}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="SUPER_ADMIN">Admin Master Data</option>
              <option value="FINANCE_ADMIN">Finance Admin</option>
              <option value="BOOKING_ADMIN">Booking Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium mb-2">Permission</label>
            <div className="space-y-3 max-h-48 overflow-y-auto border p-3 rounded-lg">
              {['Dashboard', 'Booking', 'Passenger', 'Tracking', 'Activity', 'Finance', 'Report', 'User'].map(module => {
                const modulePerms = ALL_PERMISSIONS.filter(p => p.module === module);
                if (modulePerms.length === 0) return null;
                return (
                  <div key={module}>
                    <p className="text-xs font-medium text-gray-500 mb-1">{module}</p>
                    <div className="flex flex-wrap gap-1">
                      {modulePerms.map(perm => (
                        <label key={perm.code} className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${form.permissions.includes(perm.code) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                          <input type="checkbox" checked={form.permissions.includes(perm.code)} onChange={() => togglePermission(perm.code)} className="sr-only" />
                          {perm.name}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
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
