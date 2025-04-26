"use client"; // Must be at the top
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import { usePathname } from "next/navigation";

// Menu items.
const items = [
    { title: "Homeee", slug: "home", icon: Home },
    { title: "Inbox", slug: "inbox", icon: Inbox },
    { title: "Calendar", slug: "calendar", icon: Calendar },
    { title: "Search", slug: "search", icon: Search },
    { title: "Settings", slug: "settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();

    // Split pathname and extract only `/portal/demo2`
    const pathSegments = pathname.split("/").filter(Boolean); // Remove empty parts
    const basePath = `/${pathSegments.slice(0, 2).join("/")}`; // Get first two parts (e.g., `/portal/demo2`)


    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={`${basePath}/${item.slug}`}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
