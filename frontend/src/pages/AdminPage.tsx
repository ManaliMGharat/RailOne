import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Train,
  Ticket,
  DollarSign,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { AdminStats } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'refunds' | 'tickets' | 'bookings' | 'users'>('stats');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data lists
  const [refunds, setRefunds] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Action states
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      setError('Administrator access is strictly restricted.');
      setLoading(false);
      return;
    }

    setLoading(true);
    apiClient<AdminStats>('/admin/stats')
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Access denied. Administrator privileges required.');
        setLoading(false);
      });
  }, [user]);

  // Load secondary lists when tab is clicked
  const loadTabContent = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setActionMsg(null);
    if (tab === 'refunds') {
      apiClient<any[]>('/admin/refunds').then(setRefunds).catch(() => {});
    } else if (tab === 'tickets') {
      apiClient<any[]>('/admin/support-tickets').then(setSupportTickets).catch(() => {});
    } else if (tab === 'bookings') {
      apiClient<any[]>('/admin/bookings').then(setAllBookings).catch(() => {});
    } else if (tab === 'users') {
      apiClient<any[]>('/admin/users').then(setAllUsers).catch(() => {});
    }
  };

  const handleProcessRefund = async (refundId: number, status: 'Approved' | 'Rejected') => {
    try {
      await apiClient(`/admin/refunds/${refundId}/process`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          admin_remarks: status === 'Approved' ? 'Approved by Grievance Officer' : 'Policy mismatch',
        }),
      });
      setActionMsg(`Refund #${refundId} marked as ${status}.`);
      apiClient<any[]>('/admin/refunds').then(setRefunds);
      apiClient<AdminStats>('/admin/stats').then(setStats);
    } catch (err: any) {
      alert(err.message || 'Process failed');
    }
  };

  const handleReplyTicket = async (ticketId: number) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;

    try {
      await apiClient(`/admin/support-tickets/${ticketId}/reply`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Resolved',
          admin_response: text.trim(),
        }),
      });
      setActionMsg(`Replied and resolved Ticket #${ticketId}.`);
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
      apiClient<any[]>('/admin/support-tickets').then(setSupportTickets);
    } catch (err: any) {
      alert(err.message || 'Reply failed');
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-3 border border-red-200">
        <Shield className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-red-700">Access Restricted</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
              Railway Administrator Console
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">
              Verified Role-Based Access Enforced
            </span>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-slate-200/60 rounded-2xl overflow-x-auto text-xs font-bold">
        {[
          { id: 'stats', label: 'Overview' },
          { id: 'refunds', label: 'Refund Claims' },
          { id: 'tickets', label: 'Support Grievances' },
          { id: 'bookings', label: 'Live Bookings' },
          { id: 'users', label: 'Registered Users' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => loadTabContent(tab.id as any)}
            className={`py-2 px-4 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* STATS OVERVIEW */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Stations</span>
              <div className="text-2xl font-black text-[#1B254B] mt-1">{stats.total_stations}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">152+ Seed Standard</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Trains</span>
              <div className="text-2xl font-black text-[#1B254B] mt-1">{stats.total_trains}</div>
              <span className="text-[10px] text-blue-600 font-semibold">Suburban & Express</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Bookings</span>
              <div className="text-2xl font-black text-[#1B254B] mt-1">{stats.total_bookings}</div>
              <span className="text-[10px] text-slate-400 font-semibold">Processed</span>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Revenue</span>
              <div className="text-2xl font-black text-purple-700 mt-1">₹{stats.total_revenue.toFixed(2)}</div>
              <span className="text-[10px] text-purple-600 font-semibold">Wallet & Digital</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-amber-800">Pending Refund Claims</span>
              <div className="text-xl font-black text-amber-900 mt-1">{stats.pending_refunds}</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <span className="text-xs font-bold text-blue-800">Open Grievance Tickets</span>
              <div className="text-xl font-black text-blue-900 mt-1">{stats.open_support_tickets}</div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800">Food Catering Orders</span>
              <div className="text-xl font-black text-emerald-900 mt-1">{stats.total_food_orders}</div>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MANAGEMENT TAB */}
      {activeTab === 'refunds' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
            Review Refund Claims ({refunds.length})
          </h2>

          <div className="space-y-3">
            {refunds.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-purple-700">{r.refund_id}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
                    {r.status}
                  </span>
                </div>
                <div>Claim Amount: <span className="font-bold text-blue-700">₹{r.amount.toFixed(2)}</span></div>
                <div>Reason: <span className="text-slate-600">{r.reason}</span></div>

                {r.status === 'Pending' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleProcessRefund(r.id, 'Approved')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                    >
                      Approve & Credit Wallet
                    </button>
                    <button
                      onClick={() => handleProcessRefund(r.id, 'Rejected')}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold transition"
                    >
                      Reject Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPPORT GRIEVANCES TAB */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
            Passenger Grievances ({supportTickets.length})
          </h2>

          <div className="space-y-4">
            {supportTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-700">{t.ticket_id}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800">
                    {t.status}
                  </span>
                </div>
                <div className="font-bold text-slate-800">{t.subject}</div>
                <p className="text-slate-600">{t.message}</p>

                {t.admin_response ? (
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-900 border border-emerald-200">
                    <span className="font-bold">Official Response:</span> {t.admin_response}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="Type official officer reply..."
                      value={replyText[t.id] || ''}
                      onChange={(e) =>
                        setReplyText({ ...replyText, [t.id]: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                    />
                    <button
                      onClick={() => handleReplyTicket(t.id)}
                      className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold hover:bg-purple-800 transition"
                    >
                      Reply & Resolve Ticket
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
            All Passenger Bookings ({allBookings.length})
          </h2>
          <div className="space-y-2">
            {allBookings.map((b) => (
              <div key={b.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-blue-700 font-mono">{b.pnr_number}</span>
                  <span className="ml-2 font-semibold text-slate-800">{b.source} → {b.destination}</span>
                  <span className="text-slate-400 block">{b.journey_date} • {b.class_type}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">₹{b.fare_amount.toFixed(2)}</span>
                  <div className="text-[10px] text-emerald-600 font-bold">{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
            Registered Users ({allUsers.length})
          </h2>
          <div className="space-y-2">
            {allUsers.map((u) => (
              <div key={u.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800">{u.full_name}</span>
                  <span className="text-slate-400 block">{u.email} • {u.phone}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  {u.role.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
