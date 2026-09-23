import React, { useState, useEffect } from 'react';
import { 
  Users, Train, MapPin, Ticket, CreditCard, RotateCcw, 
  TrendingUp, BarChart3, AlertCircle, RefreshCw 
} from 'lucide-react';
import api from '../../services/api';
import { DashboardStats } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading operational analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs">
        {error}
      </div>
    );
  }

  const kpis = [
    { title: 'Total Registered Users', value: stats.total_users, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { title: 'Active Trains', value: stats.total_trains, icon: Train, color: 'text-rail-600 bg-rail-50' },
    { title: 'Mapped Stations', value: stats.total_stations, icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
    { title: "Today's Bookings", value: stats.today_bookings, icon: Ticket, color: 'text-purple-600 bg-purple-50' },
    { title: "Today's Revenue", value: `₹${stats.today_revenue.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
    { title: 'Cancelled Tickets', value: stats.cancelled_tickets, icon: RotateCcw, color: 'text-rose-600 bg-rose-50' },
  ];

  // Maximum value for bar scaling
  const maxBooking = Math.max(...stats.bookings_by_date.map((b) => b.count), 1);
  const maxRevenue = Math.max(...stats.revenue_by_date.map((r) => r.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operational Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time metrics, reservations trend, and passenger revenue</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 self-start sm:self-center shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {kpi.title}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-rail-600" />
              Bookings Trend (Last 7 Days)
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Total reservations</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4">
            {stats.bookings_by_date.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.count / maxBooking) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-rail-600 to-rail-400 hover:from-rail-700 hover:to-rail-500 rounded-t-lg transition-all shadow-sm"
                  />
                  <span className="text-[10px] font-semibold text-slate-400 mt-2 truncate max-w-full">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-amber-500" />
              Daily Revenue (₹ INR)
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Gross fare sales</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4">
            {stats.revenue_by_date.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  <span className="text-[10px] font-bold text-amber-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
                    ₹{item.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-amber-500 to-amber-300 hover:from-amber-600 hover:to-amber-400 rounded-t-lg transition-all shadow-sm"
                  />
                  <span className="text-[10px] font-semibold text-slate-400 mt-2 truncate max-w-full">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Routes & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Routes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Top Booked Corridors
          </h3>
          <div className="space-y-2.5">
            {stats.popular_routes.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                <span className="font-bold text-slate-800">{r.route}</span>
                <span className="px-2 py-0.5 bg-rail-100 text-rail-800 font-bold rounded">
                  {r.bookings} bookings
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Class Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Travel Class Distribution
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {stats.class_utilization.map((c, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <span className="font-black text-lg text-slate-900">{c.class_name}</span>
                <span className="block text-xs font-semibold text-slate-500">{c.count} seats</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
