import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminAuthContext = createContext({});

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    if (!storedAdmin || !token) {
      setLoading(false);
      return;
    }

    setAdmin(JSON.parse(storedAdmin));
    fetch(`${import.meta.env.VITE_APP_API_URL}/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Session is no longer valid');
        const currentAdmin = await response.json();
        setAdmin(currentAdmin);
        localStorage.setItem('adminUser', JSON.stringify(currentAdmin));
      })
      .catch(() => {
        setAdmin(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    setAdmin(data.user);
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
