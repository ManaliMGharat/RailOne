import React, { useState, useEffect } from 'react';
import { 
  Train as TrainIcon, Plus, Edit2, Trash2, Search, 
  CheckCircle2, AlertCircle, X, Clock 
} from 'lucide-react';
import api from '../../services/api';
import { Station } from '../../types';

export const AdminTrains: React.FC = () => {
  const [trains, setTrains] = useState<any[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrain, setEditingTrain] = useState<any | null>(null);

  // Add Train Form State
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [sourceId, setSourceId] = useState<number>(0);
  const [destId, setDestId] = useState<number>(0);
  const [departure, setDeparture] = useState('06:00');
  const [arrival, setArrival] = useState('14:30');
  const [duration, setDuration] = useState('08h 30m');
  const [runningDays, setRunningDays] = useState('MON,TUE,WED,THU,FRI,SAT,SUN');
  const [trainType, setTrainType] = useState('Superfast Express');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        api.get('/stations?limit=50'),
        api.get('/stations?limit=50'),
      ]);
      setStations(sRes.data);
      if (sRes.data.length >= 2) {
        setSourceId(sRes.data[0].id);
        setDestId(sRes.data[1].id);
      }
      // Fetch trains via search endpoint or custom admin
      const searchRes = await api.get('/trains/search', {
        params: {
          from_station: 'CSMT',
          to_station: 'NDLS',
          journey_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        },
      });
      // Also get full list from station lookup or dummy
      setTrains(searchRes.data);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/admin/trains', {
        number,
        name,
        source_station_id: sourceId,
        destination_station_id: destId,
        departure_time: departure,
        arrival_time: arrival,
        duration,
        running_days: runningDays,
        train_type: trainType,
        is_active: true,
      });
      setShowAddModal(false);
      // Reset form
      setNumber('');
      setName('');
      fetchInitialData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create train.');
    }
  };

  const handleUpdateTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrain) return;
    try {
      await api.put(`/admin/trains/${editingTrain.id}`, {
        name: editingTrain.name,
        departure_time: editingTrain.departure_time,
        arrival_time: editingTrain.arrival_time,
        duration: editingTrain.duration,
        running_days: editingTrain.running_days,
        train_type: editingTrain.train_type,
      });
      setEditingTrain(null);
      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update train.');
    }
  };

  const handleDeleteTrain = async (id: number, trainNum: string) => {
    if (!window.confirm(`Are you sure you want to delete train #${trainNum}?`)) return;
    try {
      await api.delete(`/admin/trains/${id}`);
      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete train.');
    }
  };

  const filtered = trains.filter(
    (t) =>
      t.number.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Train Fleet Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure train timetables, running days, and train route stops</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Train</span>
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
          placeholder="Search by train number or name..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Trains Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Train #</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Train Name</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Route</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Timing</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Duration</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">Type</th>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-900">#{t.number}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{t.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {t.from_station_code} → {t.to_station_code}
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono">
                  {t.departure_time} - {t.arrival_time}
                </td>
                <td className="px-4 py-3 text-slate-600">{t.duration}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                    {t.train_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => setEditingTrain(t)}
                    className="p-1 text-slate-500 hover:text-slate-900"
                    title="Edit Train"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrain(t.id, t.number)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    title="Delete Train"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Train Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Train to Fleet</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTrain} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Train Number</label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="e.g. 12953"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Train Type</label>
                  <select
                    value={trainType}
                    onChange={(e) => setTrainType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Superfast Express">Superfast Express</option>
                    <option value="Rajdhani Express">Rajdhani Express</option>
                    <option value="Vande Bharat">Vande Bharat</option>
                    <option value="Shatabdi Express">Shatabdi Express</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Train Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. August Kranti Rajdhani"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Source Station</label>
                  <select
                    value={sourceId}
                    onChange={(e) => setSourceId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Destination Station</label>
                  <select
                    value={destId}
                    onChange={(e) => setDestId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Departure</label>
                  <input
                    type="text"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Arrival</label>
                  <input
                    type="text"
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  Create Train
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Train Modal */}
      {editingTrain && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">Edit Train #{editingTrain.number}</h3>
              <button onClick={() => setEditingTrain(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrain} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Train Name</label>
                <input
                  type="text"
                  value={editingTrain.name}
                  onChange={(e) => setEditingTrain({ ...editingTrain, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Departure</label>
                  <input
                    type="text"
                    value={editingTrain.departure_time}
                    onChange={(e) => setEditingTrain({ ...editingTrain, departure_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Arrival</label>
                  <input
                    type="text"
                    value={editingTrain.arrival_time}
                    onChange={(e) => setEditingTrain({ ...editingTrain, arrival_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingTrain.duration}
                    onChange={(e) => setEditingTrain({ ...editingTrain, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTrain(null)}
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
