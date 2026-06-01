import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';

const BACKEND_URL = 'http://192.168.18.23:5000/api/auth';
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('userToken');
      const storedUser = await SecureStore.getItemAsync('userData');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  const syncBackend = useCallback(async (data) => {
    setUser(data.user);
    setToken(data.token);
    await SecureStore.setItemAsync('userToken', data.token);
    await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await syncBackend(data);
  }, [syncBackend]);

  const register = useCallback(async (name, email, password) => {
    const res = await fetch(`${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await syncBackend(data);
  }, [syncBackend]);

  const syncSso = useCallback(async (id, email, name, avatar) => {
    const res = await fetch(`${BACKEND_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, name, avatar })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await syncBackend(data);
  }, [syncBackend]);

  // Fetch fresh user profile from backend (used by Profile screen)
  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          // Token expired – force logout
          await signOut();
          return null;
        }
        throw new Error('Failed to fetch profile');
      }
      const freshUser = await res.json();
      setUser(freshUser);
      await SecureStore.setItemAsync('userData', JSON.stringify(freshUser));
      return freshUser;
    } catch (e) {
      console.log('Failed to refresh user', e);
      return null;
    }
  }, [token]);

  // Update user profile on backend + sync locally
  const updateUser = useCallback(async (updates) => {
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${BACKEND_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    setUser(data);
    await SecureStore.setItemAsync('userData', JSON.stringify(data));
    return data;
  }, [token]);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(() => ({
    user, token, loading, login, register, syncSso, signOut, refreshUser, updateUser
  }), [user, token, loading, login, register, syncSso, signOut, refreshUser, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
