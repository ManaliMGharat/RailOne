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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Remove every character that is not 0-9
    // 2. Limit the resulting value to 10 digits
    // 3. Update the field with the sanitized value
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    clearFieldError('phone');
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digitsOnly = pasted.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    clearFieldError('phone');
  };

  const handlePhoneDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.getData('text');
    const digitsOnly = dropped.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    clearFieldError('phone');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    const newErrors: Record<string, string> = {};

    // 1. Validate Full Name
    const nameCheck = validateFullName(fullName);
    if (!nameCheck.valid) {
      newErrors.fullName = nameCheck.error || 'Please enter a valid full name.';
    }

    // 2. Validate Mobile Number (Indian 10-digit mobile starting with 6-9)
    const phoneCheck = validateMobileNumber(phone);
    if (!phoneCheck.valid) {
      newErrors.phone = phoneCheck.error || 'Enter a valid 10-digit mobile number starting with 6–9.';
    }

    // 3. Validate Email
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      newErrors.email = emailCheck.error || 'Please enter a valid email address.';
    }

    // 4. Validate Password (min 6 characters)
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      newErrors.password = pwdCheck.error || 'Password must be at least 6 characters long.';
    }

    // 5. Validate Confirm Password (must match password)
    const confirmCheck = validateConfirmPassword(password, confirmPassword);
    if (!confirmCheck.valid) {
      newErrors.confirmPassword = confirmCheck.error || 'Passwords do not match.';
    }

    // If any validation failed, show all errors simultaneously (BUG_002, BUG_003, BUG_004)
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please resolve all highlighted errors before proceeding.');
      return;
    }

    setFieldErrors({});

    // Clean phone number (strip +91/spaces/dashes)
    const cleanedPhone = phone.replace(/[\s\-\+]/g, '');
    const normalizedPhone = cleanedPhone.startsWith('91') && cleanedPhone.length === 12
      ? cleanedPhone.slice(2)
      : cleanedPhone;
    const normalizedEmail = email.trim().toLowerCase();

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
        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
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
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError('fullName');
                }}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border font-semibold text-sm text-[#172B63] focus:bg-white focus:outline-hidden transition ${
                  fieldErrors.fullName
                    ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400'
                    : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#0868F7]'
                }`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="mt-1 text-[11px] font-bold text-red-600 animate-in fade-in">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                onPaste={handlePhonePaste}
                onDrop={handlePhoneDrop}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border font-semibold text-sm text-[#172B63] focus:bg-white focus:outline-hidden transition ${
                  fieldErrors.phone
                    ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400'
                    : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#0868F7]'
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-[11px] font-bold text-red-600 animate-in fade-in">
                {fieldErrors.phone}
              </p>
            )}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="e.g. rahul@example.com"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border font-semibold text-sm text-[#172B63] focus:bg-white focus:outline-hidden transition ${
                  fieldErrors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400'
                    : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#0868F7]'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] font-bold text-red-600 animate-in fade-in">
                {fieldErrors.email}
              </p>
            )}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                placeholder="At least 6 characters"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border font-semibold text-sm text-[#172B63] focus:bg-white focus:outline-hidden transition ${
                  fieldErrors.password
                    ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400'
                    : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#0868F7]'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] font-bold text-red-600 animate-in fade-in">
                {fieldErrors.password}
              </p>
            )}
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
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError('confirmPassword');
                }}
                placeholder="Re-enter your password"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border font-semibold text-sm text-[#172B63] focus:bg-white focus:outline-hidden transition ${
                  fieldErrors.confirmPassword
                    ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400'
                    : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#0868F7]'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] font-bold text-red-600 animate-in fade-in">
                {fieldErrors.confirmPassword}
              </p>
            )}
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
