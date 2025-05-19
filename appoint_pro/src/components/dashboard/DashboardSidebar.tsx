'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Building,
    Users,
    Calendar,
    Settings,
    BarChart,
    CreditCard,
    MapPin,
    ChevronDown,
    ChevronUp,
    Dumbbell,
    School
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DashboardSidebar() {
    const t = useTranslations('dashboard');
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        setIsMobile(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

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
            href: '/dashboard/facilities',
            icon: Dumbbell,
            label: 'navigation.facilities'
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
            href: '/dashboard/classes',
            icon: School,
            label: 'navigation.classes'
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

    const currentItem = navItems.find(item => pathname.startsWith(item.href));
    const filteredNavItems = navItems.filter(item => !item.href.startsWith(pathname));

    return (
        <div className="p-2 md:p-4 flex items-center md:items-start justify-center md:justify-start">
            <div className="w-full max-w-xs">
                {/* Mobile Collapsible Header */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-md hover:bg-accent transition-colors mb-2"
                    >
                        {currentItem && (
                            <>
                                <div className="flex items-center gap-2">
                                    <currentItem.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {t(currentItem.label)}
                                    </span>
                                </div>
                                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </>
                        )}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className={`flex flex-col space-y-2 transition-all duration-300 ${isCollapsed ? 'hidden md:block' : 'block'}`}>
                    {(!isCollapsed && isMobile ? filteredNavItems : navItems).map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center justify-center md:justify-start gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                                onClick={() => setIsCollapsed(true)}
                            >
                                <div className="flex items-center gap-2 w-[120px]">
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {t(item.label)}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
} 