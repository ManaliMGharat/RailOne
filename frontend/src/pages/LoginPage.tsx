import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const LoginPage: React.FC = () => {
  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState<string>('manali@railone.in');
  const [password, setPassword] = useState<string>('manali123');

  // OTP tab states
  const [phone, setPhone] = useState<string>('9820098200');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [demoHint, setDemoHint] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<any>('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setOtpSent(true);
      setDemoHint(res.demo_hint);
      setOtp(res.demo_hint || '');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError(null);
    try {
      await loginWithOtp(phone, otp);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (type: 'manali' | 'admin') => {
    if (type === 'manali') {
      setIdentifier('manali@railone.in');
      setPassword('manali123');
    } else {
      setIdentifier('admin@railone.in');
      setPassword('admin123');
    }
    setTab('password');
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6 animate-in fade-in duration-200">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-[#1B254B]">Sign in to RailOne</h1>
        <p className="text-xs text-slate-400">Your journey, simplified.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Tabs: Password vs Fast Phone OTP */}
      <div className="flex p-1 bg-slate-200/70 rounded-2xl gap-1">
        <button
          onClick={() => setTab('password')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
            tab === 'password' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Password Login
        </button>
        <button
          onClick={() => setTab('otp')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
            tab === 'otp' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Phone OTP Fast Login
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        {tab === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. manali@railone.in"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#1B254B] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#1B254B] focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#1B254B]"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition"
              >
                {loading ? 'Sending SMS Code...' : 'Send Verification OTP'}
              </button>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {demoHint && (
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs">
                    Automated testing demo code: <span className="font-mono font-bold">{demoHint}</span>
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono text-xl font-bold tracking-widest"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Enter'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 1-Click Fast Demo Logins */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Demo Profiles
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoUser('manali')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition text-left text-xs"
            >
              <div className="font-bold text-[#1B254B]">Manali Gharat</div>
              <div className="text-[10px] text-slate-400">Demo Passenger</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('admin')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 transition text-left text-xs"
            >
              <div className="font-bold text-purple-900">Railway Admin</div>
              <div className="text-[10px] text-purple-500">Administrator</div>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Register New Profile
          </Link>
        </div>
      </div>

    </div>
  );
};
