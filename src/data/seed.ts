import { User, Booking, BookingPayment, Transaction, ActivityLog } from '../types';

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(36) + '_' + btoa(password).slice(0, 8);
}

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin Master Data',
    username: 'master',
    password_hash: hashPassword('master123'),
    role: 'SUPER_ADMIN',
    status: 'active',
    permissions: ['dashboard.view','booking.view','booking.create','booking.update','booking.delete','passenger.view','tracking.view','activity.view','finance.view','finance.create','finance.update','finance.delete','finance.export','report.finance.view','report.finance.export','user.view','user.create','user.update','user.delete','user.permission.manage'],
    created_at: '2026-01-01T00:00:00Z',
    last_login: null,
  },
  {
    id: 'u2',
    name: 'Admin 1',
    username: 'admin1',
    password_hash: hashPassword('admin123'),
    role: 'FINANCE_ADMIN',
    status: 'active',
    permissions: ['dashboard.view','booking.view','booking.create','booking.update','booking.delete','passenger.view','tracking.view','activity.view','finance.view','finance.create','finance.update','finance.delete','finance.export','report.finance.view','report.finance.export'],
    created_at: '2026-01-01T00:00:00Z',
    last_login: null,
  },
  {
    id: 'u3',
    name: 'Admin 2',
    username: 'admin2',
    password_hash: hashPassword('admin123'),
    role: 'FINANCE_ADMIN',
    status: 'active',
    permissions: ['dashboard.view','booking.view','booking.create','booking.update','booking.delete','passenger.view','tracking.view','activity.view','finance.view','finance.create','finance.update','finance.delete','finance.export','report.finance.view','report.finance.export'],
    created_at: '2026-01-01T00:00:00Z',
    last_login: null,
  },
  {
    id: 'u4',
    name: 'Admin 3',
    username: 'admin3',
    password_hash: hashPassword('admin123'),
    role: 'BOOKING_ADMIN',
    status: 'active',
    permissions: ['dashboard.view','booking.view','booking.create','booking.update','booking.delete','passenger.view','tracking.view','activity.view'],
    created_at: '2026-01-01T00:00:00Z',
    last_login: null,
  },
  {
    id: 'u5',
    name: 'Admin 4',
    username: 'admin4',
    password_hash: hashPassword('admin123'),
    role: 'BOOKING_ADMIN',
    status: 'active',
    permissions: ['dashboard.view','booking.view','booking.create','booking.update','booking.delete','passenger.view','tracking.view','activity.view'],
    created_at: '2026-01-01T00:00:00Z',
    last_login: null,
  },
  {
    id: 'u6',
    name: 'Admin 5',
    username: 'admin5',
    password_hash: hashPassword('admin123'),
    role: 'BOOKING_ADMIN',
    status: 'active',
    permissions: ['dashboard.view','booking.view','booking.create','booking.update','booking.delete','passenger.view','tracking.view','activity.view'],
    created_at: '2026-01-01T00:00:00Z',
    last_login: null,
  },
];

