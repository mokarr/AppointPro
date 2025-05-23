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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoFieldsProps {
    form: UseFormReturn<FormValues>;
}

export function BasicInfoFields({ form }: BasicInfoFieldsProps) {
    const t = useTranslations('dashboard');

    return (
        <>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('classes.name')} *</FormLabel>
                        <FormControl>
                            <Input {...field} onBlur={field.onBlur} onChange={(e) => field.onChange(e.target.value)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('classes.description')} *</FormLabel>
                        <FormControl>
                            <Textarea {...field} onBlur={field.onBlur} onChange={(e) => field.onChange(e.target.value)} />
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
                            <Input {...field} onBlur={field.onBlur} onChange={(e) => field.onChange(e.target.value)} />
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
                        <FormLabel>{t('classes.maxParticipants')} *</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                min="1" 
                                {...field} 
                                onBlur={field.onBlur}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                max={200}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
} 