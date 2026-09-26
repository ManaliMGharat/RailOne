import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Train as TrainIcon, Clock, MapPin, ArrowLeft, ShieldCheck, Ticket } from 'lucide-react';
import { Train } from '../types';
import { apiClient } from '../api/client';

export const TrainDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient<Train>(`/trains/${id}`)
      .then((data) => {
        setTrain(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Train not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs font-semibold">Loading train timetable...</p>
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-3">
        <p className="text-red-600 text-sm font-bold">{error || 'Train not found'}</p>
        <button
          onClick={() => navigate('/trains')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Back button & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
            #{train.train_number}
          </span>
          <h1 className="text-xl font-extrabold text-[#1B254B] mt-0.5">{train.train_name}</h1>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400">Route:</span>
          <div className="font-extrabold text-base text-[#1B254B]">
            {train.source} → {train.destination}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Dep: {train.departure_time} • Arr: {train.arrival_time} • Duration: {train.duration}
          </div>
        </div>

        <button
          onClick={() => navigate(`/reserved?from=${train.source}&to=${train.destination}`)}
          className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <Ticket className="w-4 h-4" />
          <span>Book Tickets on this Train</span>
        </button>
      </div>

      {/* Stoppages Timetable */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Complete Station Stoppages & Halts ({train.routes.length} Stations)
        </h2>

        <div className="divide-y divide-slate-100">
          {train.routes.map((r) => (
            <div key={r.sequence} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                  {r.sequence}
                </span>
                <div>
                  <div className="font-extrabold text-slate-800">{r.station_name}</div>
                  <div className="text-[10px] text-slate-400">
                    Code: <strong className="text-blue-700">{r.station_code}</strong> • {r.distance} km from start
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-800">
                  Arr: {r.arrival} • Dep: {r.departure}
                </div>
                {r.halt_minutes > 0 ? (
                  <span className="text-[10px] text-slate-400">Halt: {r.halt_minutes} mins</span>
                ) : (
                  <span className="text-[10px] text-blue-600 font-medium">Origin/Terminus</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
