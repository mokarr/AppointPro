'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    LayoutDashboard,
    Building,
    Users,
    Calendar,
    Settings,
    BarChart,
    CreditCard,
    MapPin
} from 'lucide-react';

export default function DashboardSidebar() {
    const { getTranslation } = useLanguage();

    const navItems = [
        {
            href: '/dashboard',
            icon: LayoutDashboard,
            label: 'dashboard.navigation.dashboard'
        },
        {
            href: '/dashboard/organizations',
            icon: Building,
            label: 'dashboard.navigation.organizations'
        },
        {
            href: '/dashboard/locations',
            icon: MapPin,
            label: 'dashboard.navigation.locations'
        },
        {
            href: '/dashboard/customers',
            icon: Users,
            label: 'dashboard.navigation.customers'
        },
        {
            href: '/dashboard/appointments',
            icon: Calendar,
            label: 'dashboard.navigation.appointments'
        },
        {
            href: '/dashboard/analytics',
            icon: BarChart,
            label: 'dashboard.navigation.analytics'
        },
        {
            href: '/subscription/plans',
            icon: CreditCard,
            label: 'dashboard.navigation.subscription'
        },
        {
            href: '/dashboard/settings',
            icon: Settings,
            label: 'dashboard.navigation.settings'
        }
    ];

    return (
        <div className="p-4">
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {getTranslation(item.label)}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
} 