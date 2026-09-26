import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';
import { Wallet } from '../types';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Top-Up Modal
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500);
  const [topUpLoading, setTopUpLoading] = useState<boolean>(false);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);

  const fetchWallet = () => {
    setLoading(true);
    apiClient<Wallet>('/wallet')
      .then((data) => {
        setWallet(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch wallet');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWallet();
  }, [user]);

  const handleTopUp = async () => {
    if (topUpAmount <= 0) return;
    setTopUpLoading(true);
    setTopUpSuccess(null);
    try {
      const res = await apiClient<Wallet>('/wallet/add', {
        method: 'POST',
        body: JSON.stringify({
          amount: topUpAmount,
          payment_method: 'UPI',
        }),
      });
      setWallet(res);
      setTopUpSuccess(`₹${topUpAmount} added successfully to your RailOne Wallet!`);
      setTimeout(() => {
        setShowTopUpModal(false);
        setTopUpSuccess(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Recharge failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-600 text-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
              RailOne Digital Travel Wallet
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-white font-semibold text-[10px] backdrop-blur-xs">
            Instant RailPay
          </span>
        </div>

        <div>
          <div className="text-xs text-blue-100 font-medium">Available Balance</div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
            {loading ? '₹...' : `₹${wallet?.balance.toFixed(2) || '0.00'}`}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-blue-100">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Zero payment gateway fee on train tickets</span>
          </div>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 active:scale-95 transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
          Recent Wallet Transactions
        </h2>

        {loading && (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading transaction history...
          </div>
        )}

        {!loading && wallet && wallet.transactions.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs">
            No transactions found.
          </div>
        )}

        {!loading && wallet && wallet.transactions.length > 0 && (
          <div className="space-y-2.5">
            {wallet.transactions.map((tx) => {
              const isCredit = tx.tx_type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Ref: {tx.reference_id || 'AUTO'} • {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-black text-sm ${
                        isCredit ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </span>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">{tx.tx_type}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOP-UP MODAL */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#1B254B]">Recharge Wallet</h3>
              <button onClick={() => setShowTopUpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {topUpSuccess ? (
              <div className="py-6 text-center text-emerald-600 space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <div className="font-bold text-sm">{topUpSuccess}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Enter Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xl font-black text-[#1B254B]"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        topUpAmount === amt
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleTopUp}
                  disabled={topUpLoading || topUpAmount <= 0}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{topUpLoading ? 'Processing UPI Recharge...' : `Proceed to Add ₹${topUpAmount}`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
