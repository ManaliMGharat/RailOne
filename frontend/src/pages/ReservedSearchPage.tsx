import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Train as TrainIcon,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  QrCode,
  X,
} from 'lucide-react';
import { Station, Train, Booking } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StationAutocomplete, StationSwapButton } from '../components/StationAutocomplete';

export const ReservedSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fromCode, setFromCode] = useState<string>(searchParams.get('from') || 'MMCT');
  const [toCode, setToCode] = useState<string>(searchParams.get('to') || 'PUNE');
  const [journeyDate, setJourneyDate] = useState<string>(
    searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [classType, setClassType] = useState<string>(searchParams.get('class') || 'ALL');

  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);

  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Booking Modal State
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('CC');
  const [passengers, setPassengers] = useState<
    Array<{ name: string; age: number; gender: string; berth_preference: string }>
  >([{ name: user ? user.full_name : 'Manali Manish Gharat', age: 29, gender: 'Female', berth_preference: 'Window' }]);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Load Station records for from and to
  useEffect(() => {
    if (fromCode) {
      apiClient<Station>(`/stations/${fromCode}`).then(setFromStation).catch(() => {});
    }
    if (toCode) {
      apiClient<Station>(`/stations/${toCode}`).then(setToStation).catch(() => {});
    }
  }, [fromCode, toCode]);

  // Execute Search
  const executeSearch = (src: string, dst: string, dt: string, cls: string) => {
    if (src === dst) {
      setError('Origin and destination stations cannot be the same.');
      setTrains([]);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      from: src,
      to: dst,
      date: dt,
      class_type: cls,
    });

    apiClient<Train[]>(`/trains/search?${params.toString()}`)
      .then((data) => {
        setTrains(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to search trains');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (fromCode && toCode) {
      executeSearch(fromCode, toCode, journeyDate, classType);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromStation || !toStation) {
      setError('Please select both origin and destination stations.');
      return;
    }
    setFromCode(fromStation.station_code);
    setToCode(toStation.station_code);
    executeSearch(fromStation.station_code, toStation.station_code, journeyDate, classType);
  };

  const handleSwap = () => {
    const tempStation = fromStation;
    setFromStation(toStation);
    setToStation(tempStation);
    if (toStation) setFromCode(toStation.station_code);
    if (tempStation) setToCode(tempStation.station_code);
    setError(null);
  };

  // Booking handlers
  const handleOpenBooking = (train: Train, cCode: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedTrain(train);
    setSelectedClass(cCode);
    setBookingSuccess(null);
    setBookingError(null);
  };

  const handleAddPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers([
      ...passengers,
      { name: '', age: 30, gender: 'Male', berth_preference: 'No Preference' },
    ]);
  };

  const handleRemovePassenger = (idx: number) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== idx));
  };

  const handleConfirmBooking = async () => {
    if (!selectedTrain) return;

    // Validate passengers
    for (const p of passengers) {
      if (!p.name.trim()) {
        setBookingError('Please enter passenger full name.');
        return;
      }
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const result = await apiClient<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          train_id: selectedTrain.id,
          train_number: selectedTrain.train_number,
          train_name: selectedTrain.train_name,
          source_code: fromStation?.station_code || fromCode,
          source_name: fromStation?.station_name || fromCode,
          dest_code: toStation?.station_code || toCode,
          dest_name: toStation?.station_name || toCode,
          journey_date: journeyDate,
          class_type: selectedClass,
          passengers: passengers,
          payment_method: 'Wallet',
        }),
      });
      setBookingSuccess(result);
    } catch (err: any) {
      setBookingError(err.message || 'Booking transaction failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Search Header Banner */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <h1 className="text-xl font-extrabold text-[#1B254B] mb-4 flex items-center gap-2">
          <TrainIcon className="w-5 h-5 text-blue-600" />
          Reserved Train Search
        </h1>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <StationAutocomplete
              label="From"
              station={fromStation}
              onSelect={(s) => {
                setFromStation(s);
                setFromCode(s.station_code);
              }}
              excludeCode={toStation?.station_code}
              placeholder="Origin Station"
            />

            <StationSwapButton onSwap={handleSwap} />

            <StationAutocomplete
              label="To"
              station={toStation}
              onSelect={(s) => {
                setToStation(s);
                setToCode(s.station_code);
              }}
              excludeCode={fromStation?.station_code}
              placeholder="Destination Station"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Journey Date
              </label>
              <input
                type="date"
                value={journeyDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1B254B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Class
              </label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#1B254B]"
              >
                <option value="ALL">All Classes (ALL)</option>
                <option value="1A">AC First Class (1A)</option>
                <option value="2A">AC 2 Tier (2A)</option>
                <option value="3A">AC 3 Tier (3A)</option>
                <option value="3E">AC 3 Economy (3E)</option>
                <option value="CC">AC Chair Car (CC)</option>
                <option value="EC">Executive Chair Car (EC)</option>
                <option value="SL">Sleeper Class (SL)</option>
                <option value="2S">Second Sitting (2S)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Search className="w-4 h-4" />
                Modify Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Validation or API Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-slate-600 text-sm">Searching available trains...</p>
        </div>
      )}

      {/* Results List */}
      {!loading && !error && trains.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{trains.length} trains found for this route</span>
            <span>Running on schedule</span>
          </div>

          {trains.map((train) => {
            const classesList = train.classes.split(',').map((c) => c.trim());
            return (
              <div
                key={train.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-blue-200 transition space-y-4"
              >
                {/* Train Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                        #{train.train_number}
                      </span>
                      <h3 className="font-bold text-base text-[#1B254B]">{train.train_name}</h3>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Runs On: <span className="text-slate-600 font-medium">{train.running_days}</span> • Type: <span className="font-medium text-slate-600">{train.train_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <div>
                      <div className="text-base font-extrabold text-[#1B254B]">{train.departure_time}</div>
                      <div className="text-slate-400">{train.source}</div>
                    </div>
                    <div className="text-center px-2">
                      <div className="text-[10px] text-slate-400 font-medium">{train.duration}</div>
                      <div className="w-16 h-0.5 bg-slate-200 relative my-1">
                        <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-[#1B254B]">{train.arrival_time}</div>
                      <div className="text-slate-400">{train.destination}</div>
                    </div>
                  </div>
                </div>

                {/* Classes & Seat Availability Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {classesList.map((cCode) => {
                    const detail = train.classes_detail.find((cd) => cd.class_code === cCode);
                    const fare = detail ? detail.base_fare : 350.0;
                    const seats = detail ? detail.available_seats : 42;
                    return (
                      <div
                        key={cCode}
                        onClick={() => handleOpenBooking(train, cCode)}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition flex flex-col justify-between active:scale-97"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-[#1B254B]">{cCode}</span>
                          <span className="text-xs font-bold text-blue-700">₹{fare}</span>
                        </div>
                        <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span>AVAILABLE {seats}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty Results State */}
      {!loading && !error && trains.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
          <TrainIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No Trains Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No direct trains match this combination. Try searching between major hubs like MMCT, CSMT, PUNE, or NEU.
          </p>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedTrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Book Reservation</h3>
                <p className="text-xs text-blue-100">
                  {selectedTrain.train_name} (#{selectedTrain.train_number}) • {selectedClass} Class
                </p>
              </div>
              <button
                onClick={() => setSelectedTrain(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {bookingSuccess ? (
                /* Booking Success Card */
                <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-[#1B254B]">Booking Confirmed!</h4>
                    <p className="text-xs text-slate-400 mt-1">PNR Number: <span className="font-bold text-blue-600 text-sm">{bookingSuccess.pnr_number}</span></p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Booking ID:</span>
                      <span className="font-semibold text-slate-800">{bookingSuccess.booking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Route:</span>
                      <span className="font-semibold text-slate-800">{bookingSuccess.source_code} → {bookingSuccess.dest_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Fare Debited:</span>
                      <span className="font-bold text-emerald-600">₹{bookingSuccess.fare_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Coach & Berth:</span>
                      <span className="font-bold text-blue-700">
                        {bookingSuccess.tickets.map((t) => `${t.coach}-${t.berth}`).join(', ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTrain(null);
                      navigate('/bookings');
                    }}
                    className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
                  >
                    View E-Ticket & QR Code
                  </button>
                </div>
              ) : (
                /* Passenger Entry Form */
                <div className="space-y-4">
                  {bookingError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200">
                      {bookingError}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Passengers ({passengers.length}/6)
                    </span>
                    {passengers.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddPassenger}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Passenger
                      </button>
                    )}
                  </div>

                  {passengers.map((p, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Passenger #{idx + 1}</span>
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...passengers];
                            updated[idx].name = e.target.value;
                            setPassengers(updated);
                          }}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Age"
                            min="1"
                            max="120"
                            value={p.age}
                            onChange={(e) => {
                              const updated = [...passengers];
                              updated[idx].age = parseInt(e.target.value) || 25;
                              setPassengers(updated);
                            }}
                            className="w-20 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                          />
                          <select
                            value={p.gender}
                            onChange={(e) => {
                              const updated = [...passengers];
                              updated[idx].gender = e.target.value;
                              setPassengers(updated);
                            }}
                            className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <select
                        value={p.berth_preference}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[idx].berth_preference = e.target.value;
                          setPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600"
                      >
                        <option value="No Preference">No Berth Preference</option>
                        <option value="Lower">Lower Berth</option>
                        <option value="Middle">Middle Berth</option>
                        <option value="Upper">Upper Berth</option>
                        <option value="Side Lower">Side Lower</option>
                        <option value="Window">Window Seat</option>
                      </select>
                    </div>
                  ))}

                  {/* Payment via RailOne Wallet */}
                  <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">Payment: RailOne Wallet Balance</span>
                    </div>
                    <span className="font-bold text-blue-700">Instant</span>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <span>Reserving Confirmed Berths...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay & Confirm Reservation</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
