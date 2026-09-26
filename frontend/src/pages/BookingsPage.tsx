import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  AlertCircle,
  X,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Booking } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Booking for E-Ticket Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    apiClient<Booking[]>('/bookings')
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load booking history');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking? 90% of fare will be instantly refunded to your RailOne Wallet.')) {
      return;
    }

    setCancelLoading(true);
    setCancelMessage(null);

    try {
      const res = await apiClient<any>(`/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      setCancelMessage(res.message);
      fetchBookings();
      // Update selected booking view if open
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: 'Cancelled' });
      }
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Confirmed Reservations & History
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            My Railway Bookings
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
          <Ticket className="w-5 h-5" />
        </div>
      </div>

      {cancelMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cancelMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading your bookings...</p>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No Bookings Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't made any reservations yet. Search trains or book local suburban tickets to travel.
          </p>
          <button
            onClick={() => navigate('/reserved')}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            Book a Journey
          </button>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4 hover:border-blue-200 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700">
                      PNR: {b.pnr_number}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-[#1B254B] mt-1">
                    {b.train_name} (#{b.train_number})
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-blue-700">₹{b.fare_amount.toFixed(2)}</span>
                  <div className="text-[11px] text-slate-400">Class: {b.class_type}</div>
                </div>
              </div>

              {/* Route & Date */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">{b.source_code}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-slate-800">{b.dest_code}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{b.journey_date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View E-Ticket & QR</span>
                </button>

                {b.status === 'Confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    disabled={cancelLoading}
                    className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* E-TICKET MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
            {/* Ticket Header with RailOne Logo */}
            <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight leading-tight">
                    RailOne E-Ticket
                  </h3>
                  <span className="text-[10px] text-blue-100 uppercase tracking-widest">
                    Electronic Reservation Slip
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* QR Code Container */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-2">
                <div className="w-36 h-36 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center border border-slate-200 shadow-inner">
                  <QrCode className="w-28 h-28 text-slate-800" />
                </div>
                <div className="text-[10px] font-mono text-slate-400 break-all">
                  {selectedBooking.qr_data}
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  TTE SCANNER COMPLIANT
                </span>
              </div>

              {/* Booking Specifications */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">10-Digit PNR:</span>
                  <span className="font-black font-mono text-blue-700 text-sm">{selectedBooking.pnr_number}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Train:</span>
                  <span className="font-bold text-slate-800">{selectedBooking.train_name} ({selectedBooking.train_number})</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-bold text-slate-800">{selectedBooking.source_code} → {selectedBooking.dest_code}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Date of Journey:</span>
                  <span className="font-bold text-slate-800">{selectedBooking.journey_date}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400">Class:</span>
                  <span className="font-bold text-blue-700">{selectedBooking.class_type}</span>
                </div>
              </div>

              {/* Passengers Breakdown */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Passengers
                </h4>
                <div className="space-y-1.5">
                  {selectedBooking.tickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{t.passenger_name}</div>
                        <div className="text-[10px] text-slate-400">
                          Age: {t.passenger_age} • {t.passenger_gender} • {t.berth_type}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-blue-700">
                          {t.coach}-{t.berth}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-bold">{t.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Fare */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center text-xs">
                <span className="font-bold text-blue-900">Total Fare:</span>
                <span className="text-base font-black text-blue-700">₹{selectedBooking.fare_amount.toFixed(2)}</span>
              </div>

              {/* Print / Close */}
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
