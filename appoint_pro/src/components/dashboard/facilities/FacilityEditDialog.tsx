'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Facility, FacilityType } from "@prisma/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface FacilityEditDialogProps {
    facility: Facility;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFacilityUpdated: () => void;
}

export function FacilityEditDialog({ facility, open, onOpenChange, onFacilityUpdated }: FacilityEditDialogProps) {
    const t = useTranslations('dashboard.facilities');
    const [editedFacility, setEditedFacility] = useState<Partial<Facility>>(facility);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setEditedFacility(facility);
    }, [facility]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!editedFacility.name?.trim()) {
            newErrors.name = t('errors.nameRequired');
        }
        if (!editedFacility.price || editedFacility.price <= 0) {
            newErrors.price = t('errors.priceRequired');
        }
        if (!editedFacility.type) {
            newErrors.type = t('errors.typeRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditFacility = async () => {
        if (!validateForm()) return;

        try {
            const response = await fetch(`/api/facilities/${facility.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedFacility),
            });

            if (!response.ok) {
                throw new Error('Failed to update facility');
            }

            toast.success(t('editSuccess'));
            onFacilityUpdated();
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating facility:', error);
            toast.error(t('editError'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('editFacility')}</DialogTitle>
                    <DialogDescription>{t('editFacilityDescription')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input
                            id="name"
                            value={editedFacility.name || ''}
                            onChange={(e) => setEditedFacility({ ...editedFacility, name: e.target.value })}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">{t('description')}</Label>
                        <Input
                            id="description"
                            value={editedFacility.description || ''}
                            onChange={(e) => setEditedFacility({ ...editedFacility, description: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">{t('price')}</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={editedFacility.price || ''}
                            onChange={(e) => setEditedFacility({ ...editedFacility, price: parseFloat(e.target.value) })}
                        />
                        {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">{t('type')}</Label>
                        <Select
                            value={editedFacility.type || ''}
                            onValueChange={(value) => setEditedFacility({ ...editedFacility, type: value as FacilityType })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectType')} />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(FacilityType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {t(`facilityType.${type.toLowerCase()}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleEditFacility}>
                        {t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 