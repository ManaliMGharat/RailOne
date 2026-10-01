import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithMpin: (username: string, mpin: string) => Promise<void>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setMPIN: (pin: string) => Promise<void>;
  verifyMPIN: (pin: string) => Promise<boolean>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('railone_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('railone_token');
    if (!savedToken) return null;
    try {
      const saved = localStorage.getItem('railone_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('railone_token');
    if (!currentToken) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('railone_user');
      setLoading(false);
      return;
    }
    try {
      const userData = await apiClient<User>('/auth/me');
      setUser(userData);
      localStorage.setItem('railone_user', JSON.stringify(userData));
    } catch (err: any) {
      // If 401, client.ts automatically triggers logout
      if (err.status === 401) {
        logout();
      } else {
        const saved = localStorage.getItem('railone_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen for unauthorized events from API client
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('railone_token');
      localStorage.removeItem('railone_user');
      localStorage.removeItem('railone_remembered_user');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('railone_token', data.access_token);
    localStorage.setItem('railone_user', JSON.stringify(data.user));
    localStorage.setItem('railone_remembered_user', JSON.stringify({
      email: data.user.email,
      phone: data.user.phone,
      full_name: data.user.full_name
    }));
  };

  const loginWithMpin = async (username: string, mpin: string) => {
    const data = await apiClient<AuthResponse>('/auth/mpin/login', {
      method: 'POST',
      body: JSON.stringify({ username, mpin }),
    });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('railone_token', data.access_token);
    localStorage.setItem('railone_user', JSON.stringify(data.user));
    localStorage.setItem('railone_remembered_user', JSON.stringify({
      email: data.user.email,
      phone: data.user.phone,
      full_name: data.user.full_name
    }));
  };

  const register = async (fullName: string, email: string, phone: string, password: string) => {
    const data = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, phone, password }),
    });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('railone_token', data.access_token);
    localStorage.setItem('railone_user', JSON.stringify(data.user));
    localStorage.setItem('railone_remembered_user', JSON.stringify({
      email: data.user.email,
      phone: data.user.phone,
      full_name: data.user.full_name
    }));
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    const data = await apiClient<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('railone_token', data.access_token);
    localStorage.setItem('railone_user', JSON.stringify(data.user));
    localStorage.setItem('railone_remembered_user', JSON.stringify({
      email: data.user.email,
      phone: data.user.phone,
      full_name: data.user.full_name
    }));
  };

  const logout = () => {
    try {
      if (token) {
        apiClient('/auth/logout', { method: 'POST' }).catch(() => {});
      }
    } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('railone_token');
    localStorage.removeItem('railone_user');
    localStorage.removeItem('railone_remembered_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await apiClient<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setUser(updated);
    localStorage.setItem('railone_user', JSON.stringify(updated));
  };

  const setMPIN = async (pin: string) => {
    await apiClient('/auth/mpin/set', {
      method: 'POST',
      body: JSON.stringify({ mpin: pin }),
    });
    if (user) {
      const u = { ...user, has_mpin: true };
      setUser(u);
      localStorage.setItem('railone_user', JSON.stringify(u));
    }
  };

  const verifyMPIN = async (pin: string): Promise<boolean> => {
    try {
      await apiClient('/auth/mpin/verify', {
        method: 'POST',
        body: JSON.stringify({ mpin: pin }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const enableBiometrics = async (): Promise<boolean> => {
    try {
      // Check if browser actually supports WebAuthn passkeys
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric passkeys are not supported by this browser/device.');
      }
      const challengeRes = await apiClient<{ challenge: string; user_id: number }>('/auth/biometric/challenge', {
        method: 'POST',
      });
      // In WebAuthn architecture, register credential ID
      const credId = `webauthn-cred-${Date.now()}-${challengeRes.user_id}`;
      await apiClient('/auth/biometric/register', {
        method: 'POST',
        body: JSON.stringify({
          credential_id: credId,
          challenge: challengeRes.challenge,
        }),
      });
      if (user) {
        const u = { ...user, biometric_enabled: true };
        setUser(u);
        localStorage.setItem('railone_user', JSON.stringify(u));
      }
      return true;
    } catch (err: any) {
      alert(err.message || 'Biometric authentication setup failed');
      return false;
    }
  };

  const disableBiometrics = async (): Promise<boolean> => {
    try {
      await apiClient('/auth/biometric/disable', {
        method: 'POST',
      });
      if (user) {
        const u = { ...user, biometric_enabled: false };
        setUser(u);
        localStorage.setItem('railone_user', JSON.stringify(u));
      }
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to disable biometric authentication');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithMpin,
        register,
        loginWithOtp,
        logout,
        updateProfile,
        setMPIN,
        verifyMPIN,
        enableBiometrics,
        disableBiometrics,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
