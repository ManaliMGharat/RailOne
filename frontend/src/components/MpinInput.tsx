import React, { useRef, useState, useEffect } from 'react';

interface MpinInputProps {
  length?: number;
  value: string;
  onChange: (pin: string) => void;
  onComplete?: (pin: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  mask?: boolean;
}

export const MpinInput: React.FC<MpinInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  mask = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  useEffect(() => {
    // Focus first empty input on mount
    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Keep only numbers
    const numOnly = val.replace(/\D/g, '');
    if (!numOnly) {
      const newDigits = [...digits];
      newDigits[index] = '';
      const newPin = newDigits.join('').trim();
      onChange(newPin);
      return;
    }

    const lastChar = numOnly.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const newPin = newDigits.join('');
    onChange(newPin);

    // Auto advance to next box
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.length === length && onComplete) {
      onComplete(newPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back to previous box
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
    }

    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full max-w-[340px] mx-auto">
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(digits[index]);
        return (
          <div key={index} className="relative flex-1 aspect-square max-w-[48px] sm:max-w-[52px]">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={digits[index]}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={disabled}
              className={`w-full h-full text-center text-xl font-extrabold rounded-2xl border transition-all select-none focus:outline-hidden
                ${
                  hasError
                    ? 'border-red-500 bg-red-50/50 text-red-600 focus:ring-2 focus:ring-red-400'
                    : isFilled
                    ? 'border-[#0868F7] bg-blue-50/40 text-[#172B63] focus:ring-2 focus:ring-[#0868F7]'
                    : 'border-slate-200 bg-slate-50/80 text-[#172B63] hover:border-slate-300 focus:border-[#0868F7] focus:bg-white focus:ring-2 focus:ring-[#0868F7]/30'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label={`mPIN digit ${index + 1}`}
            />
            {/* Visual Dot Masking if filled */}
            {mask && isFilled && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className={`w-3.5 h-3.5 rounded-full ${hasError ? 'bg-red-500' : 'bg-[#172B63]'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
