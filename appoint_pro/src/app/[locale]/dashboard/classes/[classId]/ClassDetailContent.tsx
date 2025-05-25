'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Clock, Users, Settings, Info } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { nl } from "date-fns/locale";
import { SessionSettingsModal } from "@/components/dashboard/classes/SessionSettingsModal";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ClassDetailContentProps {
    classData: any; // TODO: Replace with proper type
}

type SessionFilter = 'all' | 'future';
type SessionSettingsFilter = 'custom' | 'default' | 'none';

export function ClassDetailContent({ classData }: ClassDetailContentProps) {
    const t = useTranslations('dashboard');
    const router = useRouter();
    const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [sessionFilter, setSessionFilter] = useState<SessionFilter>('future');
    const [settingsFilter, setSettingsFilter] = useState<SessionSettingsFilter>('none');

    const handleSessionSelect = (sessionId: string) => {
        setSelectedSessions(prev => 
            prev.includes(sessionId) 
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const filteredSessions = classData.classSessions?.filter((session: any) => {
        const now = new Date();
        const sessionDate = new Date(session.startTime);
        const hasCustomSettings = session.ClassSessionSettings?.data !== undefined;

        // Time-based filter
        const timeFilterMatch = sessionFilter === 'all' || sessionDate >= now;

        // Settings-based filter
        const settingsFilterMatch = settingsFilter === 'none' || 
            (settingsFilter === 'custom' && hasCustomSettings) ||
            (settingsFilter === 'default' && !hasCustomSettings);

        return timeFilterMatch && settingsFilterMatch;
    }) || [];

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b pb-6 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {classData.name}
                        </h1>
                        {classData.description && (
                            <p className="text-muted-foreground">{classData.description}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => router.push(`/dashboard/classes/${classData.id}/settings`)}>
                            <Settings className="h-4 w-4 mr-2" />
                            {t('classes.classSettings')}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Class Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    {t('classes.location')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{classData.location.name}</p>
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
                                <p>{classData.classSessions[0]?.startTime && format(new Date(classData.classSessions[0].startTime), 'HH:mm', { locale: nl })}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('classes.duration', { minutes: classData.duration })}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Update Sessions Button */}
                    {selectedSessions.length > 0 && (
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)}>
                                <Settings className="h-4 w-4 mr-2" />
                                {t('classes.updateSelectedSessions')}
                            </Button>
                        </div>
                    )}

                    {/* Sessions Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        {t('classes.sessions')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('classes.totalSessions', { count: filteredSessions.length })}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Filter Controls */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                variant={sessionFilter === 'all' ? 'default' : 'outline'}
                                                onClick={() => setSessionFilter('all')}
                                                className="w-full sm:w-auto"
                                            >
                                                {t('classes.filters.all')}
                                            </Button>
                                            <Button
                                                variant={sessionFilter === 'future' ? 'default' : 'outline'}
                                                onClick={() => setSessionFilter('future')}
                                                className="w-full sm:w-auto"
                                            >
                                                {t('classes.filters.future')}
                                            </Button>
                                        </div>
                                        <Select
                                            value={settingsFilter}
                                            onValueChange={(value: SessionSettingsFilter) => setSettingsFilter(value)}
                                        >
                                            <SelectTrigger className="w-full sm:w-[200px]">
                                                <SelectValue placeholder={t('classes.filters.placeholder')}>
                                                    {settingsFilter === 'custom' ? t('classes.filters.withCustomSettings') :
                                                     settingsFilter === 'default' ? t('classes.filters.withoutCustomSettings') :
                                                     t('classes.filters.placeholder')}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">{t('classes.filters.placeholder')}</SelectItem>
                                                <SelectItem value="custom">{t('classes.filters.withCustomSettings')}</SelectItem>
                                                <SelectItem value="default">{t('classes.filters.withoutCustomSettings')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Sessions List */}
                                {filteredSessions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {t('classes.noSessions')}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredSessions.map((session: any) => {
                                            const hasCustomSettings = session.ClassSessionSettings?.data !== undefined;
                                            const customMaxParticipants = hasCustomSettings 
                                                ? (session.ClassSessionSettings?.data as any)?.maxParticipants 
                                                : null;
                                            
                                            return (
                                                <div
                                                    key={session.id}
                                                    className="flex items-center justify-between p-4 rounded-lg border"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            id={session.id}
                                                            checked={selectedSessions.includes(session.id)}
                                                            onCheckedChange={() => handleSessionSelect(session.id)}
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">
                                                                    {format(new Date(session.startTime), 'PPP', { locale: nl })}
                                                                </p>
                                                                {hasCustomSettings && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>{t('classes.hasCustomSettings')}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(new Date(session.startTime), 'HH:mm', { locale: nl })} - {format(new Date(session.endTime), 'HH:mm', { locale: nl })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {session.participants?.length || 0} / {customMaxParticipants || classData.maxParticipants} {t('classes.participants')}
                                                        {hasCustomSettings && (
                                                            <span className="ml-2 text-xs text-blue-500">
                                                                ({t('classes.customLimit')})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SessionSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                selectedSessions={selectedSessions}
                onSettingsUpdated={() => {
                    setSelectedSessions([]);
                    // Refresh the page to get updated data
                    router.refresh();
                }}
            />
        </div>
    );
} 