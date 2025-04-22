'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface OrganizationLayoutProps {
    children: ReactNode;
}

export default function OrganizationLayout({ children }: OrganizationLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="text-blue-600 font-bold text-xl"
                                tabIndex={0}
                                aria-label="Go to home page"
                            >
                                AppointPro
                            </Link>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link
                                href="/book"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                                tabIndex={0}
                                aria-label="Book an appointment"
                            >
                                Book
                            </Link>
                            <Link
                                href="/services"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                                tabIndex={0}
                                aria-label="View services"
                            >
                                Services
                            </Link>
                            <Link
                                href="/contact"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                                tabIndex={0}
                                aria-label="Contact us"
                            >
                                Contact
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4">AppointPro</h3>
                            <p className="text-gray-300 text-sm">
                                The ultimate appointment management system for sports facilities and activities.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="/"
                                        className="text-gray-300 hover:text-white transition-colors"
                                        tabIndex={0}
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/book"
                                        className="text-gray-300 hover:text-white transition-colors"
                                        tabIndex={0}
                                    >
                                        Book an Appointment
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/services"
                                        className="text-gray-300 hover:text-white transition-colors"
                                        tabIndex={0}
                                    >
                                        Services
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4">Contact</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Have questions or need assistance? Get in touch with us.
                            </p>
                            <Link
                                href="/contact"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                tabIndex={0}
                                aria-label="Contact us for assistance"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                        <p>&copy; {new Date().getFullYear()} AppointPro. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 