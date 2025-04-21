'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Calendar, MapPin, Users, Check } from 'lucide-react';
import Link from 'next/link';

const getString = (value: unknown): string => {
    if (typeof value === 'string') return value;
    return '';
};

interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
}

interface Employee {
    id: string;
    name: string;
    position: string;
    image?: string;
}

interface UserLandingProps {
    organization?: {
        id: string;
        name: string;
        services: Service[];
        employees: Employee[];
    };
}

export const UserLanding = ({ organization }: UserLandingProps = {}) => {
    const { getTranslation } = useLanguage();

    const benefitsData = getTranslation('user.benefits.items');
    const benefits = Array.isArray(benefitsData) ? benefitsData : [];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 py-2">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            {getString(getTranslation('common.banner.business'))}
                        </p>
                        <Link href="/landing/company" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            {getString(getTranslation('common.banner.businessLink'))}
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
                            {organization
                                ? `${getString(getTranslation('user.welcome'))} ${organization.name}`
                                : getString(getTranslation('user.hero.title'))
                            }
                        </h1>
                        <p className="text-xl mb-4">
                            {getString(getTranslation('user.hero.subtitle'))}
                        </p>
                        <p className="text-lg mb-8">
                            {getString(getTranslation('user.hero.description'))}
                        </p>
                        <div className="flex gap-4">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                                <Link href="/search/activities">
                                    {getString(getTranslation('user.hero.cta'))}
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                                <Link href="#features">
                                    {getString(getTranslation('user.hero.secondaryCta'))}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">
                            {getString(getTranslation('user.features.title'))}
                        </h2>
                        <p className="text-gray-600">
                            {getString(getTranslation('user.features.subtitle'))}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="p-6">
                            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {getString(getTranslation('user.features.feature1.title'))}
                            </h3>
                            <p className="text-gray-600">
                                {getString(getTranslation('user.features.feature1.description'))}
                            </p>
                        </Card>
                        <Card className="p-6">
                            <MapPin className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {getString(getTranslation('user.features.feature2.title'))}
                            </h3>
                            <p className="text-gray-600">
                                {getString(getTranslation('user.features.feature2.description'))}
                            </p>
                        </Card>
                        <Card className="p-6">
                            <Users className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {getString(getTranslation('user.features.feature3.title'))}
                            </h3>
                            <p className="text-gray-600">
                                {getString(getTranslation('user.features.feature3.description'))}
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            {getString(getTranslation('user.benefits.title'))}
                        </h2>
                        <div className="grid gap-4">
                            {benefits?.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4">
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

            {/* Testimonials Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        {getString(getTranslation('user.testimonials.title'))}
                    </h2>
                    <div className="max-w-3xl mx-auto">
                        <Card className="p-8">
                            <p className="text-lg italic mb-6">
                                {getString(getTranslation('user.testimonials.testimonial1.quote'))}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200" />
                                <div>
                                    <p className="font-semibold">
                                        {getString(getTranslation('user.testimonials.testimonial1.author'))}
                                    </p>
                                    <p className="text-gray-600">
                                        {getString(getTranslation('user.testimonials.testimonial1.position'))}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {getString(getTranslation('user.cta.title'))}
                    </h2>
                    <p className="text-xl mb-8">
                        {getString(getTranslation('user.cta.subtitle'))}
                    </p>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                        <Link href="/search/activities">
                            {getString(getTranslation('user.hero.cta'))}
                            <ChevronRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}; 