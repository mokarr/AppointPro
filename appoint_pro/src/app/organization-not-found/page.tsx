'use client';

import Link from 'next/link';

export default function OrganizationNotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    <svg
                        className="mx-auto h-16 w-16 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h1>

                <p className="text-gray-600 mb-8">
                    We couldn't find the organization you're looking for. The organization may not exist or doesn't have an active subscription.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        tabIndex={0}
                        aria-label="Return to home page"
                    >
                        Go to Home
                    </Link>

                    <Link
                        href="/landing/company"
                        className="block w-full px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-md font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        tabIndex={0}
                        aria-label="Browse all companies"
                    >
                        Browse Organizations
                    </Link>
                </div>
            </div>
        </div>
    );
} 