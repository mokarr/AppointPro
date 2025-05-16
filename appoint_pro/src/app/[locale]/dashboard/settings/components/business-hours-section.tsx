'use client';

import { OrganizationSettings } from '@/types/settings';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";

interface BusinessHoursSectionProps {
    settings: OrganizationSettings;
    onOpeningHoursChange: (index: number, field: 'open' | 'close' | 'isClosed', value: string | boolean) => void;
    onNotFilledChange: (notFilled: boolean) => void;
}

export const BusinessHoursSection = ({
    settings,
    onOpeningHoursChange,
    onNotFilledChange
}: BusinessHoursSectionProps) => {
    const [warningMessage, setWarningMessage] = useState<string>('');
    const [emptyFields, setEmptyFields] = useState<boolean[]>(new Array(settings.openingHours.length).fill(false));
    const isMondayFilled = settings.openingHours[0].open && settings.openingHours[0].close;

    const validateForm = () => {
        console.log('validateForm');
        console.log('settings.openingHours', settings.openingHours);
        // Check for incomplete days or empty days
        const hasIncompleteDays = settings.openingHours.some(
            (day, index) => !day.isClosed && ((day.open && !day.close) || (!day.open && day.close) || !day.open || !day.close)
        );

        // Check for invalid time combinations
        const hasInvalidTimes = settings.openingHours.some(
            (day, index) => !day.isClosed && day.open && day.close && day.open >= day.close
        );

        // Update empty fields state - now includes all validation cases
        const newEmptyFields = settings.openingHours.map(
            (day, index) => Boolean(
                !day.isClosed && (
                    // Incomplete times (one filled, one empty)
                    (day.open && !day.close) || 
                    (!day.open && day.close) ||
                    // Empty times
                    !day.open || 
                    !day.close ||
                    // Invalid time combination
                    (day.open && day.close && day.open >= day.close)
                )
            )
        );

        setEmptyFields(newEmptyFields);

        // Set warning message if there are invalid times
        if (hasInvalidTimes) {
            setWarningMessage('Openingstijd moet voor sluitingstijd liggen');
        } else {
            setWarningMessage('');
        }

        // Update notFilled state
        onNotFilledChange(hasIncompleteDays || hasInvalidTimes);
    };

    // Run validation whenever settings change
    useEffect(() => {
        validateForm();
    }, [settings.openingHours]);

    const handleClosedChange = (index: number, checked: boolean) => {
        onOpeningHoursChange(index, 'isClosed', checked);
    };

    const copyToWorkWeek = () => {
        const mondayHours = settings.openingHours[0];
        // Copy to Tuesday through Friday (indices 1-4)
        for (let i = 1; i <= 4; i++) {
            if (!settings.openingHours[i].isClosed) {
                onOpeningHoursChange(i, 'open', mondayHours.open);
                onOpeningHoursChange(i, 'close', mondayHours.close);
            }
        }
    };

    const copyToWholeWeek = () => {
        const mondayHours = settings.openingHours[0];
        // Copy to all days (indices 1-6)
        for (let i = 1; i <= 6; i++) {
            if (!settings.openingHours[i].isClosed) {
                onOpeningHoursChange(i, 'open', mondayHours.open);
                onOpeningHoursChange(i, 'close', mondayHours.close);
            }
        }
    };

    const removeAllTimes = () => {
        // Clear all opening and closing times
        for (let i = 0; i < settings.openingHours.length; i++) {
            onOpeningHoursChange(i, 'open', '');
            onOpeningHoursChange(i, 'close', '');
        }
    };

    const removeDayTimes = (index: number) => {
        onOpeningHoursChange(index, 'open', '');
        onOpeningHoursChange(index, 'close', '');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Openingstijden
            </h2>
            <div className="space-y-6">
                <div>
                    <p className="text-xs text-gray-500 mb-2">
                        TIP: vul de opening en sluitingstijden voor maandag om dit te kunnen kopieeren
                    </p>
                    {warningMessage && (
                       <div className="mb-4 p-2 bg-yellow-50 text-yellow-600 rounded-md text-sm">
                            {warningMessage}
                        </div>
                    )}
                    {emptyFields.some(field => field) && (
                        <div className="mb-4 p-2 bg-yellow-50 text-yellow-600 rounded-md text-sm">
                            Vul voor alle dagen de openingstijden in of markeer ze als gesloten
                        </div>
                    )}
                    <div className="flex gap-4 mb-4">
                        <Button
                            onClick={copyToWorkWeek}
                            disabled={!isMondayFilled}
                            variant="outline"
                            className="text-sm"
                        >
                            Kopieer voor hele werkweek
                        </Button>
                        <Button
                            onClick={copyToWholeWeek}
                            disabled={!isMondayFilled}
                            variant="outline"
                            className="text-sm"
                        >
                            Kopieer voor hele week
                        </Button>
                        <Button
                            onClick={removeAllTimes}
                            variant="outline"
                            className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            Verwijder alle tijden
                        </Button>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 max-w-md">
                        {settings.openingHours.map((hour, index) => (
                            <>
                                <div className="flex items-center">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {hour.day}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="time"
                                        value={hour.open}
                                        onChange={(e) => onOpeningHoursChange(index, 'open', e.target.value)}
                                        disabled={hour.isClosed}
                                        className={`w-40 p-1 border rounded text-sm ${
                                            emptyFields[index] 
                                                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                                                : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                        } ${hour.isClosed ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="time"
                                        value={hour.close}
                                        onChange={(e) => onOpeningHoursChange(index, 'close', e.target.value)}
                                        disabled={hour.isClosed}
                                        className={`w-40 p-1 border rounded text-sm ${
                                            emptyFields[index] 
                                                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                                                : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                        } ${hour.isClosed ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`closed-${index}`}
                                                checked={hour.isClosed}
                                                onCheckedChange={(checked) => handleClosedChange(index, checked as boolean)}
                                            />
                                            <label
                                                htmlFor={`closed-${index}`}
                                                className="text-sm text-gray-600 dark:text-gray-400"
                                            >
                                                Gesloten
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => removeDayTimes(index)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Verwijder tijden voor deze dag"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}; 