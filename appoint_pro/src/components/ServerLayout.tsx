// appoint_pro/src/components/ServerLayout.tsx

import { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import Layout from './Layout';

interface ServerLayoutProps {
    children: ReactNode;
}

export default async function ServerLayout({ children }: ServerLayoutProps) {
    const session = await auth();
    console.log(session);

    return (
        <Layout session={session}>
            {children}
        </Layout>
    );
}