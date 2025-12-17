import React, { createContext, useState, useEffect } from 'react';

import api from '../utils/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                // Optimistically set user to avoid flash of login screen
                setUser(userInfo);

                try {
                    // Verify with backend and get fresh data (including role updates)
                    const { data } = await api.get('/api/auth/me');

                    // If the token in the response is different (e.g. refreshed), update it
                    // Note: /me usually returns user data. We keep the existing token unless the backend sends a new one.
                    // But our backend /me just returns user data, not a new token.
                    // So we merge the fresh user data with the existing token.
                    const updatedUser = { ...data, token: userInfo.token };

                    setUser(updatedUser);
                    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                } catch (error) {
                    console.error("Session validation failed", error);
                    // If 401 Unauthorized, the token is invalid/expired
                    if (error.response && error.response.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Login Successful');
            return data;
        } catch (error) {
            toast.error(error.formattedMessage || 'Login Failed');
            return null;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/api/auth/register', userData);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Registration Successful');
            return true;
        } catch (error) {
            toast.error(error.formattedMessage || 'Registration Failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        toast.info('Logged out');
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
