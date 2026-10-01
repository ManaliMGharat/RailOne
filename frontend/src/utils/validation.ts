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
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Mobile number is required.' };
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    return { valid: false, error: 'Enter a valid 10-digit mobile number starting with 6–9.' };
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

/**
 * Validates passenger full name
 */
export function validateFullName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { valid: false, error: 'Full name can only contain letters and standard punctuation.' };
  }
  return { valid: true };
}

/**
 * Validates account password
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
}

/**
 * Validates confirm password against password
 */
export function validateConfirmPassword(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true };
}

