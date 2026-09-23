import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Ticket, Train, Calendar, ArrowRight, XCircle, Printer, 
  RotateCcw, CheckCircle2, AlertCircle, RefreshCw, Eye 
} from 'lucide-react';
import api from '../services/api';
import { Booking } from '../types';

export const MyBookings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const newBookingRef = searchParams.get('new_booking');
  const newPnr = searchParams.get('pnr');

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [selectedPaxIds, setSelectedPaxIds] = useState<number[]>([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelResult, setCancelResult] = useState<any | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/bookings', {
        params: { status_filter: activeTab },
      });
      setBookings(res.data);
    } catch (err: any) {
      setError('Unable to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = (booking: Booking) => {
    setCancellingBooking(booking);
    // Default select all active passengers
    const activePax = booking.passengers
      .filter((p) => p.current_status !== 'CANCELLED')
      .map((p) => p.id);
    setSelectedPaxIds(activePax);
    setCancelResult(null);
  };

  const togglePaxSelection = (id: number) => {
    if (selectedPaxIds.includes(id)) {
      setSelectedPaxIds(selectedPaxIds.filter((p) => p !== id));
    } else {
      setSelectedPaxIds([...selectedPaxIds, id]);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking || selectedPaxIds.length === 0) return;
    setCancelLoading(true);
    try {
      const res = await api.post(`/bookings/${cancellingBooking.id}/cancel`, {
        passenger_ids: selectedPaxIds,
      });
      setCancelResult(res.data);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cancellation failed.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Newly confirmed notification banner */}
      {newBookingRef && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">Booking Successful! 🎉</div>
              <div className="text-xs text-emerald-700">
                Reservation <span className="font-mono font-bold">{newBookingRef}</span> confirmed with PNR <span className="font-mono font-bold">{newPnr}</span>.
              </div>
            </div>
          </div>
          <Link
            to={`/pnr?pnr=${newPnr}`}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
          >
            Check Status
          </Link>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Bookings & Tickets</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your upcoming journeys, view e-tickets, and process refunds</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-rail-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No {activeTab} bookings</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any {activeTab} bookings in this section. Plan a new journey today.
          </p>
          <Link
            to="/search"
            className="inline-block mt-2 px-5 py-2.5 bg-rail-600 hover:bg-rail-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            Search & Book Trains
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isCancelled = b.status === 'CANCELLED';
            const canCancel = !isCancelled && activeTab === 'upcoming';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Top Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded-md">
                      #{b.train_number}
                    </span>
                    <span className="font-bold text-base text-slate-900">{b.train_name}</span>
                    <span className="px-2 py-0.5 bg-rail-100 text-rail-800 text-xs font-bold rounded">
                      {b.class_code}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">PNR:</span>
                    <span className="font-mono font-bold text-sm text-rail-700 tracking-wider">
                      {b.pnr_number}
                    </span>
                    <span
                      className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Journey & Station Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Departure</span>
                    <div className="text-base font-bold text-slate-900">{b.departure_time}</div>
                    <div className="text-xs text-slate-700 font-semibold">{b.from_station_name}</div>
                    <div className="text-[11px] text-slate-400">{b.from_station_code}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-slate-500 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(b.journey_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="w-24 border-t border-slate-300 my-1 relative">
                      <ArrowRight className="w-3.5 h-3.5 text-rail-600 absolute right-1/2 -top-1.5 translate-x-1/2" />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {b.passengers.length} {b.passengers.length === 1 ? 'Passenger' : 'Passengers'}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Arrival</span>
                    <div className="text-base font-bold text-slate-900">{b.arrival_time}</div>
                    <div className="text-xs text-slate-700 font-semibold">{b.to_station_name}</div>
                    <div className="text-[11px] text-slate-400">{b.to_station_code}</div>
                  </div>
                </div>

                {/* Passengers Pill Row */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Seat & Berth Allocation
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.passengers.map((p) => (
                      <div
                        key={p.id}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center space-x-2"
                      >
                        <span className="font-bold text-slate-800">{p.passenger_name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono font-semibold text-rail-700">
                          {p.coach_number ? `${p.coach_number}-${p.seat_number}` : p.current_status}
                        </span>
                        {p.berth_type && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                            {p.berth_type}
                          </span>
                        )}
                        {p.current_status === 'CANCELLED' && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-bold">
                            CANCELLED
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-3">
                  <div className="text-xs text-slate-500">
                    Total Fare: <span className="font-bold text-slate-900 text-sm">₹{b.total_fare}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">Ref: {b.booking_reference}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/ticket/${b.pnr_number}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>VIEW TICKET</span>
                    </Link>
                    <Link
                      to={`/ticket/${b.pnr_number}?print=true`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PRINT</span>
                    </Link>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(b)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>CANCEL TICKET</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Cancel Ticket & Refund</h3>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {cancelResult ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-base">Ticket Successfully Cancelled</div>
                  <p className="text-xs text-emerald-700">
                    Refund of <span className="text-base font-black">₹{cancelResult.refund_amount}</span> has been processed to your original payment method.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cancellation Reference:</span>
                    <span className="font-mono font-bold text-slate-800">{cancelResult.cancellation_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Refund Reference:</span>
                    <span className="font-mono font-bold text-slate-800">{cancelResult.refund_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cancellation Fee:</span>
                    <span className="font-bold text-rose-600">₹{cancelResult.cancellation_fee}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Select the passenger(s) you wish to cancel on Booking{' '}
                  <span className="font-bold font-mono text-slate-900">{cancellingBooking.booking_reference}</span>:
                </p>

                <div className="space-y-2">
                  {cancellingBooking.passengers
                    .filter((p) => p.current_status !== 'CANCELLED')
                    .map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPaxIds.includes(p.id)}
                          onChange={() => togglePaxSelection(p.id)}
                          className="w-4 h-4 text-rail-600 rounded"
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-slate-900 block">{p.passenger_name}</span>
                          <span className="text-slate-500">
                            Coach {p.coach_number || '--'}, Seat {p.seat_number || '--'} ({p.berth_type || 'Berth'})
                          </span>
                        </div>
                      </label>
                    ))}
                </div>

                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-[11px] border border-amber-200">
                  Standard railway deduction fee applies per passenger based on class ({cancellingBooking.class_code}). Refund will be credited automatically.
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCancellingBooking(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    disabled={cancelLoading || selectedPaxIds.length === 0}
                    onClick={handleConfirmCancel}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    {cancelLoading ? 'Cancelling...' : `Confirm Cancel (${selectedPaxIds.length} Pax)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
