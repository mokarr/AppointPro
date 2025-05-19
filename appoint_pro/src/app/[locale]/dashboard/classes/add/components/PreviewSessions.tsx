'use client';

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PreviewSessionsProps {
    previewSessions: Date[];
    startTime: string;
}

export function PreviewSessions({ previewSessions, startTime }: PreviewSessionsProps) {
    const t = useTranslations('dashboard');
    const [visibleSessions, setVisibleSessions] = useState<number>(20);

    const loadMoreSessions = () => {
        setVisibleSessions(prev => prev + 20);
    };

    if (previewSessions.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('classes.previewSessions')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {previewSessions.slice(0, visibleSessions).map((date, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span>{format(date, "PPP", { locale: nl })}</span>
                            <span>{startTime}</span>
                        </div>
                    ))}
                </div>
                {visibleSessions < previewSessions.length && (
                    <Button
                        variant="outline"
                        onClick={loadMoreSessions}
                        className="w-full mt-4"
                    >
                        {t('common.showMore')}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
} 