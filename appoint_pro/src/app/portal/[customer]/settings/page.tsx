'use client'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from 'next/navigation'

const SettingsPage = () => {

    const basePath = usePathname()

    return (
        <div>
            <h1>Settings</h1>
            <Button>
                <Link href={`${basePath}/facility/add`}>Voeg faciliteit toe</Link>
            </Button>
        </div>
    );
};

export default SettingsPage;