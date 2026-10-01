import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, AlertCircle, Clock, ShieldCheck, Ticket } from 'lucide-react';
import { Refund, Booking } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const RefundsPage: React.FC = () => {
  const { user } = useAuth();

  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | ''>('');
  const [reason, setReason] = useState<string>('Train cancellation / Schedule deviation');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiClient<Refund[]>('/refunds').catch(() => []),
      apiClient<Booking[]>('/bookings').catch(() => []),
    ])
      .then(([refData, bData]) => {
        setRefunds(refData);
        setBookings(bData);
        if (bData.length > 0) {
          setSelectedBookingId(bData[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load refunds');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;

    setSubmitLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient<Refund>('/refunds', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: Number(selectedBookingId),
          reason: reason.trim(),
        }),
      });
      setSuccessMsg(`Refund request ${res.refund_id} filed successfully! It will be reviewed by the grievance officer.`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to file refund request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Railway Grievance & Ticket Claims
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            File Refund & Track Claims
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
          <RotateCw className="w-5 h-5" />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Refund Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
          Submit New Refund Claim
        </h2>

        {bookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            No booking records found. You can only file a refund for an existing reservation.
          </p>
        ) : (
          <form onSubmit={handleSubmitRefund} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Booking
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(Number(e.target.value))}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#1B254B]"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.booking_id} (PNR {b.pnr_number}) • {b.train_name} • ₹{b.fare_amount.toFixed(2)} ({b.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Reason for Refund Request
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe reason (e.g. Train delayed > 3 hours, AC failure, Medical emergency)"
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#1B254B]"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3.5 rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <RotateCw className="w-4 h-4" />
              <span>{submitLoading ? 'Submitting Claim...' : 'Submit Refund Claim'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Refunds History */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
          Claim History & Status
        </h2>

        {loading && (
          <div className="py-8 text-center text-slate-400 text-xs">
            Loading refund claims...
          </div>
        )}

        {!loading && refunds.length === 0 && (
          <div className="py-6 text-center text-slate-400 text-xs">
            No refund claims filed.
          </div>
        )}

        {!loading && refunds.length > 0 && (
          <div className="space-y-3">
            {refunds.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-700">{r.refund_id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      r.status === 'Approved' || r.status === 'Processed' || r.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-slate-600">
                  <span className="font-semibold text-slate-700">Reason:</span> {r.reason}
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-400">Claim Amount: ₹{r.amount.toFixed(2)}</span>
                  <span className="text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>

                {r.admin_remarks && (
                  <div className="p-2 bg-blue-50/60 rounded-xl text-blue-900 text-[11px]">
                    <span className="font-bold">Officer Remarks:</span> {r.admin_remarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
