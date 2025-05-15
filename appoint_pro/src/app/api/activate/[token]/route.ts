import { db } from "@/lib/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    console.log(token);
    
    const user = await db.user.findFirst({
        where: {
            activateToken: {
                some: {
                    AND: [
                        {
                            token: token,
                        },
                        {
                            activatedAt: null,
                        },
                        {
                           createdAt: {
                            gt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
                           }
                        }
                    ],
                },
            },
        },
    });
    
    if (!user) {
        return new Response('Invalid or expired activation token', { status: 400 });
    }

    await db.user.update({
        where: { id: user.id },
        data: {
            active: true,
            emailVerified: new Date(),
        },
    });

    await db.activateToken.update({
        where: { token: token },
        data: {
            activatedAt: new Date(),
        },
    });

    console.log('activating completed successfully, redirecting to signin');
    redirect('/sign-in?emailconfirmed=true'); //TODO: should redirect to the api endpoint that will again redirect to the signin page with the emailconfirmed=true parameter
    
}