import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RailOneLogo } from '../components/RailOneLogo';
import {
  validateFullName,
  validateEmail,
  validateMobileNumber,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);

    // 1. Validate Full Name
    const nameCheck = validateFullName(fullName);
    if (!nameCheck.valid) {
      setError(nameCheck.error || 'Please enter a valid full name.');
      return;
    }

    // 2. Validate Mobile Number (Indian 10-digit mobile)
    const phoneCheck = validateMobileNumber(phone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Clean phone number (strip +91/spaces/dashes)
    const cleanedPhone = phone.replace(/[\s\-\+]/g, '');
    const normalizedPhone = cleanedPhone.startsWith('91') && cleanedPhone.length === 12
      ? cleanedPhone.slice(2)
      : cleanedPhone;

    // 3. Validate Email
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Please enter a valid email address.');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Validate Password
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      setError(pwdCheck.error || 'Password must be at least 6 characters long.');
      return;
    }

    // 5. Validate Confirm Password
    const confirmCheck = validateConfirmPassword(password, confirmPassword);
    if (!confirmCheck.valid) {
      setError(confirmCheck.error || 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), normalizedEmail, normalizedPhone, password);
      // Redirect to profile/dashboard upon successful registration
      const destination = (location.state as any)?.from?.pathname || '/profile';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto py-4 sm:py-8 px-2 animate-in fade-in duration-300">
      {/* Top: RailOne logo centered */}
      <div className="flex justify-center pt-1 mb-4">
        <RailOneLogo size="md" />
      </div>

      <div className="text-center space-y-1.5 mb-6">
        <h1 className="text-2xl sm:text-[26px] font-black text-[#172B63] tracking-tight">
          Create RailOne Account
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-400">
          Join India's unified railway travel companion
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#172B63] focus:bg-white focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#172B63] focus:bg-white focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#172B63] focus:bg-white focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#172B63] focus:bg-white focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#172B63] focus:bg-white focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden transition"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-2xl text-[#0868F7] text-[11px] font-medium flex items-center gap-2 border border-blue-100">
            <ShieldCheck className="w-4 h-4 text-[#0868F7] shrink-0" />
            <span>Includes ₹1,500 complimentary RailOne Wallet travel balance upon registration.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#0868F7] text-white font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#0868F7] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
