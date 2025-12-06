import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';

export const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        isOrderingDisabled: false,
        occasionName: '',
        occasionMessage: '',
        startDate: null,
        endDate: null
    });
    const [socket, setSocket] = useState(null);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/api/admin/settings');
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch system settings:", error);
        }
    };

    useEffect(() => {
        fetchSettings();

        // Initialize Socket.IO with error handling for Vercel
        let newSocket = null;
        try {
            newSocket = io(import.meta.env.VITE_API_URL, {
                transports: ['polling'], // Only use polling for Vercel compatibility
                reconnectionAttempts: 3,
                reconnectionDelay: 1000,
                timeout: 10000,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('connect_error', (error) => {
                console.warn('Socket connection failed (this is normal on Vercel):', error.message);
            });

            newSocket.on('settingsUpdated', (updatedSettings) => {
                setSettings(updatedSettings);
            });

            setSocket(newSocket);
        } catch (error) {
            console.warn('Socket.IO initialization failed:', error);
        }

        return () => {
            if (newSocket) {
                newSocket.off('settingsUpdated');
                newSocket.off('connect');
                newSocket.off('connect_error');
                newSocket.close();
            }
        };
    }, []);

    return (
        <SystemContext.Provider value={{ settings, fetchSettings, socket }}>
            {children}
        </SystemContext.Provider>
    );
};
