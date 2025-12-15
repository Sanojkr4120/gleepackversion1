import React, { useContext } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { SystemContext } from '../../context/SystemContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const OccasionSchema = Yup.object().shape({
    isOrderingDisabled: Yup.boolean(),
    occasionName: Yup.string().when('isOrderingDisabled', {
        is: true,
        then: (schema) => schema.required('Occasion Name is required when ordering is disabled'),
        otherwise: (schema) => schema.optional(),
    }),
    occasionMessage: Yup.string().when('isOrderingDisabled', {
        is: true,
        then: (schema) => schema.required('Message is required when ordering is disabled'),
        otherwise: (schema) => schema.optional(),
    }),
    startDate: Yup.date()
        .transform((curr, orig) => (orig === '' ? null : curr))
        .nullable()
        .optional(),
    endDate: Yup.date()
        .transform((curr, orig) => (orig === '' ? null : curr))
        .nullable()
        .optional()
});

const HandleOccasions = () => {
    const { settings, fetchSettings } = useContext(SystemContext);

    const initialValues = {
        isOrderingDisabled: settings?.isOrderingDisabled || false,
        occasionName: settings?.occasionName || '',
        occasionMessage: settings?.occasionMessage || '',
        startDate: settings?.startDate ? new Date(settings.startDate).toISOString().split('T')[0] : '',
        endDate: settings?.endDate ? new Date(settings.endDate).toISOString().split('T')[0] : ''
    };

    const handleSave = async (values, { setSubmitting }) => {
        try {
            // Transform empty strings to null for dates to avoid Mongoose CastError
            const payload = {
                ...values,
                startDate: values.startDate === '' ? null : values.startDate,
                endDate: values.endDate === '' ? null : values.endDate
            };

            await api.put('/api/admin/settings', payload);
            toast.success('Settings updated successfully');
            fetchSettings(); // Refresh global settings
        } catch (error) {
            toast.error('Failed to update settings');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-orange-500">Handle Occasions</h2>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg max-w-2xl">
                <Formik
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={OccasionSchema}
                    onSubmit={handleSave}
                >
                    {({ values, isSubmitting, errors, touched, setFieldValue }) => (
                        <Form className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                                <div>
                                    <h3 className="font-bold text-lg text-white">Occasion Mode</h3>
                                    <p className="text-sm text-gray-400">Enable to disable ordering and show a banner.</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={values.isOrderingDisabled}
                                    onClick={() => setFieldValue('isOrderingDisabled', !values.isOrderingDisabled)}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${values.isOrderingDisabled ? 'bg-orange-500' : 'bg-gray-600'
                                        }`}
                                >
                                    <span className="sr-only">Use setting</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${values.isOrderingDisabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {values.isOrderingDisabled && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-gray-400 mb-1">Occasion Name</label>
                                        <Field
                                            type="text"
                                            name="occasionName"
                                            placeholder="e.g., Diwali, Christmas"
                                            className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.occasionName && touched.occasionName ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                        />
                                        <ErrorMessage name="occasionName" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 mb-1">Message for Customers</label>
                                        <Field
                                            as="textarea"
                                            name="occasionMessage"
                                            placeholder="e.g., We are closed for Diwali celebrations. Ordering will resume on..."
                                            rows="3"
                                            className={`w-full bg-gray-700 border rounded p-3 focus:outline-none focus:border-orange-500 ${errors.occasionMessage && touched.occasionMessage ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                        />
                                        <ErrorMessage name="occasionMessage" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-400 mb-1">Start Date (Optional)</label>
                                            <Field
                                                type="date"
                                                name="startDate"
                                                className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-orange-500"
                                            />
                                            <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 mb-1">End Date (Optional)</label>
                                            <Field
                                                type="date"
                                                name="endDate"
                                                className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-orange-500"
                                            />
                                            <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-3 rounded-lg transition ${isSubmitting
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Settings'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default HandleOccasions;
