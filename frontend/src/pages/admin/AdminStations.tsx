import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import api from '../../services/api';
import { Station } from '../../types';

export const AdminStations: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  // New Station Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zone, setZone] = useState('CR');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
  }, [search]);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stations', {
        params: { search: search || undefined, limit: 100 },
      });
      setStations(res.data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/admin/stations', {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        city: city.trim(),
        state: state.trim(),
        zone: zone.trim().toUpperCase(),
      });
      setShowAddModal(false);
      setCode('');
      setName('');
      setCity('');
      setState('');
      fetchStations();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create station.');
    }
  };

  const handleUpdateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation) return;
    try {
      await api.put(`/admin/stations/${editingStation.id}`, {
        name: editingStation.name,
        city: editingStation.city,
        state: editingStation.state,
        zone: editingStation.zone,
      });
      setEditingStation(null);
      fetchStations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update station.');
    }
  };

  const handleDeleteStation = async (id: number, stCode: string) => {
    if (!window.confirm(`Are you sure you want to delete station ${stCode}?`)) return;
    try {
      await api.delete(`/admin/stations/${id}`);
      fetchStations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete station.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Station Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage railway terminals, junction codes, and metropolitan zones</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Station</span>
        </button>
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
          placeholder="Filter stations by code, name, city or state..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Code</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Station Name</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">City / Terminal</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">State</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Railway Zone</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {stations.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-rail-700">{s.code}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.city}</td>
                <td className="px-4 py-3 text-slate-600">{s.state}</td>
                <td className="px-4 py-3 font-mono font-semibold text-slate-500">{s.zone || 'CR'}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => setEditingStation(s)}
                    className="p-1 text-slate-500 hover:text-slate-900"
                    title="Edit Station"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStation(s.id, s.code)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    title="Delete Station"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">Add Railway Station</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Station Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PNBE"
                    className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Zone</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value.toUpperCase())}
                    placeholder="e.g. NR, WR, CR"
                    className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Station Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Patna Junction"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Patna"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Bihar"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 font-bold rounded-lg"
                >
                  Add Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Station Modal */}
      {editingStation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">Edit Station {editingStation.code}</h3>
              <button onClick={() => setEditingStation(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Station Name</label>
                <input
                  type="text"
                  value={editingStation.name}
                  onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={editingStation.city}
                    onChange={(e) => setEditingStation({ ...editingStation, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={editingStation.state}
                    onChange={(e) => setEditingStation({ ...editingStation, state: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingStation(null)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
