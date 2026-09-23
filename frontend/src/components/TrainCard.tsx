import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Calendar, Check, AlertTriangle, Info } from 'lucide-react';
import { TrainSearchResult, TrainClass } from '../types';
import { TrainRouteModal } from './TrainRouteModal';

interface TrainCardProps {
  train: TrainSearchResult;
  journeyDate: string;
  passengersCount: number;
}

export const TrainCard: React.FC<TrainCardProps> = ({
  train,
  journeyDate,
  passengersCount,
}) => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<TrainClass | null>(
    train.classes.length > 0 ? train.classes[0] : null
  );
  const [showRouteModal, setShowRouteModal] = useState(false);

  const daysList = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handleBookNow = () => {
    if (!selectedClass) return;
    navigate(
      `/book?train_id=${train.id}&class=${selectedClass.class_code}&date=${journeyDate}&from=${train.from_station_code}&to=${train.to_station_code}&passengers=${passengersCount}`
    );
  };

  const getStatusColor = (status: string) => {
    if (status.includes('AVAILABLE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (status.includes('RAC')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-1 bg-rail-600 text-white font-mono font-bold text-xs rounded-md shadow-sm">
            {train.number}
          </span>
          <h3 className="font-bold text-base sm:text-lg text-slate-900">{train.name}</h3>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">
            {train.train_type}
          </span>
        </div>

        {/* Running Days */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Runs:</span>
          {daysList.map((day) => {
            const runs = train.running_days.includes(day) || train.running_days.includes('DAILY');
            return (
              <span
                key={day}
                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                  runs
                    ? 'bg-rail-100 text-rail-800'
                    : 'bg-slate-100 text-slate-300'
                }`}
                title={day}
              >
                {day[0]}
              </span>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Timings & Stations Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Departure */}
          <div>
            <div className="text-2xl font-black text-slate-900">{train.departure_time}</div>
            <div className="font-bold text-sm text-slate-800">{train.from_station_name}</div>
            <div className="text-xs text-slate-400 font-semibold">{train.from_station_code}</div>
          </div>

          {/* Duration Indicator */}
          <div className="flex flex-col items-center justify-center px-4">
            <span className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {train.duration}
            </span>
            <div className="w-32 sm:w-44 flex items-center">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <div className="flex-1 border-t-2 border-dashed border-slate-300 relative">
                <ArrowRight className="w-4 h-4 text-rail-600 absolute right-1/2 -top-2 translate-x-1/2" />
              </div>
              <div className="w-2 h-2 rounded-full bg-rail-600"></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Direct Journey</span>
          </div>

          {/* Arrival */}
          <div className="text-left sm:text-right">
            <div className="text-2xl font-black text-slate-900">{train.arrival_time}</div>
            <div className="font-bold text-sm text-slate-800">{train.to_station_name}</div>
            <div className="text-xs text-slate-400 font-semibold">{train.to_station_code}</div>
          </div>
        </div>

        {/* Classes & Availability Horizontal Strip */}
        <div className="border-t border-slate-100 pt-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Travel Class & Availability
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {train.classes.map((cls) => {
              const isSelected = selectedClass?.class_code === cls.class_code;
              return (
                <button
                  type="button"
                  key={cls.class_code}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-rail-600 ring-2 ring-rail-500/20 bg-rail-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-800">{cls.class_code}</span>
                    <span className="text-xs font-bold text-slate-900">₹{cls.total_fare}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mb-1">{cls.class_name}</div>
                  <div
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(
                      cls.status_label
                    )}`}
                  >
                    {cls.status_label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="border-t border-slate-100 mt-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Starting from:</span>
            <span className="text-lg font-black text-slate-900">₹{train.min_fare}</span>
            <span className="text-xs text-slate-400">per passenger</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowRouteModal(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              VIEW DETAILS
            </button>
            <button
              type="button"
              onClick={handleBookNow}
              className="px-6 py-2 text-xs font-bold text-white bg-rail-600 hover:bg-rail-700 rounded-xl shadow-sm hover:shadow transition-all"
            >
              BOOK NOW
            </button>
          </div>
        </div>
      </div>

      {showRouteModal && (
        <TrainRouteModal
          trainId={train.id}
          trainNumber={train.number}
          trainName={train.name}
          onClose={() => setShowRouteModal(false)}
        />
      )}
    </div>
  );
};
