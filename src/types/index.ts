export type Role = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'BOOKING_ADMIN';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Belum Bayar' | 'DP' | 'Lunas' | 'Refund';
export type Area = 'Malang' | 'Surabaya';
export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'Cash' | 'Transfer' | 'QRIS' | 'E-Wallet' | 'Lainnya';

export interface User {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: Role;
  status: 'active' | 'inactive';
  permissions: string[];
  created_at: string;
  last_login: string | null;
}

export interface Booking {
  id: string;
  booking_code: string;
  passenger_name: string;
  phone: string;
  passenger_count: number;
  area: Area;
  origin: string;
  destination: string;
  reservation_date: string;
  reservation_time: string;
  total_fare: number;
  total_paid: number;
  remaining_balance: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  handled_by: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BookingPayment {
  id: string;
  booking_id: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: string;
  recorded_by: string;
  notes: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_code: string;
  booking_id: string | null;
  transaction_date: string;
  transaction_type: TransactionType;
  category: string;
  description: string;
  income_amount: number;
  expense_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  recorded_by: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  module: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  old_value: string;
  new_value: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  ip_address: string;
  created_at: string;
}

export interface Permission {
  code: string;
  name: string;
  module: string;
}

export const ALL_PERMISSIONS: Permission[] = [
  { code: 'dashboard.view', name: 'View Dashboard', module: 'Dashboard' },
  { code: 'booking.view', name: 'View Bookings', module: 'Booking' },
  { code: 'booking.create', name: 'Create Booking', module: 'Booking' },
  { code: 'booking.update', name: 'Update Booking', module: 'Booking' },
  { code: 'booking.delete', name: 'Delete Booking', module: 'Booking' },
  { code: 'passenger.view', name: 'View Passengers', module: 'Passenger' },
  { code: 'tracking.view', name: 'View Tracking', module: 'Tracking' },
  { code: 'activity.view', name: 'View Activity Log', module: 'Activity' },
  { code: 'finance.view', name: 'View Finance', module: 'Finance' },
  { code: 'finance.create', name: 'Create Transaction', module: 'Finance' },
  { code: 'finance.update', name: 'Update Transaction', module: 'Finance' },
  { code: 'finance.delete', name: 'Delete Transaction', module: 'Finance' },
  { code: 'finance.export', name: 'Export Finance', module: 'Finance' },
  { code: 'report.finance.view', name: 'View Finance Reports', module: 'Report' },
  { code: 'report.finance.export', name: 'Export Finance Reports', module: 'Report' },
  { code: 'user.view', name: 'View Users', module: 'User' },
  { code: 'user.create', name: 'Create User', module: 'User' },
  { code: 'user.update', name: 'Update User', module: 'User' },
  { code: 'user.delete', name: 'Delete User', module: 'User' },
  { code: 'user.permission.manage', name: 'Manage Permissions', module: 'User' },
];

export const SUPER_ADMIN_PERMISSIONS = ALL_PERMISSIONS.map(p => p.code);

export const FINANCE_ADMIN_PERMISSIONS = ALL_PERMISSIONS
  .filter(p => !['user.view', 'user.create', 'user.update', 'user.delete', 'user.permission.manage'].includes(p.code))
  .map(p => p.code);

export const BOOKING_ADMIN_PERMISSIONS = ALL_PERMISSIONS
  .filter(p => ['dashboard.view', 'booking.view', 'booking.create', 'booking.update', 'booking.delete', 'passenger.view', 'tracking.view', 'activity.view'].includes(p.code))
  .map(p => p.code);
