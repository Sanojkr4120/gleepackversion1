import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { motion } from 'framer-motion';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            const fetchUser = async () => {
                try {
                    // Manually set header since localStorage might not be set yet
                    const { data } = await api.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const userInfo = { ...data, token };
                    updateUser(userInfo);
                    toast.success('Login Successful');

                    // Redirect based on role
                    if (userInfo.role === 'admin') {
                        navigate('/admin');
                    } else if (userInfo.role === 'employee') {
                        navigate('/employee');
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Google Login Failed');
                    navigate('/login');
                }
            };

            fetchUser();
        } else {
            navigate('/login');
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
