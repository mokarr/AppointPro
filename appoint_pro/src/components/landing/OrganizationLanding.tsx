'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, MapPin, Calendar, Users, Check } from 'lucide-react';
import Link from 'next/link';

interface Location {
    id: string;
    name: string;
    address?: string;
    postalCode?: string | null;
    country?: string | null;
}

interface Organization {
    id: string;
    name: string;
    branche: string;
    description: string;
    locations: Location[];
}

interface OrganizationLandingProps {
    organization: Organization;
}

const getString = (value: any): string => {
    if (typeof value === 'string') return value;
    return '';
};

export default function OrganizationLanding({ organization }: OrganizationLandingProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center bg-gradient-to-r from-blue-600 to-blue-800">
                <div className="absolute inset-0 bg-black/50" />
                <div className="container mx-auto px-4 z-10">
                    <div className="max-w-3xl text-white">
                        <h1 className="text-5xl font-bold mb-6">
                            {organization.name}
                        </h1>
                        <p className="text-xl mb-4">
                            {organization.branche}
                        </p>
                        <p className="text-lg mb-8">
                            {organization.description}
                        </p>
                        <div className="flex gap-4">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                <Link href={`/${organization.name}/book`}>
                                    {getString(t('organization.book'))}
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                                <Link href="#locations">
                                    {getString(t('organization.viewLocations'))}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Locations Section */}
            <section id="locations" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        {getString(t('organization.ourLocations'))}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {organization.locations.map((location) => (
                            <Card key={location.id} className="p-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
                                        <p className="text-gray-600">{location.address}</p>
                                        {location.postalCode && (
                                            <p className="text-gray-600">
                                                {location.postalCode}, {location.country || 'N/A'}
                                            </p>
                                        )}
                                        <Button className="mt-4" asChild>
                                            <Link href={`/${organization.name}/book?location=${location.id}`}>
                                                {getString(t('organization.bookAtLocation'))}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        {getString(t('organization.whyChooseUs'))}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="p-6">
                            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {getString(t('organization.features.booking'))}
                            </h3>
                            <p className="text-gray-600">
                                {getString(t('organization.features.bookingDesc'))}
                            </p>
                        </Card>
                        <Card className="p-6">
                            <MapPin className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {getString(t('organization.features.locations'))}
                            </h3>
                            <p className="text-gray-600">
                                {getString(t('organization.features.locationsDesc'))}
                            </p>
                        </Card>
                        <Card className="p-6">
                            <Users className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {getString(t('organization.features.team'))}
                            </h3>
                            <p className="text-gray-600">
                                {getString(t('organization.features.teamDesc'))}
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {getString(t('organization.ready'))}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {getString(t('organization.readyDesc'))}
                    </p>
                    <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700" asChild>
                        <Link href={`/${organization.name}/book`}>
                            {getString(t('organization.bookNow'))}
                            <ChevronRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
} 