const today = new Date().toISOString().split('T')[0];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b1', booking_code: 'AGT-20261004-001', passenger_name: 'Budi Santoso',
    phone: '081234567890', passenger_count: 2, area: 'Malang', origin: 'Malang', destination: 'Surabaya',
    reservation_date: today, reservation_time: '08:00', total_fare: 500000, total_paid: 500000,
    remaining_balance: 0, booking_status: 'Confirmed', payment_status: 'Lunas',
    handled_by: 'Admin 1', notes: 'Penumpang regular', created_at: '2026-10-04T06:00:00Z', updated_at: '2026-10-04T06:00:00Z',
  },
  {
    id: 'b2', booking_code: 'AGT-20261004-002', passenger_name: 'Andi Wijaya',
    phone: '082345678901', passenger_count: 1, area: 'Surabaya', origin: 'Surabaya', destination: 'Malang',
    reservation_date: today, reservation_time: '10:00', total_fare: 250000, total_paid: 100000,
    remaining_balance: 150000, booking_status: 'Pending', payment_status: 'DP',
    handled_by: 'Admin 3', notes: '', created_at: '2026-10-04T07:00:00Z', updated_at: '2026-10-04T07:00:00Z',
  },
  {
    id: 'b3', booking_code: 'AGT-20261004-003', passenger_name: 'Sinta Dewi',
    phone: '083456789012', passenger_count: 3, area: 'Malang', origin: 'Malang', destination: 'Surabaya',
    reservation_date: today, reservation_time: '14:00', total_fare: 750000, total_paid: 750000,
    remaining_balance: 0, booking_status: 'Confirmed', payment_status: 'Lunas',
    handled_by: 'Admin 2', notes: 'VIP passenger', created_at: '2026-10-04T08:00:00Z', updated_at: '2026-10-04T08:00:00Z',
  },
  {
    id: 'b4', booking_code: 'AGT-20261004-004', passenger_name: 'Rudi Hartono',
    phone: '084567890123', passenger_count: 1, area: 'Surabaya', origin: 'Surabaya', destination: 'Malang',
    reservation_date: today, reservation_time: '16:00', total_fare: 250000, total_paid: 0,
    remaining_balance: 250000, booking_status: 'Pending', payment_status: 'Belum Bayar',
    handled_by: 'Admin 4', notes: '', created_at: '2026-10-04T09:00:00Z', updated_at: '2026-10-04T09:00:00Z',
  },
  {
    id: 'b5', booking_code: 'AGT-20261004-005', passenger_name: 'Dewi Lestari',
    phone: '085678901234', passenger_count: 2, area: 'Malang', origin: 'Malang', destination: 'Surabaya',
    reservation_date: today, reservation_time: '09:00', total_fare: 500000, total_paid: 500000,
    remaining_balance: 0, booking_status: 'Completed', payment_status: 'Lunas',
    handled_by: 'Admin 1', notes: '', created_at: '2026-10-03T06:00:00Z', updated_at: '2026-10-04T10:00:00Z',
  },
  {
    id: 'b6', booking_code: 'AGT-20261003-001', passenger_name: 'Agus Prasetyo',
    phone: '086789012345', passenger_count: 4, area: 'Surabaya', origin: 'Surabaya', destination: 'Malang',
    reservation_date: '2026-10-03', reservation_time: '07:00', total_fare: 1000000, total_paid: 500000,
    remaining_balance: 500000, booking_status: 'Completed', payment_status: 'DP',
    handled_by: 'Admin 5', notes: 'Group booking', created_at: '2026-10-02T06:00:00Z', updated_at: '2026-10-03T08:00:00Z',
  },
  {
    id: 'b7', booking_code: 'AGT-20261003-002', passenger_name: 'Fitri Handayani',
    phone: '087890123456', passenger_count: 1, area: 'Malang', origin: 'Malang', destination: 'Surabaya',
    reservation_date: '2026-10-03', reservation_time: '12:00', total_fare: 250000, total_paid: 250000,
    remaining_balance: 0, booking_status: 'Cancelled', payment_status: 'Refund',
    handled_by: 'Admin 2', notes: 'Cancelled by passenger', created_at: '2026-10-02T07:00:00Z', updated_at: '2026-10-03T09:00:00Z',
  },
  {
    id: 'b8', booking_code: 'AGT-20261005-001', passenger_name: 'Hendra Kurniawan',
    phone: '088901234567', passenger_count: 2, area: 'Malang', origin: 'Malang', destination: 'Surabaya',
    reservation_date: '2026-10-05', reservation_time: '08:00', total_fare: 500000, total_paid: 200000,
    remaining_balance: 300000, booking_status: 'Confirmed', payment_status: 'DP',
    handled_by: 'Admin 3', notes: '', created_at: '2026-10-04T10:00:00Z', updated_at: '2026-10-04T10:00:00Z',
  },
];

