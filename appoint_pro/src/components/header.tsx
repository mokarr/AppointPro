"use client";

import * as React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { themeConfig } from "@/components/ui/theme-config";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";

type HeaderProps = {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    organization?: {
        name: string;
    };
};

export function Header({ user, organization }: HeaderProps) {
    const pathname = usePathname();

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
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="hidden items-center space-x-2 md:flex">
                        <span className="hidden font-bold sm:inline-block text-xl">
                            {themeConfig.name}
                        </span>
                    </Link>
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Afspraken</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                                                    href="/portal/calendar"
                                                >
                                                    <div className="mt-4 mb-2 text-lg font-medium text-white">
                                                        Agenda
                                                    </div>
                                                    <p className="text-sm leading-tight text-white/90">
                                                        Bekijk en beheer uw agenda en afspraken
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        <ListItem href="/portal/afspraken/inkomend" title="Inkomende afspraken">
                                            Bekijk en beheer inkomende afspraken.
                                        </ListItem>
                                        <ListItem href="/portal/afspraken/uitgaand" title="Uitgaande afspraken">
                                            Bekijk en beheer uitgaande afspraken.
                                        </ListItem>
                                        <ListItem href="/portal/afspraken/geschiedenis" title="Geschiedenis">
                                            Bekijk de geschiedenis van afspraken.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Klanten</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                        <ListItem href="/portal/klanten" title="Klantenoverzicht">
                                            Bekijk al uw klanten in één overzicht.
                                        </ListItem>
                                        <ListItem href="/portal/klanten/nieuw" title="Nieuwe klant">
                                            Voeg een nieuwe klant toe aan uw administratie.
                                        </ListItem>
                                        <ListItem href="/portal/klanten/groepen" title="Klantgroepen">
                                            Beheer uw klantgroepen voor betere organisatie.
                                        </ListItem>
                                        <ListItem href="/portal/klanten/communicatie" title="Communicatie">
                                            Communiceer met uw klanten via berichten.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/portal/diensten" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Diensten
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden md:block">
                        {organization && (
                            <span className="text-sm font-medium">{organization.name}</span>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/portal/profiel">Profiel</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/portal/instellingen">Instellingen</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    signOut();
                                }}
                            >
                                Uitloggen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
})
ListItem.displayName = "ListItem"; 