import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(fullName.trim(), email.trim().toLowerCase(), phone.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-[#1B254B]">Create RailOne Account</h1>
        <p className="text-xs text-slate-400">Join India's unified railway travel companion.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Manali Manish Gharat"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#1B254B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. manali@railone.in"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#1B254B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#1B254B]"
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
                placeholder="Minimum 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-sm text-[#1B254B]"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl text-blue-900 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Includes ₹1,500 complimentary RailOne Wallet travel balance upon registration.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{loading ? 'Creating Account...' : 'Register Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
