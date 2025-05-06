'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Search, Clock, Star, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type TranslationValue = string | string[] | { [key: string]: TranslationValue } | { title: string; description: string }[];


export default function UserLandingPage() {
    const t = useTranslations('user');

    const features = [
        {
            icon: Search,
            title: t('features.feature1.title'),
            description: t('features.feature1.description')
        },
        {
            icon: Clock,
            title: t('features.feature2.title'),
            description: t('features.feature2.description')
        },
        {
            icon: Star,
            title: t('features.feature3.title'),
            description: t('features.feature3.description')
        }
    ];

    // Ensure benefits is always an array with proper type checking
    const benefitsFromTranslation = t('benefits.items');
    const benefits = Array.isArray(benefitsFromTranslation) ? benefitsFromTranslation : [];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 py-2">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            {t('common.banner.business')}
                        </p>
                        <Link href="/landing/company" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            {t('common.banner.businessLink')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center bg-gradient-to-r from-blue-600 to-blue-800">
                <div className="absolute inset-0 bg-black/50" />
                <div className="container mx-auto px-4 z-10">
                    <div className="max-w-3xl text-white">
                        <h1 className="text-5xl font-bold mb-6">
                            {t('hero.title')}
                        </h1>
                        <p className="text-xl mb-4">
                            {t('hero.subtitle')}
                        </p>
                        <p className="text-lg mb-8">
                            {t('hero.description')}
                        </p>
                        <div className="flex gap-4">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                                <Link href="/search/activities">
                                    {t('hero.cta')}
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                                <Link href="#features">
                                    {t('hero.secondaryCta')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        {t('features.title')}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="p-6">
                                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            {t('benefits.title')}
                        </h2>
                        <div className="grid gap-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                                    <div className="flex-shrink-0">
                                        <Check className="w-6 h-6 text-green-500" />
                                    </div>
                                    <p className="text-lg">{benefit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {t('cta.title')}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {t('cta.subtitle')}
                    </p>
                    <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700" asChild>
                        <Link href="/search/activities" className="flex items-center">
                            {t('hero.cta')}
                            <ChevronRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">About Us</h3>
                            <p className="text-gray-400">
                                We connect people with great facilities for any activity or event.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <p className="text-gray-400">
                                Email: support@appointpro.com<br />
                                Phone: +31 (0) 20 123 4567
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                <Link href="#" className="text-gray-400 hover:text-white">Instagram</Link>
                                <Link href="#" className="text-gray-400 hover:text-white">Twitter</Link>
                                <Link href="#" className="text-gray-400 hover:text-white">Facebook</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
} 