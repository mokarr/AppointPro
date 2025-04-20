'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlan } from '@prisma/client';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionPlanCardProps {
    plan: SubscriptionPlan;
    hasActiveSubscription?: boolean;
}

export default function SubscriptionPlanCard({
    plan,
    hasActiveSubscription = false,
}: SubscriptionPlanCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Parse the features JSON string
    const features = JSON.parse(plan.features || '[]') as string[];

    const handleSubscribe = async () => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/subscriptions/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId: plan.id }),
            });

            const data = await response.json();

            if (data.url) {
                router.push(data.url);
            } else {
                throw new Error('Failed to create checkout session');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Failed to start subscription process. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="mb-6">
                    <p className="text-3xl font-bold">€{plan.price.toFixed(2)}</p>
                    <p className="text-muted-foreground">per {plan.interval}</p>
                </div>

                <ul className="space-y-2">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleSubscribe}
                    disabled={isLoading || hasActiveSubscription}
                >
                    {isLoading
                        ? 'Processing...'
                        : hasActiveSubscription
                            ? 'Current Plan'
                            : 'Subscribe'}
                </Button>
            </CardFooter>
        </Card>
    );
} 