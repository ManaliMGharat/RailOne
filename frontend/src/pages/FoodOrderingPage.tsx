import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Search,
  Star,
  Clock,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X,
  Train,
} from 'lucide-react';
import { Restaurant, MenuItem, FoodOrder, Booking } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const FoodOrderingPage: React.FC = () => {
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cart State: Map of menuItemId -> { item: MenuItem, qty: number, restaurant: Restaurant }
  const [cart, setCart] = useState<{ [id: number]: { item: MenuItem; qty: number; restaurant: Restaurant } }>({});
  const [showCheckout, setShowCheckout] = useState<boolean>(false);

  // BUG_011: No hardcoded defaults; empty or populated from user's active bookings
  const [trainNumber, setTrainNumber] = useState<string>('');
  const [pnrNumber, setPnrNumber] = useState<string>('');
  const [deliveryStation, setDeliveryStation] = useState<string>('');
  const [coachBerth, setCoachBerth] = useState<string>('');
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<FoodOrder | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Lock body scroll when checkout modal is open (BUG_009)
  useBodyScrollLock(showCheckout);

  useEffect(() => {
    if (!showCheckout) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCheckout(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCheckout]);

  // Load user's recent bookings for auto-fill
  useEffect(() => {
    if (user) {
      apiClient<Booking[]>('/bookings')
        .then((b) => setUserBookings(b.filter((bk) => bk.status === 'Confirmed')))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const query = selectedStation ? `?station=${selectedStation}` : '';
    apiClient<Restaurant[]>(`/food/restaurants${query}`)
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load restaurants');
        setLoading(false);
      });
  }, [selectedStation]);

  const addToCart = (item: MenuItem, rest: Restaurant) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const newQty = existing ? existing.qty + 1 : 1;
      return {
        ...prev,
        [item.id]: { item, qty: newQty, restaurant: rest },
      };
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...existing, qty: existing.qty - 1 },
      };
    });
  };

  const cartItems = Object.values(cart);
  const totalAmount = cartItems.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    if (!user) {
      alert('Please log in to place an order.');
      return;
    }

    setCheckoutError(null);

    // Validation (BUG_011: enforce real delivery requirements)
    if (!trainNumber.trim()) {
      setCheckoutError('Please enter your Train Number.');
      return;
    }
    if (!deliveryStation.trim()) {
      setCheckoutError('Please specify the Delivery Railway Station.');
      return;
    }
    if (!coachBerth.trim()) {
      setCheckoutError('Please specify your Coach and Berth (e.g. B2 - 34).');
      return;
    }

    setOrderLoading(true);

    const firstRest = cartItems[0].restaurant;
    try {
      const res = await apiClient<FoodOrder>('/food/orders', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: firstRest.id,
          train_number: trainNumber.trim(),
          pnr_number: pnrNumber.trim() || undefined,
          delivery_station: deliveryStation.trim(),
          coach_berth: coachBerth.trim(),
          items: cartItems.map((ci) => ({
            menu_item_id: ci.item.id,
            quantity: ci.qty,
          })),
        }),
      });
      setOrderSuccess(res);
      setCart({});
    } catch (err: any) {
      setCheckoutError(err.message || 'Order failed. Please check your wallet balance and details.');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            IRCTC E-Catering On-Seat Delivery
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B]">
            Order Food in Train
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
          <Utensils className="w-5 h-5" />
        </div>
      </div>

      {/* Filter by Station */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {['', 'MMCT', 'PUNE', 'NEU'].map((code) => (
          <button
            key={code}
            onClick={() => setSelectedStation(code)}
            className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              selectedStation === code
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {code === '' ? 'All Railway Stations' : `${code} Station Kitchens`}
          </button>
        ))}
      </div>

      {/* Cart Float Button on Mobile */}
      {cartItems.length > 0 && !showCheckout && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto">
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 text-white font-extrabold text-sm shadow-xl flex items-center justify-between animate-bounce"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cartItems.length} Items Selected</span>
            </div>
            <span>View Cart • ₹{totalAmount.toFixed(2)}</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold">Loading hygienic station kitchens...</p>
        </div>
      )}

      {/* Restaurants & Menus */}
      {!loading && (
        <div className="space-y-6">
          {restaurants.map((rest) => (
            <div
              key={rest.id}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#1B254B]">{rest.name}</h3>
                    {rest.is_pure_veg && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        PURE VEG
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {rest.cuisines} • Station: <span className="font-bold text-slate-700">{rest.station_name} ({rest.station_code})</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rest.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{rest.delivery_time_mins} mins</span>
                  </div>
                </div>
              </div>

              {/* Menu Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rest.menu_items.map((item) => {
                  const qty = cart[item.id]?.qty || 0;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full border ${
                              item.is_veg ? 'bg-emerald-600 border-emerald-700' : 'bg-red-600 border-red-700'
                            }`}
                          ></span>
                          <span className="font-bold text-slate-800">{item.name}</span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                        )}
                        <div className="font-extrabold text-blue-700 text-sm">₹{item.price.toFixed(2)}</div>
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-orange-600 text-white rounded-xl px-2 py-1 shrink-0 font-bold">
                          <button onClick={() => removeFromCart(item.id)} className="p-0.5 hover:opacity-80">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs px-1">{qty}</span>
                          <button onClick={() => addToCart(item, rest)} className="p-0.5 hover:opacity-80">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item, rest)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition shrink-0"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHECKOUT MODAL (BUG_011 & BUG_009) */}
      {showCheckout && (
        <div 
          onClick={() => setShowCheckout(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B254B]">Seat Delivery Checkout</h3>
              <button 
                onClick={() => setShowCheckout(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-200 flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{checkoutError}</span>
              </div>
            )}

            {orderSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg text-[#1B254B]">Food Order Placed!</h4>
                <p className="text-xs text-slate-400">Order ID: <span className="font-mono font-bold text-slate-700">{orderSuccess.order_id}</span></p>
                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-left space-y-1">
                  <div>Delivery at: <span className="font-bold">{orderSuccess.delivery_station}</span></div>
                  <div>Seat: <span className="font-bold">{orderSuccess.coach_berth}</span></div>
                  <div>Status: <span className="font-bold text-amber-600">{orderSuccess.status}</span></div>
                </div>
                <button
                  onClick={() => {
                    setShowCheckout(false);
                    setOrderSuccess(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {cartItems.map((ci) => (
                      <div key={ci.item.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                        <span>{ci.item.name} × {ci.qty}</span>
                        <span className="font-bold">₹{(ci.item.price * ci.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="font-bold text-slate-700 block">Train & Seat Details</label>

                  {userBookings.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Auto-fill From Active Booking
                      </span>
                      <select
                        onChange={(e) => {
                          const bkId = e.target.value;
                          if (!bkId) return;
                          const b = userBookings.find((item) => String(item.id) === bkId);
                          if (b) {
                            setTrainNumber(b.train_number);
                            setPnrNumber(b.pnr_number);
                            setDeliveryStation(`${b.dest_name} (${b.dest_code})`);
                            if (b.tickets && b.tickets.length > 0) {
                              setCoachBerth(`${b.tickets[0].coach} - Berth ${b.tickets[0].berth}`);
                            }
                          }
                        }}
                        defaultValue=""
                        className="w-full p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs font-semibold text-blue-900"
                      >
                        <option value="">Select a journey to auto-fill...</option>
                        {userBookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.train_number} - {b.train_name} ({b.source_code} → {b.dest_code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Train Number (e.g. 12124)"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="PNR Number (Optional)"
                    value={pnrNumber}
                    onChange={(e) => setPnrNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Delivery Railway Station"
                    value={deliveryStation}
                    onChange={(e) => setDeliveryStation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Coach & Berth (e.g. B2 - 34)"
                    value={coachBerth}
                    onChange={(e) => setCoachBerth(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Total Payable:</span>
                  <span className="text-base font-black text-blue-700">₹{totalAmount.toFixed(2)}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                  className="w-full py-3.5 rounded-2xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                >
                  {orderLoading ? 'Placing Order...' : 'Pay with RailOne Wallet & Confirm'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
