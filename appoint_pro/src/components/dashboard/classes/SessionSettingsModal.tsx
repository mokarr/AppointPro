'use client';

import { useState } from 'react';
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SessionSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSessions: string[];
    onSettingsUpdated: () => void;
}

export function SessionSettingsModal({
    isOpen,
    onClose,
    selectedSessions,
    onSettingsUpdated
}: SessionSettingsModalProps) {
    const t = useTranslations('dashboard');
    const [maxParticipants, setMaxParticipants] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (maxParticipants <= 0) {
            toast.error(t('classes.invalidMaxParticipants'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/class/sessions/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionIds: selectedSessions,
                    settings: {
                        maxParticipants
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            toast.success(t('classes.settingsUpdated'));
            onSettingsUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating session settings:', error);
            toast.error(t('classes.settingsUpdateError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('classes.updateSessionSettings')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="maxParticipants">{t('classes.maxParticipants')}</Label>
                        <Input
                            id="maxParticipants"
                            type="number"
                            min="1"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? t('common.saving') : t('common.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 