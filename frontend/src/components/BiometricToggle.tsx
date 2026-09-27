import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface BiometricToggleProps {
  enabled: boolean;
  onToggle?: (enabled: boolean) => void;
  onBiometricLogin?: () => void;
}

export const BiometricToggle: React.FC<BiometricToggleProps> = ({
  enabled,
  onToggle,
  onBiometricLogin,
}) => {
  const { t } = useTranslation();
  const { enableBiometrics } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = async () => {
    if (loading) return;
    setErrorMsg(null);

    // Check device support
    if (!window.PublicKeyCredential) {
      setErrorMsg('Biometric authentication is not supported on this browser or device.');
      return;
    }

    setLoading(true);
    try {
      const success = await enableBiometrics();
      if (success && onToggle) {
        onToggle(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to setup biometric login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            onClick={onBiometricLogin}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              enabled 
                ? 'bg-blue-50 text-[#0868F7] hover:bg-blue-100 ring-2 ring-blue-100' 
                : 'bg-slate-50 text-slate-400 hover:text-slate-600'
            }`}
            title="Authenticate with Biometrics / Touch ID / Face ID"
          >
            <Fingerprint className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#172B63] leading-tight">
              {t('enableBiometric')}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">
              {enabled ? 'Active on this device' : 'Quick touch or face login'}
            </span>
          </div>
        </div>

        {/* Apple/Android Style Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            enabled ? 'bg-[#0868F7]' : 'bg-slate-200'
          } ${loading ? 'opacity-60 cursor-wait' : ''}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="text-xs text-slate-400 font-medium leading-relaxed">
        {t('biometricNotice')}
      </p>

      {errorMsg && (
        <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
