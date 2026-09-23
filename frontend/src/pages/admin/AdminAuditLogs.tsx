import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { AuditLogItem } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('DELETE')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('CANCEL')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological record of administrative actions, entity modifications, and cancellations
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 self-start sm:self-center shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Timestamp</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Administrator</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Action</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Entity</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Entity ID</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {log.admin_name || 'System Admin'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getBadgeColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">{log.entity}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{log.entity_id || '--'}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
