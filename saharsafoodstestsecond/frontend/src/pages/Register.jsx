import React, { useContext } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
        .required('Phone number is required'),
    address: Yup.string()
        .min(5, 'Address must be at least 5 characters')
        .required('Address is required'),
});

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (values, { setSubmitting }) => {
        const success = await register(values);
        if (success) {
            navigate('/');
        }
        setSubmitting(false);
    };

    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">Create Account</h2>

                <Formik
                    initialValues={{
                        name: '',
                        email: '',
                        password: '',
                        phone: '',
                        address: ''
                    }}
                    validationSchema={RegisterSchema}
                    onSubmit={handleRegister}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form className="space-y-4">
                            <div>
                                <label className="block text-gray-400 mb-1">Full Name</label>
                                <Field
                                    type="text"
                                    name="name"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.name && touched.name ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-1">Email Address</label>
                                <Field
                                    type="email"
                                    name="email"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.email && touched.email ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-1">Password</label>
                                <Field
                                    type="password"
                                    name="password"
                                    className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.password && touched.password ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 mb-1">Phone</label>
                                    <Field
                                        type="tel"
                                        name="phone"
                                        className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.phone && touched.phone ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                    />
                                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1">Address</label>
                                    <Field
                                        type="text"
                                        name="address"
                                        className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.address && touched.address ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                    />
                                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-3 rounded-lg transition mt-4 ${isSubmitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Register'}
                            </button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`}
                                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-100 transition"
                            >
                                <FcGoogle size={24} />
                                <span>Signup with Google</span>
                            </button>
                        </Form>
                    )}
                </Formik>

                <p className="mt-4 text-center text-gray-400">
                    Already have an account? <Link to="/login" className="text-orange-500 hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
