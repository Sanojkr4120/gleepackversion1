import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
});

const ResetPassword = () => {
    const { resettoken } = useParams();
    const navigate = useNavigate();

    const handleResetPassword = async (values, { setSubmitting }) => {
        try {
            const { data } = await api.put(`/api/auth/resetpassword/${resettoken}`, { password: values.password });
            toast.success('Password updated successfully');
            navigate('/login');
        } catch (error) {
            toast.error(error.formattedMessage || 'Failed to reset password');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[130vh] ">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">Reset Password</h2>

                <Formik
                    initialValues={{ password: '', confirmPassword: '' }}
                    validationSchema={ResetPasswordSchema}
                    onSubmit={handleResetPassword}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form className="space-y-6">
                            <div>
                                <label className="block text-gray-400 mb-2">New Password</label>
                                <Field
                                    type="password"
                                    name="password"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.password && touched.password ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2">Confirm New Password</label>
                                <Field
                                    type="password"
                                    name="confirmPassword"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-3 rounded-lg transition ${isSubmitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
