'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Session } from 'next-auth';

interface HomeContentProps {
    session: Session | null;
}

export default function HomeContent({ session }: HomeContentProps) {
    const { t } = useLanguage();

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = t(key);
        return typeof value === 'string' ? value : '';
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                                {getString('home.heroTitle')}
                                <br />
                                <span className="text-blue-600">{getString('home.heroSubtitle')}</span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                {getString('home.heroDescription')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Button asChild size="lg" className="text-lg">
                                    <Link href="/sign-up">{getString('common.getStarted')}</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="text-lg">
                                    <Link href="#features">{getString('common.learnMore')}</Link>
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
                        {getString('home.featuresTitle')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {getString('home.feature1Title')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {getString('home.feature1Description')}
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {getString('home.feature2Title')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {getString('home.feature2Description')}
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {getString('home.feature3Title')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {getString('home.feature3Description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {getString('common.pricingPlans')}
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                        {getString('common.choosePlan')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getString('pricing.basic.title')}</h3>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                                    {getString('pricing.basic.price')}
                                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/{getString('common.month')}</span>
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    {Array.isArray(t('pricing.basic.features')) &&
                                        (t('pricing.basic.features') as string[]).map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                </ul>
                                <Button className="w-full mt-6" asChild>
                                    <Link href="/subscription/plans">{getString('common.subscribe')}</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">{getString('common.popular')}</div>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getString('pricing.pro.title')}</h3>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                                    {getString('pricing.pro.price')}
                                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/{getString('common.month')}</span>
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    {Array.isArray(t('pricing.pro.features')) &&
                                        (t('pricing.pro.features') as string[]).map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                </ul>
                                <Button className="w-full mt-6" asChild>
                                    <Link href="/subscription/plans">{getString('common.subscribe')}</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getString('pricing.enterprise.title')}</h3>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                                    {getString('pricing.enterprise.price')}
                                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/{getString('common.month')}</span>
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    {Array.isArray(t('pricing.enterprise.features')) &&
                                        (t('pricing.enterprise.features') as string[]).map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="h-5 w-5 text-green-500 shrink-0 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                </ul>
                                <Button className="w-full mt-6" asChild>
                                    <Link href="/subscription/plans">{getString('common.subscribe')}</Link>
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
                            <h4 className="text-white font-semibold mb-4">{getString('common.appName')}</h4>
                            <p className="text-sm">
                                {getString('footer.description')}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">{getString('common.product')}</h4>
                            <ul className="space-y-2">
                                <li><Link href="#features" className="hover:text-white transition-colors">{getString('footer.features')}</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">{getString('footer.pricing')}</Link></li>
                                <li><Link href="/sign-up" className="hover:text-white transition-colors">{getString('common.signUp')}</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
} 