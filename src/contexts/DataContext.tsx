import React, { createContext, useContext, useState, useCallback } from 'react';
import { Booking, BookingPayment, Transaction, ActivityLog, Area } from '../types';
import { SEED_BOOKINGS, SEED_PAYMENTS, SEED_TRANSACTIONS, SEED_ACTIVITY_LOGS } from '../data/seed';
import { useAuth } from './AuthContext';

interface DataContextType {
  bookings: Booking[];
  payments: BookingPayment[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  addBooking: (booking: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'updated_at'>) => Booking;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (id: string) => void;
  addPayment: (payment: Omit<BookingPayment, 'id' | 'created_at'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'transaction_code' | 'created_at' | 'updated_at'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  logActivity: (log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id' | 'user_name'>) => void;
  getNextBookingCode: () => string;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const stored = localStorage.getItem('agan_bookings');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('agan_bookings', JSON.stringify(SEED_BOOKINGS));
    return SEED_BOOKINGS;
  });

  const [payments, setPayments] = useState<BookingPayment[]>(() => {
    const stored = localStorage.getItem('agan_payments');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('agan_payments', JSON.stringify(SEED_PAYMENTS));
    return SEED_PAYMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('agan_transactions');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('agan_transactions', JSON.stringify(SEED_TRANSACTIONS));
    return SEED_TRANSACTIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const stored = localStorage.getItem('agan_logs');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('agan_logs', JSON.stringify(SEED_ACTIVITY_LOGS));
    return SEED_ACTIVITY_LOGS;
  });

  const persist = (key: string, data: unknown) => localStorage.setItem(key, JSON.stringify(data));

  const getNextBookingCode = useCallback(() => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const todayBookings = bookings.filter(b => b.booking_code.includes(today));
    const nextNum = todayBookings.length + 1;
    return `AGT-${today}-${String(nextNum).padStart(3, '0')}`;
  }, [bookings]);

  const logActivity = useCallback((log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id' | 'user_name'>) => {
    if (!user) return;
    const newLog: ActivityLog = {
      ...log,
      id: 'al_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      user_id: user.id,
      user_name: user.name,
      created_at: new Date().toISOString(),
    };
    setActivityLogs(prev => {
      const updated = [newLog, ...prev];
      persist('agan_logs', updated);
      return updated;
    });
  }, [user]);

  const addBooking = useCallback((data: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'updated_at'>) => {
    const code = getNextBookingCode();
    const now = new Date().toISOString();
    const booking: Booking = {
      ...data,
      id: 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      booking_code: code,
      created_at: now,
      updated_at: now,
    };
    setBookings(prev => {
      const updated = [...prev, booking];
      persist('agan_bookings', updated);
      return updated;
    });
    logActivity({ module: 'Booking', action: 'CREATE', entity_type: 'booking', entity_id: booking.id, description: `Membuat booking ${code} - ${data.passenger_name}`, old_value: '', new_value: '', result: 'SUCCESS', ip_address: '' });
    return booking;
  }, [getNextBookingCode, logActivity]);

  const updateBooking = useCallback((booking: Booking) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === booking.id ? { ...booking, updated_at: new Date().toISOString() } : b);
      persist('agan_bookings', updated);
      return updated;
    });
    logActivity({ module: 'Booking', action: 'UPDATE', entity_type: 'booking', entity_id: booking.id, description: `Mengupdate booking ${booking.booking_code}`, old_value: '', new_value: '', result: 'SUCCESS', ip_address: '' });
  }, [logActivity]);

  const deleteBooking = useCallback((id: string) => {
    const booking = bookings.find(b => b.id === id);
    setBookings(prev => {
      const updated = prev.filter(b => b.id !== id);
      persist('agan_bookings', updated);
      return updated;
    });
    if (booking) {
      logActivity({ module: 'Booking', action: 'DELETE', entity_type: 'booking', entity_id: id, description: `Menghapus booking ${booking.booking_code}`, old_value: '', new_value: '', result: 'SUCCESS', ip_address: '' });
    }
  }, [bookings, logActivity]);

  const addPayment = useCallback((data: Omit<BookingPayment, 'id' | 'created_at'>) => {
    const payment: BookingPayment = {
      ...data,
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      created_at: new Date().toISOString(),
    };
    setPayments(prev => {
      const updated = [...prev, payment];
      persist('agan_payments', updated);
      return updated;
    });
    // Update booking total_paid
    const booking = bookings.find(b => b.id === data.booking_id);
    if (booking) {
      const totalPaid = payments.filter(p => p.booking_id === data.booking_id).reduce((sum, p) => sum + p.amount, 0) + data.amount;
      const remaining = booking.total_fare - totalPaid;
      let paymentStatus: Booking['payment_status'] = 'Belum Bayar';
      if (totalPaid === 0) paymentStatus = 'Belum Bayar';
      else if (totalPaid >= booking.total_fare) paymentStatus = 'Lunas';
      else paymentStatus = 'DP';
      updateBooking({ ...booking, total_paid: totalPaid, remaining_balance: remaining, payment_status: paymentStatus });
    }
    logActivity({ module: 'Finance', action: 'CREATE', entity_type: 'payment', entity_id: payment.id, description: `Menambah pembayaran Rp${data.amount.toLocaleString()} untuk ${booking?.booking_code}`, old_value: '', new_value: '', result: 'SUCCESS', ip_address: '' });
  }, [bookings, payments, logActivity, updateBooking]);

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'transaction_code' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const trxCode = `TRX-${String(transactions.length + 1).padStart(3, '0')}`;
    const transaction: Transaction = {
      ...data,
      id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      transaction_code: trxCode,
      created_at: now,
      updated_at: now,
    };
    setTransactions(prev => {
      const updated = [...prev, transaction];
      persist('agan_transactions', updated);
      return updated;
    });
    logActivity({ module: 'Finance', action: 'CREATE', entity_type: 'transaction', entity_id: transaction.id, description: `Menambah transaksi ${trxCode} - ${data.category}`, old_value: '', new_value: '', result: 'SUCCESS', ip_address: '' });
  }, [transactions, logActivity]);

  const updateTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => {
      const updated = prev.map(t => t.id === transaction.id ? { ...transaction, updated_at: new Date().toISOString() } : t);
      persist('agan_transactions', updated);
      return updated;
    });
    logActivity({ module: 'Finance', action: 'UPDATE', entity_type: 'transaction', entity_id: transaction.id, description: `Mengupdate transaksi ${transaction.transaction_code}`, old_value: '', new_value: '', result: 'SUCCESS', ip_address: '' });
  }, [logActivity]);

  const deleteTransaction = useCallback((id: string) => {
    const trx = transactions.find(t => t.id === id);
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      persist('agan_transactions', updated);
      return updated;
    });
    if (trx) {
      logActivity({ module: 'Finance', action: 'DELETE', entity_type: 'transaction', entity_id: id, description: `Menghapus transaksi ${trx.transaction_code}`, old_value: '', new_value: '', result: 'SUCCESS', ip_address: '' });
    }
  }, [transactions, logActivity]);

  return (
    <DataContext.Provider value={{
      bookings, payments, transactions, activityLogs,
      addBooking, updateBooking, deleteBooking,
      addPayment, addTransaction, updateTransaction, deleteTransaction,
      logActivity, getNextBookingCode,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function useBookingsByArea(area?: Area) {
  const { bookings } = useData();
  if (!area) return bookings;
  return bookings.filter(b => b.area === area);
}
