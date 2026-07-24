'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const AuthContext = createContext({ user: null, activeMembership: null, activeMemberships: [], loading: true, refresh: () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeMemberships, setActiveMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveMemberships(data.active_memberships || []);
      } else {
        setUser(null);
        setActiveMemberships([]);
      }
    } catch { setUser(null); setActiveMemberships([]); }
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setActiveMemberships([]);
    if (typeof window !== 'undefined') window.location.href = '/';
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // activeMembership kept for backward compat — first active membership
  const activeMembership = activeMemberships[0] || null;

  return <AuthContext.Provider value={{ user, activeMembership, activeMemberships, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
