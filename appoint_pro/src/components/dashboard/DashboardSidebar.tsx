'use client';

import Link from 'next/link';

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
import { useTranslations } from 'next-intl';

export default function DashboardSidebar() {
    const t = useTranslations('dashboard');

    const navItems = [
        {
            href: '/dashboard',
            icon: LayoutDashboard,
            label: 'navigation.dashboard'
        },
        {
            href: '/dashboard/organizations',
            icon: Building,
            label: 'navigation.organizations'
        },
        {
            href: '/dashboard/locations',
            icon: MapPin,
            label: 'navigation.locations'
        },
        {
            href: '/dashboard/customers',
            icon: Users,
            label: 'navigation.customers'
        },
        {
            href: '/dashboard/appointments',
            icon: Calendar,
            label: 'navigation.appointments'
        },
        {
            href: '/dashboard/analytics',
            icon: BarChart,
            label: 'navigation.analytics'
        },
        {
            href: '/subscription/plans',
            icon: CreditCard,
            label: 'navigation.subscription'
        },
        {
            href: '/dashboard/settings',
            icon: Settings,
            label: 'navigation.settings'
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
                                {t(item.label)}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
} 