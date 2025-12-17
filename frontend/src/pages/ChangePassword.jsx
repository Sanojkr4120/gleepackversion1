import React from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ChangePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current Password is required'),
    newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New Password is required'),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm New Password is required'),
});

const ChangePassword = () => {
    const handleChangePassword = async (values, { setSubmitting, resetForm }) => {
        try {
            await api.put('/api/auth/updatepassword', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            toast.success('Password updated successfully');
            resetForm();
        } catch (error) {
            toast.error(error.formattedMessage || 'Failed to update password');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">Change Password</h2>

                <Formik
                    initialValues={{ currentPassword: '', newPassword: '', confirmNewPassword: '' }}
                    validationSchema={ChangePasswordSchema}
                    onSubmit={handleChangePassword}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form className="space-y-6">
                            <div>
                                <label className="block text-gray-400 mb-2">Current Password</label>
                                <Field
                                    type="password"
                                    name="currentPassword"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.currentPassword && touched.currentPassword ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="currentPassword" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2">New Password</label>
                                <Field
                                    type="password"
                                    name="newPassword"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.newPassword && touched.newPassword ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2">Confirm New Password</label>
                                <Field
                                    type="password"
                                    name="confirmNewPassword"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.confirmNewPassword && touched.confirmNewPassword ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="confirmNewPassword" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-3 rounded-lg transition ${isSubmitting
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </motion.div>
        </div>
    );
};

export default ChangePassword;
