import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, Sparkles, KeyRound, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { apiClient } from '../api/client';
import { RailOneLogo } from '../components/RailOneLogo';
import { MpinInput } from '../components/MpinInput';
import { BiometricToggle } from '../components/BiometricToggle';

export const LoginPage: React.FC = () => {
  const { user, token, login, loginWithMpin, loginWithOtp, setMPIN, verifyMPIN } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Remembered user from local storage
  const [rememberedUser, setRememberedUser] = useState<{ email: string; phone: string; full_name: string } | null>(() => {
    try {
      const saved = localStorage.getItem('railone_remembered_user');
      if (saved) return JSON.parse(saved);
      const active = localStorage.getItem('railone_user');
      if (active) return JSON.parse(active);
    } catch {}
    // Default passenger profile if no remembered user yet
    return {
      email: 'manali@railone.in',
      phone: '9820098200',
      full_name: 'Manali Manish Gharat'
    };
  });

  // UI Modes: 'mpin' (Default screenshot view) | 'password' | 'otp'
  const [authMode, setAuthMode] = useState<'mpin' | 'password' | 'otp'>('mpin');

  // mPIN state
  const [mpin, setMpin] = useState<string>('');
  const [mpinLoading, setMpinLoading] = useState<boolean>(false);
  const [mpinError, setMpinError] = useState<string | null>(null);

  // Standard Login state
  const [identifier, setIdentifier] = useState<string>('manali@railone.in');
  const [password, setPassword] = useState<string>('manali123');
  const [pwdLoading, setPwdLoading] = useState<boolean>(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // OTP Login state
  const [otpPhone, setOtpPhone] = useState<string>('9820098200');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Modal Dialogs
  const [showForgotPwdModal, setShowForgotPwdModal] = useState<boolean>(false);
  const [showResetMpinModal, setShowResetMpinModal] = useState<boolean>(false);

  // Reset mPIN flow states: 1 = Phone/OTP Request, 2 = Verify OTP, 3 = Enter New 6-digit mPIN, 4 = Success
  const [resetStep, setResetStep] = useState<number>(1);
  const [resetPhone, setResetPhone] = useState<string>(rememberedUser?.phone || '9820098200');
  const [resetOtp, setResetOtp] = useState<string>('');
  const [resetDemoHint, setResetDemoHint] = useState<string | null>(null);
  const [newMpin, setNewMpin] = useState<string>('');
  const [confirmMpin, setConfirmMpin] = useState<string>('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  // Handle mPIN submission
  const handleMpinSubmit = async (pinValue?: string) => {
    const pinToVerify = pinValue || mpin;
    if (pinToVerify.length !== 6 && pinToVerify.length !== 4) {
      setMpinError('Please enter all 6 digits of your mPIN.');
      return;
    }

    setMpinLoading(true);
    setMpinError(null);

    try {
      const username = rememberedUser?.email || rememberedUser?.phone || 'manali@railone.in';

      // 1. If currently have valid token, verify mPIN via POST /api/auth/mpin/verify
      if (token) {
        const verified = await verifyMPIN(pinToVerify);
        if (verified) {
          navigate('/');
          return;
        }
      }

      // 2. Perform direct mPIN authentication via POST /api/auth/mpin/login
      await loginWithMpin(username, pinToVerify);
      navigate('/');
    } catch (err: any) {
      setMpinError(err.message || 'Incorrect mPIN. Please check and try again.');
      setMpin('');
    } finally {
      setMpinLoading(false);
    }
  };

  // Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdError(null);
    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err: any) {
      setPwdError(err.message || 'Invalid credentials.');
    } finally {
      setPwdLoading(false);
    }
  };

  // OTP Login: Request
  const handleRequestOtp = async () => {
    if (!otpPhone || otpPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await apiClient<any>('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone: otpPhone }),
      });
      setOtpSent(true);
      setDemoHint(res.demo_hint);
      setOtpCode(res.demo_hint || '');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Login: Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      await loginWithOtp(otpPhone, otpCode);
      navigate('/');
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Reset mPIN: Step 1 (Request OTP)
  const handleResetRequestOtp = async () => {
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await apiClient<any>('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone: resetPhone }),
      });
      setResetDemoHint(res.demo_hint);
      setResetOtp(res.demo_hint || '');
      setResetStep(2);
    } catch (err: any) {
      setResetError(err.message || 'Failed to send OTP for mPIN reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // Reset mPIN: Step 2 (Verify OTP)
  const handleResetVerifyOtp = async () => {
    setResetLoading(true);
    setResetError(null);
    try {
      await loginWithOtp(resetPhone, resetOtp);
      setResetStep(3);
    } catch (err: any) {
      setResetError(err.message || 'Invalid OTP code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Reset mPIN: Step 3 (Set New mPIN)
  const handleSaveNewMpin = async () => {
    if (newMpin.length !== 6) {
      setResetError('New mPIN must be 6 numerical digits.');
      return;
    }
    if (newMpin !== confirmMpin) {
      setResetError('mPIN confirmation does not match.');
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      await setMPIN(newMpin);
      setResetStep(4);
    } catch (err: any) {
      setResetError(err.message || 'Failed to update mPIN.');
    } finally {
      setResetLoading(false);
    }
  };

  // Switch to Different User
  const handleDifferentUser = () => {
    setAuthMode('password');
  };

  const displayName = rememberedUser?.full_name || user?.full_name || 'Passenger';

  return (
    <div className="w-full max-w-[430px] mx-auto py-6 sm:py-10 px-2 animate-in fade-in duration-300">
      
      {/* ================= SCREENSHOT 1: MPIN AUTHENTICATION SCREEN ================= */}
      {authMode === 'mpin' ? (
        <div className="space-y-7">
          
          {/* Top: RailOne logo centered */}
          <div className="flex justify-center pt-2">
            <RailOneLogo size="lg" />
          </div>

          {/* Heading and Greetings */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-[26px] font-black text-[#172B63] tracking-tight">
              {t('loginUsingMpin')}
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#172B63]/90">
              Welcome {displayName}!
            </p>
            <p className="text-sm font-semibold text-slate-400">
              {t('enterMpinBelow')}
            </p>
          </div>

          {/* Six Individual mPIN Input Boxes */}
          <div className="space-y-4">
            <MpinInput
              length={6}
              value={mpin}
              onChange={(val) => {
                setMpin(val);
                setMpinError(null);
              }}
              onComplete={(pinVal) => {
                handleMpinSubmit(pinVal);
              }}
              hasError={Boolean(mpinError)}
              disabled={mpinLoading}
            />

            {mpinError && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-2xl border border-red-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mpinError}</span>
              </div>
            )}

            {mpinLoading && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0868F7]">
                <div className="w-4 h-4 rounded-full border-2 border-[#0868F7] border-t-transparent animate-spin" />
                <span>Verifying mPIN with Indian Railways server...</span>
              </div>
            )}
          </div>

          {/* Sub-row: Forgot Password? and Reset mPIN? */}
          <div className="flex items-center justify-between px-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setShowForgotPwdModal(true)}
              className="text-slate-500 hover:text-[#0868F7] transition cursor-pointer"
            >
              {t('forgotPassword')}
            </button>
            <button
              type="button"
              onClick={() => {
                setResetStep(1);
                setResetError(null);
                setShowResetMpinModal(true);
              }}
              className="text-slate-500 hover:text-[#0868F7] transition cursor-pointer"
            >
              {t('resetMpin')}
            </button>
          </div>

          {/* Section 7: Biometric Authentication Toggle */}
          <BiometricToggle
            enabled={user?.biometric_enabled || false}
            onToggle={() => {}}
            onBiometricLogin={() => {
              if (token) {
                navigate('/');
              }
            }}
          />

          {/* Section 8: Different User? */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleDifferentUser}
              className="text-sm font-extrabold text-[#0868F7] hover:underline cursor-pointer active:scale-95 transition"
            >
              {t('differentUser')}
            </button>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-8 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-[#172B63] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Development Access Hint</span>
            </div>
            <div>
              Passenger: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700">8421</code> (Manali Gharat) or <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700">1234</code>
            </div>
            <div>
              Admin: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700">7391</code> / <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700">9999</code>
            </div>
          </div>

        </div>
      ) : (
        /* ================= STANDARD LOGIN / DIFFERENT USER VIEW ================= */
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <RailOneLogo size="md" />
            </div>
            <h2 className="text-2xl font-black text-[#172B63]">Sign In to RailOne</h2>
            <p className="text-xs text-slate-400">Choose your preferred login method</p>
          </div>

          {/* Tabs: Password vs OTP */}
          <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
                authMode === 'password' ? 'bg-white text-[#0868F7] shadow-xs' : 'text-slate-500'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
                authMode === 'otp' ? 'bg-white text-[#0868F7] shadow-xs' : 'text-slate-500'
              }`}
            >
              Phone OTP Fast Login
            </button>
          </div>

          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {pwdError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-200">
                  {pwdError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email or Registered Mobile
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="manali@railone.in or mobile"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-[#172B63] focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-[#172B63] focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-3.5 rounded-2xl bg-[#0868F7] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center justify-center gap-2"
              >
                {pwdLoading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {authMode === 'otp' && (
            <div className="space-y-4">
              {otpError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-200">
                  {otpError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-[#172B63] focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={otpLoading}
                    className="px-4 py-3 bg-blue-50 text-[#0868F7] hover:bg-blue-100 font-bold text-xs rounded-2xl transition border border-blue-200"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2">
                  {demoHint && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
                      Development Demo OTP: <span className="font-mono font-bold text-emerald-900">{demoHint}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter received OTP"
                      className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-sm text-center font-bold tracking-widest text-[#172B63] focus:ring-2 focus:ring-[#0868F7] focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3.5 rounded-2xl bg-[#0868F7] text-white font-bold text-sm shadow-md hover:bg-blue-700 transition"
                  >
                    Verify & Login
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick return to mPIN */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setAuthMode('mpin')}
              className="text-xs font-bold text-[#0868F7] hover:underline"
            >
              Back to mPIN Login
            </button>
          </div>

          <div className="text-center pt-1 border-t border-slate-100 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#0868F7] hover:underline">
              Register now
            </Link>
          </div>
        </div>
      )}

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#172B63]">
                Forgot Password
              </h3>
              <button
                onClick={() => setShowForgotPwdModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              RailOne accounts are connected to the official railway security layer. To reset your master password:
            </p>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <p>
                1. You can log in instantly without a password using <strong>Phone OTP Fast Login</strong>.
              </p>
              <p>
                2. Alternatively, contact the 24/7 RailOne passenger helpdesk at <span className="font-semibold text-blue-600">support@railone.in</span>.
              </p>
            </div>
            <button
              onClick={() => {
                setShowForgotPwdModal(false);
                setAuthMode('otp');
              }}
              className="w-full py-3 rounded-2xl bg-[#0868F7] text-white font-bold text-xs hover:bg-blue-700 transition"
            >
              Use Phone OTP Login Instead
            </button>
          </div>
        </div>
      )}

      {/* ================= RESET MPIN MODAL (FUNCTIONAL OTP FLOW) ================= */}
      {showResetMpinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#172B63]">
                Reset Your 6-Digit mPIN
              </h3>
              <button
                onClick={() => setShowResetMpinModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200">
                {resetError}
              </div>
            )}

            {/* Step 1: Request OTP */}
            {resetStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered mobile number to receive a secure verification code:
                </p>
                <input
                  type="tel"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#172B63]"
                />
                <button
                  type="button"
                  onClick={handleResetRequestOtp}
                  disabled={resetLoading}
                  className="w-full py-3 rounded-2xl bg-[#0868F7] text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
                >
                  {resetLoading ? 'Sending...' : 'Send Verification OTP'}
                </button>
              </div>
            )}

            {/* Step 2: Verify OTP */}
            {resetStep === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter the 6-digit OTP code sent to {resetPhone}:
                </p>
                {resetDemoHint && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl">
                    Demo OTP: <span className="font-mono font-bold">{resetDemoHint}</span>
                  </div>
                )}
                <input
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center text-sm font-bold tracking-widest text-[#172B63]"
                />
                <button
                  type="button"
                  onClick={handleResetVerifyOtp}
                  disabled={resetLoading}
                  className="w-full py-3 rounded-2xl bg-[#0868F7] text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm"
                >
                  {resetLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* Step 3: Enter New 6-digit mPIN */}
            {resetStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Set a new 6-digit mPIN for instant logins:
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    New 6-Digit mPIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newMpin}
                    onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6 digits"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center text-sm font-bold tracking-widest text-[#172B63]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Confirm New mPIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmMpin}
                    onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Confirm 6 digits"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center text-sm font-bold tracking-widest text-[#172B63]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveNewMpin}
                  disabled={resetLoading}
                  className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm"
                >
                  {resetLoading ? 'Saving...' : 'Save New mPIN'}
                </button>
              </div>
            )}

            {/* Step 4: Success */}
            {resetStep === 4 && (
              <div className="text-center space-y-3 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-[#172B63]">
                  mPIN Reset Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Your new 6-digit mPIN is active. You can now login instantly using it.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetMpinModal(false);
                    setAuthMode('mpin');
                  }}
                  className="w-full py-3 rounded-2xl bg-[#0868F7] text-white font-bold text-xs hover:bg-blue-700 transition"
                >
                  Return to mPIN Login
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
