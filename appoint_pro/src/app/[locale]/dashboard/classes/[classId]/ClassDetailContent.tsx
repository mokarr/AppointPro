'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ClassDetailContentProps {
    classData: any; // TODO: Replace with proper type
}

export function ClassDetailContent({ classData }: ClassDetailContentProps) {
    console.log("classData", classData);
    const t = useTranslations('dashboard');
    const router = useRouter();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {classData.name}
                        </h1>
                        <p className="text-muted-foreground">
                            {classData.description}
                        </p>
                    </div>
                    <Button onClick={() => router.back()}>
                        {t('common.back')}
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                {t('classes.location')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{classData.location.name}</p>
                            {classData.facility && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {classData.facility.name}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t('classes.instructor')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{classData.instructor}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('classes.maxParticipants', { count: classData.maxParticipants })}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                {t('classes.schedule')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{classData.classSessions[0]?.startTime && format(new Date(classData.classSessions[0].startTime), 'HH:mm')}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('classes.duration', { minutes: classData.duration })}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {t('classes.sessions')}
                        </CardTitle>
                        <CardDescription>
                            {t('classes.totalSessions', { count: classData.classSessions?.length || 0 })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!classData.classSessions || classData.classSessions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('classes.noSessions')}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {classData.classSessions.map((session: any) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {format(new Date(session.startTime), 'PPP')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {session.participants?.length || 0} / {classData.maxParticipants} {t('classes.participants')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 