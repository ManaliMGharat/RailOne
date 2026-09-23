import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Navigation, Info } from 'lucide-react';
import api from '../services/api';
import { TrainStop } from '../types';

interface TrainRouteModalProps {
  trainId: number;
  trainNumber: string;
  trainName: string;
  onClose: () => void;
}

export const TrainRouteModal: React.FC<TrainRouteModalProps> = ({
  trainId,
  trainNumber,
  trainName,
  onClose,
}) => {
  const [stops, setStops] = useState<TrainStop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await api.get(`/trains/${trainId}/route`);
        setStops(res.data);
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [trainId]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-rail-100 text-rail-800 text-xs font-bold rounded">
                #{trainNumber}
              </span>
              <h3 className="font-bold text-lg text-slate-900">{trainName}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Route Timeline & Schedule Information</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
              Loading train schedule and route stops...
            </div>
          ) : stops.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Schedule details unavailable for this route.
            </div>
          ) : (
            <div className="relative border-l-2 border-rail-200 ml-4 pl-6 space-y-6">
              {stops.map((stop, index) => {
                const isOrigin = index === 0;
                const isDest = index === stops.length - 1;

                return (
                  <div key={stop.stop_number} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isOrigin
                          ? 'bg-rail-600 border-white ring-4 ring-rail-100'
                          : isDest
                          ? 'bg-rose-600 border-white ring-4 ring-rose-100'
                          : 'bg-white border-rail-500 group-hover:bg-rail-500'
                      }`}
                    />

                    {/* Stop Details */}
                    <div className="bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-100 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-900">{stop.station_name}</span>
                            <span className="text-xs font-semibold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                              {stop.station_code}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">{stop.city} • Day {stop.day_count}</div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs font-medium text-slate-700 mt-2 sm:mt-0">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Arr</span>
                            <span className="font-semibold">{stop.arrival_time}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Dep</span>
                            <span className="font-semibold">{stop.departure_time}</span>
                          </div>
                          <div className="bg-white px-2 py-1 rounded border border-slate-200 text-center">
                            <span className="text-slate-400 block text-[10px]">Halt</span>
                            <span className="font-semibold text-rail-700">{stop.halt_minutes}m</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px]">Distance</span>
                            <span className="text-slate-600">{stop.distance_from_origin_km} km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
