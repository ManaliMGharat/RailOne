import React, { useState } from 'react';
import { MapPin, ArrowRightLeft } from 'lucide-react';
import { Station } from '../types';
import { StationSearchModal } from './StationSearchModal';

interface StationAutocompleteProps {
  label: string;
  station: Station | null;
  onSelect: (station: Station) => void;
  excludeCode?: string;
  placeholder?: string;
}

export const StationAutocomplete: React.FC<StationAutocompleteProps> = ({
  label,
  station,
  onSelect,
  excludeCode,
  placeholder = 'Select station',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex-1">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full text-left p-3 sm:p-3.5 bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/90 rounded-2xl flex items-center justify-between transition-all group active:scale-98 shadow-2xs"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {station ? station.station_code : <MapPin className="w-4 h-4" />}
            </div>
            <div className="truncate">
              {station ? (
                <>
                  <div className="font-bold text-sm text-[#1B254B] truncate leading-tight">
                    {station.station_name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {station.city} • {station.railway_zone}
                  </div>
                </>
              ) : (
                <span className="text-slate-400 text-sm font-medium">{placeholder}</span>
              )}
            </div>
          </div>
        </button>
      </div>

      <StationSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={onSelect}
        title={`Select ${label} Station`}
        excludeCode={excludeCode}
      />
    </>
  );
};

export const StationSwapButton: React.FC<{ onSwap: () => void }> = ({ onSwap }) => {
  return (
    <button
      type="button"
      onClick={onSwap}
      aria-label="Swap Origin and Destination"
      className="w-10 h-10 -my-2 sm:my-0 sm:-mx-2 rounded-full bg-white border border-slate-200 text-blue-600 shadow-md flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 active:rotate-180 transition-all duration-300 z-10 shrink-0 self-center"
    >
      <ArrowRightLeft className="w-4 h-4" />
    </button>
  );
};
