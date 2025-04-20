import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HomeContent from '@/components/HomeContent';

export default async function HomePage() {
    const session = await auth();

    return (
        <HomeContent session={session} />
    );
} 