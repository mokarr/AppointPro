'use client';

import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { format } from 'date-fns';
import { CalendarIcon } from "lucide-react";
import { nl } from 'date-fns/locale';
import { FormValues, daysOfWeek, DayOfWeek } from "../schema";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface RecurringOptionsProps {
    form: UseFormReturn<FormValues>;
}

export function RecurringOptions({ form }: RecurringOptionsProps) {
    const t = useTranslations('dashboard');
    const isRecurring = form.watch("isRecurring");

    return (
        <>
            <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>{t('classes.recurring')}</FormLabel>
                            <FormDescription>
                                {t('classes.recurringDescription')}
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (!checked) {
                                        form.setValue("recurrencePattern", undefined);
                                        form.setValue("skipDay", []);
                                        form.setValue("endDate", undefined);
                                    }
                                }}
                                className="border border-gray-400 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-white w-14 h-8 relative after:content-[''] after:absolute after:top-1 after:left-1 after:w-6 after:h-6 after:rounded-full after:bg-white after:transition-transform after:duration-200 data-[state=checked]:after:translate-x-6 after:shadow-md"
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {isRecurring && (
                <>
                    <FormField
                        control={form.control}
                        name="recurrencePattern"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('classes.recurrencePattern')} *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('classes.selectPattern')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="daily">{t('classes.daily')}</SelectItem>
                                        <SelectItem value="weekly">{t('classes.weekly')}</SelectItem>
                                        <SelectItem value="biweekly">{t('classes.biweekly')}</SelectItem>
                                        <SelectItem value="triweekly">{t('classes.triweekly')}</SelectItem>
                                        <SelectItem value="monthly">{t('classes.monthly')}</SelectItem>
                                        <SelectItem value="bimonthly">{t('classes.bimonthly')}</SelectItem>
                                        <SelectItem value="trimonthly">{t('classes.trimonthly')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="skipDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('classes.skipDay')}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start",
                                                !field.value || field.value.length === 0 ? "text-muted-foreground" : ""
                                            )}
                                        >
                                            {field.value && field.value.length > 0
                                                ? (field.value as DayOfWeek[]).map((day) => t(`classes.${day}`)).join(', ')
                                                : t('classes.selectSkipDay')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 bg-white">
                                        <div className="flex flex-col gap-2">
                                            {daysOfWeek.map((day) => (
                                                <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value?.includes(day)}
                                                        onChange={() => {
                                                            const newValue = field.value ? [...field.value] as DayOfWeek[] : [];
                                                            if (newValue.includes(day)) {
                                                                field.onChange(newValue.filter((d) => d !== day));
                                                            } else {
                                                                newValue.push(day);
                                                                field.onChange(newValue);
                                                            }
                                                        }}
                                                    />
                                                    <span>{t(`classes.${day}`)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>{t('classes.endDate')} *</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: nl })
                                                ) : (
                                                    <span>{t('classes.pickEndDate')}</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date: Date): boolean => {
                                                const oneYearFromNow = new Date();
                                                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                                                const startDate = form.getValues("startDate");
                                                if (!startDate) {
                                                    return date < new Date() || date > oneYearFromNow;
                                                }
                                                const compareDate = new Date(date);
                                                compareDate.setHours(0, 0, 0, 0);
                                                const compareStartDate = new Date(startDate);
                                                compareStartDate.setHours(0, 0, 0, 0);
                                                return date < new Date() || 
                                                       date > oneYearFromNow || 
                                                       compareDate <= compareStartDate;
                                            }}
                                            initialFocus
                                            locale={nl}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}
        </>
    );
} 