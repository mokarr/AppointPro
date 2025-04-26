'use client';

import type { ReactNode } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { getTranslation } = useLanguage();
    const { data: session, status } = useSession();
    const pathname = usePathname();

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = getTranslation(key);
        return typeof value === 'string' ? value : '';
    };

    // Check if we're in the dashboard section
    const isDashboard = pathname?.startsWith('/dashboard');

    // Don't show anything in the nav buttons while loading
    const isLoading = status === 'loading';

    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="min-h-screen">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-6">
                            <Link href={session ? "/dashboard" : "/"} className="text-xl font-bold text-gray-900 dark:text-white">
                                {getString('common.appName')}
                            </Link>

                            {session && (
                                <NavigationMenu>
                                    <NavigationMenuList>
                                        {isDashboard && (
                                            <>
                                                <NavigationMenuItem>
                                                    <Link href={isDashboard ? "/dashboard/appointments" : "/portal/calendar"} legacyBehavior passHref>
                                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                                            {getString('common.appointments')}
                                                        </NavigationMenuLink>
                                                    </Link>
                                                </NavigationMenuItem>

                                                <NavigationMenuItem>
                                                    <Link href="/dashboard/customers" legacyBehavior passHref>
                                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                                            {getString('common.clients')}
                                                        </NavigationMenuLink>
                                                    </Link>
                                                </NavigationMenuItem>

                                                <NavigationMenuItem>
                                                    <Link href="/dashboard/organizations" legacyBehavior passHref>
                                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                                            {getString('common.organizations')}
                                                        </NavigationMenuLink>
                                                    </Link>
                                                </NavigationMenuItem>

                                                <NavigationMenuItem>
                                                    <Link href={isDashboard ? "/dashboard/services" : "/portal/services"} legacyBehavior passHref>
                                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                                            {getString('common.services')}
                                                        </NavigationMenuLink>
                                                    </Link>
                                                </NavigationMenuItem>
                                            </>
                                        )}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            {!isLoading && (
                                <>
                                    {session ? (
                                        <div className="flex items-center gap-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || getString('common.user')} />
                                                            <AvatarFallback>{getInitials(session.user?.name)}</AvatarFallback>
                                                        </Avatar>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel className="font-normal">
                                                        <div className="flex flex-col space-y-1">
                                                            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                                            <p className="text-xs leading-none text-muted-foreground">
                                                                {session.user?.email}
                                                            </p>
                                                        </div>
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href="/dashboard/profile">{getString('common.profile')}</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href="/dashboard/settings">{getString('common.settings')}</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            signOut();
                                                        }}
                                                    >
                                                        {getString('common.logout')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button asChild variant="outline">
                                                <Link href="/sign-in">{getString('common.login')}</Link>
                                            </Button>
                                            <Button asChild>
                                                <Link href="/sign-up">{getString('common.register')}</Link>
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
} 