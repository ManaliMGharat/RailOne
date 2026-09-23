import React, { useState, useEffect } from 'react';
import { Ticket, Search, CheckCircle2, RotateCcw, Eye, X } from 'lucide-react';
import api from '../../services/api';
import { Booking } from '../../types';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [search]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', {
        params: { search: search || undefined, limit: 50 },
      });
      setBookings(res.data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Passenger Reservations</h1>
        <p className="text-xs text-slate-500 mt-0.5">Inspect passenger bookings, PNR records, payment audits, and cancellations</p>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lookup by 10-digit PNR or Booking Reference..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Booking Ref</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">PNR</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Train</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Route</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Date</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Fare</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Status</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-900">{b.booking_reference}</td>
                <td className="px-4 py-3 font-mono font-bold text-rail-700">{b.pnr_number}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  #{b.train_number} {b.train_name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {b.from_station_code} → {b.to_station_code}
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono">{b.journey_date}</td>
                <td className="px-4 py-3 font-bold text-slate-900">₹{b.total_fare}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="p-1 text-slate-500 hover:text-slate-900"
                    title="View Full Booking Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base">Booking {selectedBooking.booking_reference}</h3>
                <span className="font-mono text-xs text-rail-700 font-bold">PNR: {selectedBooking.pnr_number}</span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                <div className="font-bold text-slate-900 mb-1">Train & Route</div>
                <div>Train: #{selectedBooking.train_number} - {selectedBooking.train_name}</div>
                <div>Route: {selectedBooking.from_station_name} ({selectedBooking.from_station_code}) → {selectedBooking.to_station_name} ({selectedBooking.to_station_code})</div>
                <div>Journey Date: {selectedBooking.journey_date}</div>
                <div>Class: {selectedBooking.class_code} ({selectedBooking.class_name})</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
                <div className="font-bold text-slate-900">Passengers ({selectedBooking.passengers.length})</div>
                <div className="space-y-1">
                  {selectedBooking.passengers.map((p) => (
                    <div key={p.id} className="flex justify-between border-b border-slate-200/60 pb-1">
                      <span>{p.passenger_name} ({p.age}/{p.gender})</span>
                      <span className="font-mono font-bold text-rail-700">
                        {p.coach_number ? `${p.coach_number}-${p.seat_number}` : p.current_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedBooking.payment && (
                <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                  <div className="font-bold text-slate-900 mb-1">Financial Payment Record</div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono font-semibold">{selectedBooking.payment.transaction_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold">₹{selectedBooking.payment.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span>{selectedBooking.payment.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-700 font-bold">{selectedBooking.payment.status}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
