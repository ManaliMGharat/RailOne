import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Train, ArrowRight, User as UserIcon, Plus, Trash2, CheckCircle2, 
  CreditCard, Smartphone, Building, ShieldCheck, AlertCircle, Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PassengerInput, TrainSearchResult } from '../types';

export const BookingFlow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const trainId = Number(searchParams.get('train_id'));
  const classCode = searchParams.get('class') || '3A';
  const journeyDate = searchParams.get('date') || '';
  const fromCode = searchParams.get('from') || '';
  const toCode = searchParams.get('to') || '';

  const [step, setStep] = useState<number>(1);
  const [train, setTrain] = useState<any | null>(null);
  const [fromStation, setFromStation] = useState<any | null>(null);
  const [toStation, setToStation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Passengers form state
  const [passengers, setPassengers] = useState<PassengerInput[]>([
    {
      full_name: user?.full_name || '',
      age: 28,
      gender: 'MALE',
      berth_preference: 'LOWER',
      id_type: 'Aadhaar',
      id_number: '',
    },
  ]);

  // Payment method simulation state
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('user@upi');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState(user?.full_name || 'Cardholder Name');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    fetchBookingPrerequisites();
  }, [trainId, fromCode, toCode]);

  const fetchBookingPrerequisites = async () => {
    try {
      setLoading(true);
      const [tRes, fRes, toRes] = await Promise.all([
        api.get(`/trains/${trainId}`),
        api.get(`/stations/search?q=${fromCode}`),
        api.get(`/stations/search?q=${toCode}`),
      ]);
      setTrain(tRes.data);
      setFromStation(fRes.data[0]);
      setToStation(toRes.data[0]);
    } catch (err: any) {
      setError('Unable to load journey information. Please re-select your train.');
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers([
      ...passengers,
      {
        full_name: '',
        age: 25,
        gender: 'MALE',
        berth_preference: 'NO_PREFERENCE',
        id_type: 'Aadhaar',
        id_number: '',
      },
    ]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: keyof PassengerInput, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  // Fare calculations
  const baseFaresMap: Record<string, number> = {
    '1A': 3800,
    '2A': 2400,
    '3A': 1680,
    'CC': 850,
    'SL': 480,
    '2S': 210,
  };
  const unitFare = baseFaresMap[classCode] || 900;
  const numPax = passengers.length;
  const baseTotal = unitFare * numPax;
  const reservationTotal = 40 * numPax;
  const superfastTotal = 45 * numPax;
  const gstTotal = ['1A', '2A', '3A', 'CC'].includes(classCode) ? Math.round(baseTotal * 0.05) : 0;
  const grandTotal = baseTotal + reservationTotal + superfastTotal + gstTotal;

  const handleConfirmAndPay = async () => {
    setIsProcessingPayment(true);
    setError(null);
    try {
      const payload = {
        train_id: trainId,
        from_station_id: fromStation.id,
        to_station_id: toStation.id,
        journey_date: journeyDate,
        class_code: classCode,
        passengers: passengers,
        payment_method: paymentMethod,
      };

      const res = await api.post('/bookings', payload);
      const bookingData = res.data;
      navigate(`/bookings?new_booking=${bookingData.booking_reference}&pnr=${bookingData.pnr_number}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Payment simulation failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-rail-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">Preparing reservation wizard...</p>
      </div>
    );
  }

  if (error && !train) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <h3 className="font-bold text-base">Booking Error</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
        <Link to="/search" className="inline-block px-4 py-2 bg-rail-600 text-white rounded-xl text-xs font-bold">
          Return to Train Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Step Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {[
            { stepNum: 1, title: 'Train & Class' },
            { stepNum: 2, title: 'Passenger Details' },
            { stepNum: 3, title: 'Review Journey' },
            { stepNum: 4, title: 'Payment Simulation' },
          ].map((s) => (
            <div key={s.stepNum} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step === s.stepNum
                    ? 'bg-rail-600 text-white ring-4 ring-rail-100'
                    : step > s.stepNum
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s.stepNum ? <CheckCircle2 className="w-4 h-4" /> : s.stepNum}
              </div>
              <span
                className={`text-xs font-semibold hidden md:inline ${
                  step === s.stepNum ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Train Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-rail-950 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-rail-500 text-white font-mono text-xs font-bold rounded">
                #{train.number}
              </span>
              <h2 className="text-xl font-black">{train.name}</h2>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-300 mt-2">
              <span className="font-semibold text-white">Class: {classCode}</span>
              <span>•</span>
              <span>Date: {new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60">
            <div>
              <div className="text-lg font-bold text-white">{train.departure_time}</div>
              <div className="text-xs text-slate-300 font-semibold">{fromStation?.name || fromCode}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-rail-400" />
            <div>
              <div className="text-lg font-bold text-white">{train.arrival_time}</div>
              <div className="text-xs text-slate-300 font-semibold">{toStation?.name || toCode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: Train & Class Confirmation */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900">Step 1: Confirm Train & Travel Class</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verify your selected train schedule and class category</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 block mb-1">SELECTED CLASS</span>
              <div className="text-lg font-black text-slate-900">{classCode}</div>
              <p className="text-xs text-slate-500 mt-1">Confirmed berth allotment priority based on availability.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 block mb-1">INDICATIVE BASE FARE</span>
              <div className="text-lg font-black text-rail-600">₹{unitFare} <span className="text-xs text-slate-500 font-normal">/ pax</span></div>
              <p className="text-xs text-slate-500 mt-1">Excludes GST, superfast charge & reservation fee.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-rail-600 hover:bg-rail-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Continue to Passenger Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Passengers Form */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Step 2: Passenger Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">Add up to 6 passengers for this reservation</p>
            </div>
            {passengers.length < 6 && (
              <button
                type="button"
                onClick={addPassenger}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rail-50 text-rail-700 hover:bg-rail-100 font-semibold text-xs rounded-lg transition-colors border border-rail-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Passenger</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {passengers.map((p, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Passenger #{idx + 1}
                  </span>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={p.full_name}
                      onChange={(e) => handlePassengerChange(idx, 'full_name', e.target.value)}
                      placeholder="As per Government ID"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rail-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={p.age}
                      onChange={(e) => handlePassengerChange(idx, 'age', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rail-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Gender</label>
                    <select
                      value={p.gender}
                      onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rail-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="TRANSGENDER">Transgender</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Berth Preference</label>
                    <select
                      value={p.berth_preference}
                      onChange={(e) => handlePassengerChange(idx, 'berth_preference', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rail-500"
                    >
                      <option value="NO_PREFERENCE">No Preference</option>
                      <option value="LOWER">Lower Berth</option>
                      <option value="MIDDLE">Middle Berth</option>
                      <option value="UPPER">Upper Berth</option>
                      <option value="SIDE_LOWER">Side Lower</option>
                      <option value="SIDE_UPPER">Side Upper</option>
                      <option value="WINDOW">Window Seat (CC/2S)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">ID Type & Number</label>
                    <div className="flex space-x-1">
                      <select
                        value={p.id_type}
                        onChange={(e) => handlePassengerChange(idx, 'id_type', e.target.value)}
                        className="w-24 px-2 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold"
                      >
                        <option value="Aadhaar">Aadhaar</option>
                        <option value="PAN">PAN</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                      <input
                        type="text"
                        value={p.id_number || ''}
                        onChange={(e) => handlePassengerChange(idx, 'id_number', e.target.value)}
                        placeholder="ID number"
                        className="flex-1 px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => {
                const invalid = passengers.some((p) => !p.full_name.trim());
                if (invalid) {
                  alert('Please enter names for all passengers.');
                  return;
                }
                setStep(3);
              }}
              className="px-6 py-2.5 bg-rail-600 hover:bg-rail-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Review Booking →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review Booking & Fare Breakdown */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900">Step 3: Review Journey & Fare Summary</h3>
            <p className="text-xs text-slate-500 mt-0.5">Please review your passenger details and fare breakdown before proceeding</p>
          </div>

          {/* Passenger Review Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-bold text-slate-600">#</th>
                  <th className="px-4 py-2.5 text-left font-bold text-slate-600">Name</th>
                  <th className="px-4 py-2.5 text-left font-bold text-slate-600">Age / Gender</th>
                  <th className="px-4 py-2.5 text-left font-bold text-slate-600">Berth Preference</th>
                  <th className="px-4 py-2.5 text-left font-bold text-slate-600">ID Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {passengers.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-bold text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{p.full_name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.age} yrs • {p.gender}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.berth_preference}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.id_type} {p.id_number ? `(${p.id_number})` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fare Summary Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">Fare Breakdown</div>
            <div className="flex justify-between text-slate-600">
              <span>Base Fare ({numPax} {numPax === 1 ? 'passenger' : 'passengers'} × ₹{unitFare})</span>
              <span className="font-semibold text-slate-900">₹{baseTotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Reservation Charge (₹40 / pax)</span>
              <span className="font-semibold text-slate-900">₹{reservationTotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Superfast Surcharge (₹45 / pax)</span>
              <span className="font-semibold text-slate-900">₹{superfastTotal}</span>
            </div>
            {gstTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST (5% for AC Classes)</span>
                <span className="font-semibold text-slate-900">₹{gstTotal}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Total Payable Amount</span>
              <span className="text-xl text-rail-700">₹{grandTotal}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
            >
              ← Edit Passengers
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-rail-600 hover:bg-rail-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Proceed to Payment Simulation →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Mock Payment Simulation */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Step 4: Payment Simulation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Development sandbox mode — no real money will be charged</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Amount to Pay</span>
              <span className="text-xl font-black text-slate-900">₹{grandTotal}</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone },
              { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
              { id: 'NETBANKING', label: 'Net Banking', icon: Building },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    paymentMethod === m.id
                      ? 'border-rail-600 bg-rail-50/70 text-rail-700 ring-2 ring-rail-500/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Payment Details Container */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            {paymentMethod === 'UPI' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@oksbi"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium w-64 focus:ring-2 focus:ring-rail-500"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-900 text-white rounded-lg flex items-center justify-center font-mono text-[10px] mx-auto mb-1">
                      [SIMULATED QR]
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">Scan to pay ₹{grandTotal}</span>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'NETBANKING' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  You will be redirected to the mock banking simulation portal to authorize ₹{grandTotal}.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleConfirmAndPay}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Reservation...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>PAY ₹{grandTotal} & CONFIRM BOOKING</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
