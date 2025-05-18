'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { nl } from 'date-fns/locale';

const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
] as const;
type DayOfWeek = typeof daysOfWeek[number];

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    instructor: z.string().optional(),
    maxParticipants: z.coerce.number().min(1, "Must have at least 1 participant"),
    startDate: z.date({ required_error: "Start date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    isRecurring: z.boolean(),
    recurrencePattern: z.enum(["daily", "weekly", "biweekly", "triweekly", "monthly", "bimonthly", "trimonthly"]).optional(),
    skipDay: z.array(z.enum(daysOfWeek)).optional(),
    endDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddClassFormProps {
    locationId: string;
}

export function AddClassForm({ locationId }: AddClassFormProps) {
    const t = useTranslations('dashboard');
    const router = useRouter();
    const [previewSessions, setPreviewSessions] = useState<Date[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            instructor: "",
            maxParticipants: 10,
            startDate: undefined,
            startTime: "09:00",
            duration: 60,
            isRecurring: false,
            skipDay: [] as DayOfWeek[],
        },
    });

    const isRecurring = form.watch("isRecurring");
    const recurrencePattern = form.watch("recurrencePattern");
    const endDate = form.watch("endDate");
    const skipDay = form.watch("skipDay");
    const startDate = form.watch("startDate");

    useEffect(() => {
        if (!isRecurring || !recurrencePattern || !endDate || !startDate) {
            setPreviewSessions([]);
            return;
        }

        const sessions: Date[] = [];
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            const skipDayIndexes = (skipDay as DayOfWeek[] | undefined)?.map(day => ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(day)) ?? [];

            if (!skipDayIndexes.includes(dayOfWeek)) {
                sessions.push(new Date(currentDate));
            }

            switch (recurrencePattern) {
                case "daily":
                    currentDate = addDays(currentDate, 1);
                    break;
                case "weekly":
                    currentDate = addWeeks(currentDate, 1);
                    break;
                case "biweekly":
                    currentDate = addWeeks(currentDate, 2);
                    break;
                case "triweekly":
                    currentDate = addWeeks(currentDate, 3);
                    break;
                case "monthly":
                    currentDate = addMonths(currentDate, 1);
                    break;
                case "bimonthly":
                    currentDate = addMonths(currentDate, 2);
                    break;
                case "trimonthly":
                    currentDate = addMonths(currentDate, 3);
                    break;
            }
        }

        setPreviewSessions(sessions);
    }, [isRecurring, recurrencePattern, endDate, skipDay as unknown as string[], startDate]);

    const onSubmit = (data: FormValues) => {
        // TODO: Implement backend submission
        console.log({ ...data, locationId });
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('classes.addClass')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('classes.addClassDescription')}
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('classes.name')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instructor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('classes.instructor')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxParticipants"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('classes.maxParticipants')}</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('classes.startDate') ?? 'Startdatum'}</FormLabel>
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
                                                    {field.value ? format(field.value, "PPP", { locale: nl }) : t('classes.pickStartDate') ?? 'Kies een startdatum'}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date()}
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
                                        <FormLabel>{t('classes.startTime')}</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
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
                                        <FormLabel>{t('classes.duration')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            onCheckedChange={field.onChange}
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
                                            <FormLabel>{t('classes.recurrencePattern')}</FormLabel>
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
                                            <FormLabel>{t('classes.endDate')}</FormLabel>
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
                                                        disabled={(date) => {
                                                            const oneYearFromNow = new Date();
                                                            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                                                            return date < new Date() || date > oneYearFromNow;
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

                        {previewSessions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('classes.previewSessions')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {previewSessions.map((date, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                <span>{format(date, "PPP")}</span>
                                                <span>{form.getValues("startTime")}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit">
                                {t('common.save')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
} 