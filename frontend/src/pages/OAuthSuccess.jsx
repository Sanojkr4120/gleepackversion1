import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { motion } from 'framer-motion';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = useContext(AuthContext);
    const processed = useRef(false);

    useEffect(() => {
        // Prevent double execution in React StrictMode
        if (processed.current) return;

        const token = searchParams.get('token');

        if (token) {
            processed.current = true; // Mark as processed immediately

            const fetchUser = async () => {
                try {
                    // Manually set header since localStorage might not be set yet
                    const { data } = await api.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // Ensure we don't show success message multiple times or update state unnecessarily
                    const userInfo = { ...data, token };
                    updateUser(userInfo);

                    // Show success message only once
                    if (!toast.isActive('google-login-success')) {
                        toast.success('Login Successful', { toastId: 'google-login-success' });
                    }

                    // Redirect based on role
                    if (userInfo.role === 'admin') {
                        navigate('/admin', { replace: true });
                    } else if (userInfo.role === 'employee') {
                        navigate('/employee', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                } catch (error) {
                    console.error(error);
                    if (!toast.isActive('google-login-error')) {
                        toast.error('Google Login Failed', { toastId: 'google-login-error' });
                    }
                    navigate('/login', { replace: true });
                }
            };

            fetchUser();
        } else {
            // Handle case with no token, but respect strict mode
            if (!processed.current) {
                navigate('/login', { replace: true });
            }
        }
    }, [searchParams, navigate, updateUser]);

    return (
        <div className="flex justify-center items-center min-h-[60vh] text-white">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
            >
                <h2 className="text-2xl font-bold text-orange-500 mb-4">Authenticating...</h2>
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </motion.div>
        </div>
    );
};

export default OAuthSuccess;