export const SEED_PAYMENTS: BookingPayment[] = [
  { id: 'p1', booking_id: 'b1', payment_date: today, amount: 200000, payment_method: 'Transfer', payment_type: 'DP', recorded_by: 'Admin 1', notes: 'DP via BCA', created_at: '2026-10-04T06:30:00Z' },
  { id: 'p2', booking_id: 'b1', payment_date: today, amount: 300000, payment_method: 'Cash', payment_type: 'Pelunasan', recorded_by: 'Admin 1', notes: 'Pelunasan cash', created_at: '2026-10-04T07:00:00Z' },
  { id: 'p3', booking_id: 'b2', payment_date: today, amount: 100000, payment_method: 'QRIS', payment_type: 'DP', recorded_by: 'Admin 3', notes: 'DP via QRIS', created_at: '2026-10-04T07:30:00Z' },
  { id: 'p4', booking_id: 'b3', payment_date: today, amount: 750000, payment_method: 'Transfer', payment_type: 'Pelunasan', recorded_by: 'Admin 2', notes: 'Full payment', created_at: '2026-10-04T08:30:00Z' },
  { id: 'p5', booking_id: 'b5', payment_date: today, amount: 500000, payment_method: 'E-Wallet', payment_type: 'Pelunasan', recorded_by: 'Admin 1', notes: 'GoPay', created_at: '2026-10-04T09:30:00Z' },
  { id: 'p6', booking_id: 'b8', payment_date: today, amount: 200000, payment_method: 'Cash', payment_type: 'DP', recorded_by: 'Admin 3', notes: 'DP Cash', created_at: '2026-10-04T10:30:00Z' },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: 't1', transaction_code: 'TRX-001', booking_id: 'b1', transaction_date: today, transaction_type: 'income', category: 'Pembayaran Reservasi', description: 'Pembayaran Budi Santoso', income_amount: 500000, expense_amount: 0, payment_method: 'Transfer', payment_status: 'Lunas', recorded_by: 'Admin 1', notes: '', created_at: '2026-10-04T06:30:00Z', updated_at: '2026-10-04T06:30:00Z' },
  { id: 't2', transaction_code: 'TRX-002', booking_id: 'b3', transaction_date: today, transaction_type: 'income', category: 'Pembayaran Reservasi', description: 'Pembayaran Sinta Dewi', income_amount: 750000, expense_amount: 0, payment_method: 'Transfer', payment_status: 'Lunas', recorded_by: 'Admin 2', notes: '', created_at: '2026-10-04T08:30:00Z', updated_at: '2026-10-04T08:30:00Z' },
  { id: 't3', transaction_code: 'TRX-003', booking_id: null, transaction_date: today, transaction_type: 'expense', category: 'BBM', description: 'BBM perjalanan Malang-Surabaya', income_amount: 0, expense_amount: 350000, payment_method: 'Cash', payment_status: 'Lunas', recorded_by: 'Admin 1', notes: '', created_at: '2026-10-04T07:00:00Z', updated_at: '2026-10-04T07:00:00Z' },
  { id: 't4', transaction_code: 'TRX-004', booking_id: null, transaction_date: today, transaction_type: 'expense', category: 'Tol', description: 'Tol Surabaya-Malang', income_amount: 0, expense_amount: 150000, payment_method: 'Cash', payment_status: 'Lunas', recorded_by: 'Admin 1', notes: '', created_at: '2026-10-04T07:15:00Z', updated_at: '2026-10-04T07:15:00Z' },
  { id: 't5', transaction_code: 'TRX-005', booking_id: 'b5', transaction_date: today, transaction_type: 'income', category: 'Pelunasan', description: 'Pelunasan Dewi Lestari', income_amount: 500000, expense_amount: 0, payment_method: 'E-Wallet', payment_status: 'Lunas', recorded_by: 'Admin 1', notes: '', created_at: '2026-10-04T09:30:00Z', updated_at: '2026-10-04T09:30:00Z' },
  { id: 't6', transaction_code: 'TRX-006', booking_id: null, transaction_date: today, transaction_type: 'expense', category: 'Makan/Minum Driver', description: 'Makan driver', income_amount: 0, expense_amount: 75000, payment_method: 'Cash', payment_status: 'Lunas', recorded_by: 'Admin 2', notes: '', created_at: '2026-10-04T12:00:00Z', updated_at: '2026-10-04T12:00:00Z' },
  { id: 't7', transaction_code: 'TRX-007', booking_id: 'b2', transaction_date: today, transaction_type: 'income', category: 'DP', description: 'DP Andi Wijaya', income_amount: 100000, expense_amount: 0, payment_method: 'QRIS', payment_status: 'DP', recorded_by: 'Admin 3', notes: '', created_at: '2026-10-04T07:30:00Z', updated_at: '2026-10-04T07:30:00Z' },
];

export const SEED_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'al1', user_id: 'u2', user_name: 'Admin 1', module: 'Booking', action: 'CREATE', entity_type: 'booking', entity_id: 'b1', description: 'Membuat booking AGT-20261004-001', old_value: '', new_value: '', result: 'SUCCESS', ip_address: '192.168.1.100', created_at: '2026-10-04T06:00:00Z' },
  { id: 'al2', user_id: 'u4', user_name: 'Admin 3', module: 'Booking', action: 'CREATE', entity_type: 'booking', entity_id: 'b2', description: 'Membuat booking AGT-20261004-002', old_value: '', new_value: '', result: 'SUCCESS', ip_address: '192.168.1.101', created_at: '2026-10-04T07:00:00Z' },
  { id: 'al3', user_id: 'u3', user_name: 'Admin 2', module: 'Booking', action: 'CREATE', entity_type: 'booking', entity_id: 'b3', description: 'Membuat booking AGT-20261004-003', old_value: '', new_value: '', result: 'SUCCESS', ip_address: '192.168.1.102', created_at: '2026-10-04T08:00:00Z' },
  { id: 'al4', user_id: 'u5', user_name: 'Admin 4', module: 'Finance', action: 'VIEW', entity_type: 'finance', entity_id: '', description: 'Mencoba mengakses modul keuangan', old_value: '', new_value: '', result: 'DENIED', ip_address: '192.168.1.103', created_at: '2026-10-04T09:00:00Z' },
  { id: 'al5', user_id: 'u2', user_name: 'Admin 1', module: 'Finance', action: 'EXPORT', entity_type: 'report', entity_id: '', description: 'Export laporan keuangan harian', old_value: '', new_value: '', result: 'SUCCESS', ip_address: '192.168.1.100', created_at: '2026-10-04T10:00:00Z' },
];

export { hashPassword };
