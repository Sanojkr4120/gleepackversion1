import React from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
});

const ForgotPassword = () => {
    const handleForgotPassword = async (values, { setSubmitting }) => {
        try {
            const { data } = await api.post('/api/auth/forgotpassword', values);
            toast.success(data.data);
        } catch (error) {
            toast.error(error.formattedMessage || 'Failed to send email');
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
                <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">Forgot Password</h2>
                <p className="text-gray-400 mb-6 text-center">Enter your email address and we'll send you a link to reset your password.</p>

                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={ForgotPasswordSchema}
                    onSubmit={handleForgotPassword}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form className="space-y-12 ">
                            <div>
                                <label className="block text-gray-400 mb-2">Email Address</label>
                                <Field
                                    type="email"
                                    name="email"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.email && touched.email ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-3 rounded-lg transition ${isSubmitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </Form>
                    )}
                </Formik>

                <p className="mt-4 text-center text-gray-400">
                    Remembered your password? <Link to="/login" className="text-orange-500 hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
