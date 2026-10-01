import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Fingerprint,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, setMPIN, enableBiometrics, disableBiometrics } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [dob, setDob] = useState<string>(user?.dob || '');
  const [gender, setGender] = useState<string>(user?.gender || 'Not Specified');
  const [address, setAddress] = useState<string>(user?.address || '');
  const [emergencyContact, setEmergencyContact] = useState<string>(user?.emergency_contact || '');

  // Keep form in sync when authenticated user profile updates or changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setDob(user.dob || '');
      setGender(user.gender || 'Not Specified');
      setAddress(user.address || '');
      setEmergencyContact(user.emergency_contact || '');
    }
  }, [user]);

  // mPIN modal state (BUG_007)
  const [showMpinModal, setShowMpinModal] = useState<boolean>(false);
  const [newMpin, setNewMpin] = useState<string>('');
  const [confirmMpin, setConfirmMpin] = useState<string>('');
  const [mpinError, setMpinError] = useState<string | null>(null);
  const [mpinMsg, setMpinMsg] = useState<string | null>(null);

  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Prevent background scrolling when mPIN modal is open (BUG_009)
  useBodyScrollLock(showMpinModal);

  // Cancel / Close mPIN modal completely resetting inputs and errors (BUG_007)
  const handleCloseMpinModal = () => {
    setNewMpin('');
    setConfirmMpin('');
    setMpinError(null);
    setMpinMsg(null);
    setShowMpinModal(false);
  };

  useEffect(() => {
    if (!showMpinModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseMpinModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMpinModal]);

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-100 shadow-sm">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-[#1B254B]">Sign in to RailOne</h2>
        <p className="text-xs text-slate-400">Log in to view profile, manage wallet, and download e-tickets.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullName,
        dob,
        gender,
        address,
        emergency_contact: emergencyContact,
      });
      setProfileMsg('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setProfileMsg(null), 3000);
    } catch {
      alert('Failed to update profile.');
    }
  };

  const handleSetMpin = async () => {
    setMpinError(null);
    if (!newMpin.match(/^\d{4,6}$/)) {
      setMpinError('mPIN must be a 4 or 6 digit number.');
      return;
    }
    if (newMpin !== confirmMpin) {
      setMpinError('mPIN and Confirm mPIN do not match.');
      return;
    }
    try {
      await setMPIN(newMpin);
      setMpinMsg('mPIN updated and encrypted server-side.');
      setTimeout(() => {
        handleCloseMpinModal();
      }, 1500);
    } catch (err: any) {
      setMpinError(err.message || 'Failed to update mPIN');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          {user.full_name.charAt(0).toUpperCase()}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-[#1B254B]">{user.full_name}</h1>
            {user.role === 'admin' && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">{user.email} • {user.phone}</p>
        </div>

        <div className="flex gap-2">
          {user.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-2xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}

          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {profileMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{profileMsg}</span>
        </div>
      )}

      {/* Profile Details Form */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
          Personal Information
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled={!editMode}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-[#1B254B] disabled:opacity-80"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                disabled={!editMode}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-[#1B254B] disabled:opacity-80"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                disabled={!editMode}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-[#1B254B] disabled:opacity-80"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                disabled={!editMode}
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-[#1B254B] disabled:opacity-80"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
              Address
            </label>
            <input
              type="text"
              disabled={!editMode}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-[#1B254B] disabled:opacity-80"
            />
          </div>

          {editMode && (
            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
            >
              Save Profile Changes
            </button>
          )}
        </form>
      </div>

      {/* Security & Authentication Settings */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-sm font-extrabold text-[#1B254B] uppercase tracking-wider">
          Security & Credentials
        </h2>

        <div className="space-y-3">
          {/* mPIN Management */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-800">RailOne Secure mPIN</div>
                <div className="text-slate-400 text-[11px]">
                  {user.has_mpin ? 'Encrypted server-side mPIN active' : 'Set your 4-6 digit quick login PIN'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMpinModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-blue-700 hover:bg-blue-50 transition"
            >
              {user.has_mpin ? 'Change mPIN' : 'Set mPIN'}
            </button>
          </div>

          {/* Biometrics / Passkeys */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-800">Biometric / Passkey Login</div>
                <div className="text-slate-400 text-[11px]">
                  {user.biometric_enabled ? 'Fingerprint / Windows Hello enabled' : 'WebAuthn passkey architecture'}
                </div>
              </div>
            </div>

            {user.biometric_enabled ? (
              <button
                onClick={disableBiometrics}
                className="px-3.5 py-1.5 rounded-xl font-bold transition bg-white border border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                Disable Biometric
              </button>
            ) : (
              <button
                onClick={enableBiometrics}
                className="px-3.5 py-1.5 rounded-xl font-bold transition bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Enable Passkey
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Deterministically</span>
        </button>
      </div>

      {/* mPIN MODAL (BUG_007 & BUG_009) */}
      {showMpinModal && (
        <div 
          onClick={handleCloseMpinModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white rounded-3xl p-5 space-y-4 shadow-xl border border-slate-100 cursor-default"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1B254B]">Set Secure mPIN</h3>
              <button
                onClick={handleCloseMpinModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mpinError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{mpinError}</span>
              </div>
            )}

            {mpinMsg ? (
              <div className="py-4 text-center text-emerald-600 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{mpinMsg}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Enter New mPIN (4-6 digits)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newMpin}
                    onChange={(e) => {
                      setNewMpin(e.target.value.replace(/\D/g, ''));
                      setMpinError(null);
                    }}
                    placeholder="Enter 4-6 digit PIN"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono text-xl tracking-widest font-black focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm New mPIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmMpin}
                    onChange={(e) => {
                      setConfirmMpin(e.target.value.replace(/\D/g, ''));
                      setMpinError(null);
                    }}
                    placeholder="Re-enter mPIN"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono text-xl tracking-widest font-black focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSetMpin}
                  className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-sm active:scale-98"
                >
                  Save mPIN
                </button>
                <button
                  onClick={handleCloseMpinModal}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
