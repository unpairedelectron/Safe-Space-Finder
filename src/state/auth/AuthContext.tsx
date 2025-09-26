import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as loginApi, register as registerApi, logoutApi, AuthResponse, AuthUser } from '@/services/api/authApi';
import { refreshTokens } from '@/services/api/authApi';
import { setAuthFailureHandler } from '@/services/api/httpClient';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isInitializing: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';
const EXPIRES_KEY = 'expiresAt';

async function secureSet(key: string, value: string) { try { await SecureStore.setItemAsync(key, value); } catch {} }
async function secureGet(key: string) { try { return await SecureStore.getItemAsync(key); } catch { return null; } }
async function secureDel(key: string) { try { await SecureStore.deleteItemAsync(key); } catch {} }

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  const clearRefreshTimer = () => { if (refreshTimer) { clearTimeout(refreshTimer); setRefreshTimer(null); } };

  const logout = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    await logoutApi();
    await Promise.all([
      secureDel(ACCESS_KEY),
      secureDel(REFRESH_KEY),
      secureDel(USER_KEY),
      secureDel(EXPIRES_KEY),
    ]);
    clearRefreshTimer();
  }, [refreshTimer]);

  const scheduleExpiryHandling = useCallback(async () => {
    clearRefreshTimer();
    const expiresAtStr = await secureGet(EXPIRES_KEY);
    if (!expiresAtStr) return;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Number.isNaN(expiresAt)) return;
    const now = Date.now();
    const msUntil = expiresAt - now - 60000; // refresh 1 min early
    const run = async () => {
      try {
        const refreshToken = await secureGet(REFRESH_KEY);
        if (!refreshToken) { await logout(); return; }
        const resp = await refreshTokens(refreshToken);
        const newAccess = resp.accessToken;
        if (newAccess) await secureSet(ACCESS_KEY, newAccess);
        if (resp.refreshToken) await secureSet(REFRESH_KEY, resp.refreshToken);
        if (resp.expiresIn) {
          const newExpires = Date.now() + resp.expiresIn * 1000;
            await secureSet(EXPIRES_KEY, String(newExpires));
        }
        setAccessToken(newAccess);
        await scheduleExpiryHandling();
      } catch {
        await logout();
      }
    };
    if (msUntil <= 0) {
      await run();
    } else {
      const t = setTimeout(run, msUntil);
      setRefreshTimer(t);
    }
  }, [logout, refreshTimer]);

  const applyAuth = async (resp: AuthResponse) => {
    setUser(resp.user);
    setAccessToken(resp.tokens.accessToken);
    await secureSet(ACCESS_KEY, resp.tokens.accessToken);
    await secureSet(REFRESH_KEY, resp.tokens.refreshToken);
    const expiresAt = Date.now() + resp.tokens.expiresIn * 1000;
    await secureSet(EXPIRES_KEY, String(expiresAt));
    await secureSet(USER_KEY, JSON.stringify(resp.user));
    await scheduleExpiryHandling();
  };

  const login = useCallback(async (email: string, password: string) => {
    const resp = await loginApi(email, password);
    await applyAuth(resp);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const resp = await registerApi(name, email, password);
    await applyAuth(resp);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          secureGet(ACCESS_KEY),
          secureGet(USER_KEY),
        ]);
        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          try { setUser(JSON.parse(storedUser)); } catch {}
          await scheduleExpiryHandling();
        }
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  useEffect(() => {
    setAuthFailureHandler(async () => {
      await logout();
    });
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isInitializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
