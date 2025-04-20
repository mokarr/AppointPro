import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function HomePage() {
    const session = await auth();

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">AppointPro</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {session ? (
                                <Button asChild>
                                    <Link href="/dashboard">Go to Dashboard</Link>
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button asChild variant="outline">
                                        <Link href="/sign-in">Sign In</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/sign-up">Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                                Efficient Appointment Scheduling
                                <br />
                                <span className="text-blue-600">For Every Professional</span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                Simplify your appointment management with our intuitive and professional scheduling tool.
                                Save time and increase customer satisfaction.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button asChild size="lg" className="text-lg">
                                    <Link href="/sign-up">Get Started</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="text-lg">
                                    <Link href="#features">Learn More</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                            <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
                                <div className="text-blue-500 text-xl">Calendar Image</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Why Choose AppointPro?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Easy Scheduling
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Schedule appointments effortlessly with our intuitive system.
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Customer Management
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Keep all your customer information organized in one place.
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Automatic Reminders
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Reduce no-shows with automatic reminders.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section with subscription plans */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        Pricing Plans
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                        Choose the perfect plan for your business needs. All plans include access to our core scheduling features.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic</h3>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">€19.99<span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span></p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Up to 2 employees</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Basic appointment scheduling</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Email notifications</span>
                                    </li>
                                </ul>
                                <Button className="w-full mt-6" asChild>
                                    <Link href="/subscription/plans">Subscribe</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-lg shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pro</h3>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">€49.99<span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span></p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Up to 10 employees</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Advanced appointment scheduling</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">SMS notifications</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Custom branding</span>
                                    </li>
                                </ul>
                                <Button className="w-full mt-6" asChild>
                                    <Link href="/subscription/plans">Subscribe</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enterprise</h3>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">€99.99<span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span></p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Unlimited employees</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Advanced analytics</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Priority support</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700 dark:text-gray-300">Custom integrations</span>
                                    </li>
                                </ul>
                                <Button className="w-full mt-6" asChild>
                                    <Link href="/subscription/plans">Subscribe</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-white font-semibold mb-4">AppointPro</h4>
                            <p className="text-sm">
                                The ultimate solution for efficient appointment scheduling and customer management.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">Sign Up</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Cookies</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p>&copy; {new Date().getFullYear()} AppointPro. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 