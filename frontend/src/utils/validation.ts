/**
 * RailOne Form & Input Validation Utilities
 */

/**
 * Validates that source and destination station codes are not identical
 */
export function validateRouteStations(sourceCode: string, destCode: string): { valid: boolean; error?: string } {
  if (!sourceCode || !destCode) {
    return { valid: false, error: 'Both source and destination stations must be selected.' };
  }
  if (sourceCode.trim().toUpperCase() === destCode.trim().toUpperCase()) {
    return { valid: false, error: 'Source and destination stations cannot be the same.' };
  }
  return { valid: true };
}

/**
 * Validates a 10-digit Indian Railway PNR Number
 */
export function validatePNR(pnr: string): { valid: boolean; error?: string } {
  const cleaned = pnr.trim();
  if (!cleaned) {
    return { valid: false, error: 'Please enter a 10-digit PNR number.' };
  }
  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, error: 'PNR must contain exactly 10 digits.' };
  }
  return { valid: true };
}

/**
 * Validates a 4 or 6 digit mPIN
 */
export function validateMPIN(mpin: string): { valid: boolean; error?: string } {
  const cleaned = mpin.trim();
  if (!cleaned) {
    return { valid: false, error: 'Please enter your mPIN.' };
  }
  if (!/^\d{4,6}$/.test(cleaned)) {
    return { valid: false, error: 'mPIN must be between 4 and 6 numerical digits.' };
  }
  return { valid: true };
}

/**
 * Validates 10-digit Indian mobile number
 */
export function validateMobileNumber(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  const digits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }
  return { valid: true };
}

/**
 * Validates standard email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}
