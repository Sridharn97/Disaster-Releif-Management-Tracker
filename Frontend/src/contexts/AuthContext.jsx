import React, { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);
const USERS_KEY = 'drrt_users';
const SESSION_KEY = 'drrt_session';
const defaultUsers = [
    { id: '1', name: 'Admin User', email: 'admin@relief.org', password: 'admin123', role: 'admin', phone: '+1234567890' },
    { id: '2', name: 'John Volunteer', email: 'volunteer@relief.org', password: 'vol123', role: 'volunteer', phone: '+1234567891' },
    { id: '3', name: 'Sarah Coordinator', email: 'coord@relief.org', password: 'coord123', role: 'coordinator', phone: '+1234567892' },
];
function getStoredUsers() {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored)
        return JSON.parse(stored);
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            setUser(JSON.parse(session));
        }
    }, []);
    const login = (email, password) => {
        const users = getStoredUsers();
        const found = users.find((u) => u.email === email && u.password === password);
        if (found) {
            const { password: _, ...userData } = found;
            setUser(userData);
            localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
            return true;
        }
        return false;
    };
    const signup = (name, email, password, role) => {
        const users = getStoredUsers();
        if (users.find((u) => u.email === email))
            return false;
        const newUser = { id: crypto.randomUUID(), name, email, password, role, phone: '' };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        const { password: _, ...userData } = newUser;
        setUser(userData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return true;
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
    };
    return (<AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
