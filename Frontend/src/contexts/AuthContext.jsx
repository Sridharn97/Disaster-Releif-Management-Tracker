import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { TOKEN_KEY, SESSION_KEY } from '@/lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return;
        }
        api.get('/auth/profile')
            .then((response) => {
            const profile = response.data.data;
            setUser(profile);
            localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        })
            .catch(() => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(SESSION_KEY);
            setUser(null);
        })
            .finally(() => setLoading(false));
    }, []);
    const persistSession = (token, userData) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        setUser(userData);
    };
    const login = async (email, password, role) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (role && response.data.user?.role !== role) {
                return {
                    success: false,
                    message: `This account is registered as ${response.data.user?.role || 'a different role'}`,
                };
            }
            persistSession(response.data.token, response.data.user);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid credentials',
            };
        }
    };
    const signup = async (name, email, password, role) => {
        try {
            const response = await api.post('/auth/signup', { name, email, password, role });
            persistSession(response.data.token, response.data.user);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Unable to create account',
            };
        }
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_KEY);
    };
    const updateUserSession = (userData) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        setUser(userData);
    };
    return (<AuthContext.Provider value={{ user, login, signup, logout, updateUserSession, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
