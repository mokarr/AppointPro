'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrganizationBySubdomain } from '@/services/organization';

export default function OrganizationContactPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [organizationName, setOrganizationName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            try {
                setLoading(true);

                // Fetch organization data
                const result = await getOrganizationBySubdomain(subdomain);

                // Extract organization name
                if (result) {
                    if (typeof result === 'object' && 'data' in result && result.data && typeof result.data === 'object' && 'name' in result.data) {
                        setOrganizationName(String(result.data.name));
                    } else if (typeof result === 'object' && 'name' in result) {
                        setOrganizationName(String(result.name));
                    } else {
                        setOrganizationName('Our Organization');
                    }
                } else {
                    setOrganizationName('Our Organization');
                }

                setError(null);
            } catch (err) {
                setError('Failed to load organization data');
            } finally {
                setLoading(false);
            }
        };

        if (subdomain) {
            fetchOrganizationData();
        }
    }, [subdomain]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real application, you would submit the form data to an API
        // For now, just simulate a successful submission
        setFormSubmitted(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-4 text-center text-gray-700">Loading contact information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    if (formSubmitted) {
        return (
            <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Thank You!</h2>
                        <p className="mt-2 text-gray-600">
                            Your message has been submitted. We'll get back to you as soon as possible.
                        </p>
                        <button
                            onClick={() => setFormSubmitted(false)}
                            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            tabIndex={0}
                        >
                            Send Another Message
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
                    <p className="text-lg text-gray-600">
                        Get in touch with {organizationName}. We'd love to hear from you!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        tabIndex={0}
                                        aria-label="Your name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        tabIndex={0}
                                        aria-label="Your email address"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        tabIndex={0}
                                        aria-label="Message subject"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        tabIndex={0}
                                        aria-label="Your message"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    tabIndex={0}
                                    aria-label="Send message"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Phone</p>
                                    <p className="text-sm text-gray-600">+31 123 456 789</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-600">info@{subdomain}.example.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Address</p>
                                    <p className="text-sm text-gray-600">
                                        123 Sport Street<br />
                                        1234 AB Amsterdam<br />
                                        The Netherlands
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">Opening Hours</p>
                                    <p className="text-sm text-gray-600">
                                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                                        Saturday: 10:00 AM - 4:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 