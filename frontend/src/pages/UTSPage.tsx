import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Train,
  Ticket,
  Calendar,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Station } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StationAutocomplete, StationSwapButton } from '../components/StationAutocomplete';

export const UTSPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialTab = searchParams.get('tab') || 'journey';
  const [activeTab, setActiveTab] = useState<'journey' | 'platform' | 'season'>(
    initialTab === 'platform' ? 'platform' : initialTab === 'season' ? 'season' : 'journey'
  );

  // Common Stations
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [platformStation, setPlatformStation] = useState<Station | null>(null);

  // Form states
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [classType, setClassType] = useState<string>('Second Class');
  const [seasonDuration, setSeasonDuration] = useState<string>('Monthly');
  const [passengerName, setPassengerName] = useState<string>(user ? user.full_name : 'Manali Manish Gharat');
  const [passengerAge, setPassengerAge] = useState<number>(29);

  // Fare calculation state
  const [fare, setFare] = useState<number>(20.0);
  const [fareLoading, setFareLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<any | null>(null);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  // Initialize default suburban stations (e.g. Nerul and Uran)
  useEffect(() => {
    apiClient<Station>('/stations/NEU')
      .then((s) => {
        setFromStation(s);
        setPlatformStation(s);
      })
      .catch(() => {});
    apiClient<Station>('/stations/UNR')
      .then(setToStation)
      .catch(() => {});
  }, []);

  // Recalculate Fare when stations/class/duration changes
  useEffect(() => {
    if (activeTab === 'platform') {
      setFare(10.0 * passengerCount);
      return;
    }

    if (!fromStation || !toStation) return;

    if (fromStation.station_code === toStation.station_code) {
      setError('Origin and destination stations cannot be the same.');
      return;
    }

    setError(null);
    setFareLoading(true);

    apiClient<any>('/trains/fare', {
      method: 'POST',
      body: JSON.stringify({
        source_code: fromStation.station_code,
        dest_code: toStation.station_code,
        journey_type: activeTab === 'season' ? 'season' : 'unreserved',
        class_type: classType,
        passenger_count: passengerCount,
        duration_type: seasonDuration,
      }),
    })
      .then((res) => {
        if (res.fare_options && res.fare_options.length > 0) {
          const opt = res.fare_options.find((o: any) =>
            classType === 'First Class' ? o.class_code.includes('FC') : o.class_code.includes('II')
          ) || res.fare_options[0];
          setFare(opt.total_fare);
        }
        setFareLoading(false);
      })
      .catch(() => {
        setFareLoading(false);
      });
  }, [fromStation, toStation, activeTab, classType, passengerCount, seasonDuration]);

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    setError(null);
  };

  const handleIssueTicket = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      if (activeTab === 'journey') {
        if (!fromStation || !toStation) throw new Error('Please select both origin and destination.');
        const res = await apiClient<any>('/uts/journey', {
          method: 'POST',
          body: JSON.stringify({
            source_code: fromStation.station_code,
            dest_code: toStation.station_code,
            journey_date: new Date().toISOString().split('T')[0],
            passenger_count: passengerCount,
            class_type: classType,
            payment_method: 'Wallet',
          }),
        });
        setIssuedTicket(res);
      } else if (activeTab === 'platform') {
        if (!platformStation) throw new Error('Please select station for platform ticket.');
        const res = await apiClient<any>('/platform', {
          method: 'POST',
          body: JSON.stringify({
            station_code: platformStation.station_code,
            passenger_count: passengerCount,
            payment_method: 'Wallet',
          }),
        });
        setIssuedTicket(res);
      } else if (activeTab === 'season') {
        if (!fromStation || !toStation) throw new Error('Please select both origin and destination.');
        const res = await apiClient<any>('/season', {
          method: 'POST',
          body: JSON.stringify({
            source_code: fromStation.station_code,
            dest_code: toStation.station_code,
            duration_type: seasonDuration,
            class_type: classType,
            passenger_name: passengerName,
            passenger_age: passengerAge,
            payment_method: 'Wallet',
          }),
        });
        setIssuedTicket(res);
      }
    } catch (err: any) {
      setError(err.message || 'Ticket issuance failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Paperless UTS Railway Network
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B] mt-0.5">
            Unreserved & Suburban Ticketing
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
          <Train className="w-5 h-5" />
        </div>
      </div>

      {/* Tabs Switcher: Journey, Platform, Season */}
      <div className="flex p-1.5 bg-slate-200/60 rounded-2xl gap-1">
        <button
          onClick={() => {
            setActiveTab('journey');
            setIssuedTicket(null);
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'journey'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Train className="w-4 h-4" />
          <span>Suburban Journey</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('platform');
            setIssuedTicket(null);
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'platform'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Platform Ticket</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('season');
            setIssuedTicket(null);
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
            activeTab === 'season'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Season Pass</span>
        </button>
      </div>

      {/* Ticket Details Form or Issued QR Ticket View */}
      {issuedTicket ? (
        /* DIGITAL QR TICKET VIEW */
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 text-center space-y-5 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#1B254B]">
              {activeTab === 'platform'
                ? 'Platform Ticket Issued'
                : activeTab === 'season'
                ? 'Digital Season Pass Active'
                : 'UTS Journey Ticket Active'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ticket #{issuedTicket.ticket_number || issuedTicket.pass_number}
            </p>
          </div>

          {/* Simulated Railway Secure QR Block */}
          <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl max-w-xs mx-auto flex flex-col items-center justify-center space-y-3">
            <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center border border-slate-200">
              <QrCode className="w-36 h-36 text-slate-800" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 break-all px-2">
              {issuedTicket.qr_data}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>IRCTC & CRIS Verified Pass</span>
            </div>
          </div>

          {/* Ticket Information Summary */}
          <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-2 border border-slate-100">
            {activeTab === 'platform' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Station:</span>
                  <span className="font-bold text-slate-800">{issuedTicket.station_name} ({issuedTicket.station_code})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validity:</span>
                  <span className="font-bold text-amber-600">{issuedTicket.valid_hours} Hours from booking</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-bold text-slate-800">
                    {issuedTicket.source || issuedTicket.source_name} → {issuedTicket.destination || issuedTicket.dest_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class:</span>
                  <span className="font-bold text-blue-700">{issuedTicket.class_type}</span>
                </div>
                {issuedTicket.valid_until && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valid Until:</span>
                    <span className="font-bold text-emerald-700">{issuedTicket.valid_until}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
              <span className="text-slate-600">Fare Debited:</span>
              <span className="text-emerald-600">₹{issuedTicket.fare.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setIssuedTicket(null)}
            className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            Book Another Ticket
          </button>
        </div>
      ) : (
        /* BOOKING FORM */
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'platform' ? (
            /* PLATFORM TICKET FORM */
            <div className="space-y-4">
              <StationAutocomplete
                label="Railway Station"
                station={platformStation}
                onSelect={setPlatformStation}
                placeholder="Select Station (e.g. MMCT, CSMT, TNA, NEU)"
              />

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Number of Passengers
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPassengerCount(count)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
                        passengerCount === count
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {count} {count === 1 ? 'Person' : 'Persons'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Valid for exactly 2 hours on all platforms of the selected station.</span>
              </div>
            </div>
          ) : (
            /* JOURNEY & SEASON PASS FORM */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <StationAutocomplete
                  label="From Station"
                  station={fromStation}
                  onSelect={setFromStation}
                  excludeCode={toStation?.station_code}
                  placeholder="Origin Suburban Station"
                />

                <StationSwapButton onSwap={handleSwap} />

                <StationAutocomplete
                  label="To Station"
                  station={toStation}
                  onSelect={setToStation}
                  excludeCode={fromStation?.station_code}
                  placeholder="Destination Suburban Station"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Coach Class
                  </label>
                  <select
                    value={classType}
                    onChange={(e) => setClassType(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#1B254B]"
                  >
                    <option value="Second Class">Second Class (Ordinary / II)</option>
                    <option value="First Class">First Class (Suburban / FC)</option>
                  </select>
                </div>

                {activeTab === 'season' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Pass Duration
                    </label>
                    <select
                      value={seasonDuration}
                      onChange={(e) => setSeasonDuration(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#1B254B]"
                    >
                      <option value="Monthly">Monthly Pass (30 Days)</option>
                      <option value="Quarterly">Quarterly Pass (90 Days)</option>
                      <option value="Half-Yearly">Half-Yearly Pass (180 Days)</option>
                      <option value="Yearly">Yearly Pass (365 Days)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Passengers
                    </label>
                    <select
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#1B254B]"
                    >
                      <option value={1}>1 Passenger</option>
                      <option value={2}>2 Passengers</option>
                      <option value={3}>3 Passengers</option>
                      <option value={4}>4 Passengers</option>
                    </select>
                  </div>
                )}
              </div>

              {activeTab === 'season' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Passholder Full Name
                    </label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Passholder Age
                    </label>
                    <input
                      type="number"
                      value={passengerAge}
                      onChange={(e) => setPassengerAge(parseInt(e.target.value) || 25)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fare Summary & Instant Wallet Payment */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Applicable Fare
              </span>
              <div className="text-2xl font-black text-blue-700">
                {fareLoading ? 'Calculating...' : `₹${fare.toFixed(2)}`}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Wallet Payment
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Instant digital QR issue</p>
            </div>
          </div>

          <button
            onClick={handleIssueTicket}
            disabled={bookingLoading || fareLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition flex items-center justify-center gap-2"
          >
            {bookingLoading ? (
              <span>Generating Secure QR Ticket...</span>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                <span>
                  {activeTab === 'platform'
                    ? `Pay ₹${fare.toFixed(2)} & Get Platform Ticket`
                    : activeTab === 'season'
                    ? `Pay ₹${fare.toFixed(2)} & Activate Season Pass`
                    : `Pay ₹${fare.toFixed(2)} & Book UTS Ticket`}
                </span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};
