'use client';

import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Facility {
    id: string;
    name: string;
    description: string;
    type: string;
}

interface FacilityOptionProps {
    form: UseFormReturn<FormValues>;
    facilities: Facility[];
}

export function FacilityOption({ form, facilities }: FacilityOptionProps) {
    const t = useTranslations('dashboard');
    const isInFacility = form.watch("isInFacility");

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="isInFacility"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>{t('classes.inFacility')}</FormLabel>
                            <FormDescription>
                                {t('classes.inFacilityDescription')}
                                {isInFacility && (
                                    <span className="block mt-1 text-destructive">
                                        {t('classes.facilityWarning')}
                                    </span>
                                )}
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-white w-14 h-8 relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-6 after:h-6 after:rounded-full after:bg-white after:transition-transform after:duration-200 data-[state=checked]:after:translate-x-6 after:shadow-md"
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {isInFacility && (
                <FormField
                    control={form.control}
                    name="facilityId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('classes.selectFacility')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('classes.selectFacilityPlaceholder')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {facilities.map((facility) => (
                                        <SelectItem key={facility.id} value={facility.id}>
                                            {facility.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
} 