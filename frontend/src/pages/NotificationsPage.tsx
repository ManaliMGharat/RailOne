import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { Notification } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = () => {
    setLoading(true);
    apiClient<Notification[]>('/notifications')
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load notifications');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleMarkRead = (id: number) => {
    apiClient(`/notifications/${id}/read`, { method: 'POST' }).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    });
  };

  const handleMarkAllRead = () => {
    apiClient('/notifications/read-all', { method: 'POST' }).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Official Railway Alerts
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            Notifications
          </h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading notifications...</p>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No Notifications</h3>
          <p className="text-xs text-slate-400">You are all caught up!</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                n.read
                  ? 'bg-white border-slate-100 text-slate-600'
                  : 'bg-blue-50/60 border-blue-200 text-[#1B254B] shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.type === 'alert'
                        ? 'bg-amber-100 text-amber-700'
                        : n.type === 'refund'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{n.title}</h4>
                    <p className="text-xs mt-1 text-slate-500 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(n.created_at).toLocaleDateString()} at{' '}
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
