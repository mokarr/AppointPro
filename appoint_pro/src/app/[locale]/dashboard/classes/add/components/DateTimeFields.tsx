'use client';

import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { format } from 'date-fns';
import { CalendarIcon } from "lucide-react";
import { nl } from 'date-fns/locale';
import { FormValues } from "../schema";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateTimeFieldsProps {
    form: UseFormReturn<FormValues>;
}

export function DateTimeFields({ form }: DateTimeFieldsProps) {
    const t = useTranslations('dashboard');

    return (
        <>
            <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>{t('classes.startDate')} *</FormLabel>
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
                                            <span>{t('classes.selectDate')}</span>
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
                                    disabled={(date) =>
                                        date < new Date()
                                    }
                                    initialFocus
                                    locale={nl}
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('classes.startTime')} *</FormLabel>
                            <FormControl>
                                <Input 
                                    type="time" 
                                    {...field} 
                                    onBlur={field.onBlur}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('classes.duration')} *</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    min="1" 
                                    {...field} 
                                    onBlur={field.onBlur}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
} 