import { createContext, useCallback, useContext, useEffect, useState, type FC, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface ReceivedInvite {
  id: string;
  fromName: string;
  fromEmail: string;
  createdAt: string;
}

export interface SentInvite {
  id: string;
  toEmail: string;
  createdAt: string;
}

interface AuthContextValue {
  status: 'loading' | 'authed' | 'guest';
  user: AuthUser | null;
  partner: AuthUser | null;
  receivedInvites: ReceivedInvite[];
  sentInvites: SentInvite[];
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  sendInvite: (email: string) => Promise<boolean>;
  acceptInvite: (id: string) => Promise<boolean>;
  declineInvite: (id: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function api<T>(url: string, options?: RequestInit): Promise<{ ok: boolean; data: T & { error?: string } }> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  return { ok: res.ok, data };
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<'loading' | 'authed' | 'guest'>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [partner, setPartner] = useState<AuthUser | null>(null);
  const [receivedInvites, setReceivedInvites] = useState<ReceivedInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await api<{
      user: AuthUser | null;
      partner: AuthUser | null;
      receivedInvites: ReceivedInvite[];
      sentInvites: SentInvite[];
    }>('/api/auth/me');

    if (data.user) {
      setUser(data.user);
      setPartner(data.partner ?? null);
      setReceivedInvites(data.receivedInvites ?? []);
      setSentInvites(data.sentInvites ?? []);
      setStatus('authed');
    } else {
      setUser(null);
      setPartner(null);
      setReceivedInvites([]);
      setSentInvites([]);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { ok, data } = await api<{ error?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!ok) { setError(data.error ?? 'Não foi possível entrar.'); return false; }
    await refresh();
    return true;
  }, [refresh]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    const { ok, data } = await api<{ error?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (!ok) { setError(data.error ?? 'Não foi possível criar a conta.'); return false; }
    await refresh();
    return true;
  }, [refresh]);

  const logout = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' });
    await refresh();
  }, [refresh]);

  const sendInvite = useCallback(async (email: string) => {
    setError(null);
    const { ok, data } = await api<{ error?: string }>('/api/invites/send', {
      method: 'POST',
      body: JSON.stringify({ toEmail: email }),
    });
    if (!ok) { setError(data.error ?? 'Não foi possível enviar o convite.'); return false; }
    await refresh();
    return true;
  }, [refresh]);

  const acceptInvite = useCallback(async (id: string) => {
    setError(null);
    const { ok, data } = await api<{ error?: string }>('/api/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ inviteId: id }),
    });
    if (!ok) { setError(data.error ?? 'Não foi possível aceitar o convite.'); return false; }
    await refresh();
    return true;
  }, [refresh]);

  const declineInvite = useCallback(async (id: string) => {
    const { ok, data } = await api<{ error?: string }>('/api/invites/decline', {
      method: 'POST',
      body: JSON.stringify({ inviteId: id }),
    });
    if (!ok) { setError(data.error ?? 'Não foi possível recusar o convite.'); return false; }
    await refresh();
    return true;
  }, [refresh]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ status, user, partner, receivedInvites, sentInvites, error, login, register, logout, sendInvite, acceptInvite, declineInvite, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
