'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Location = {
    id: string;
    name: string;
    address: string;
    postalCode?: string;
    country?: string;
    facilitiesCount: number;
}

type LocationEditDialogProps = {
    location: Location;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLocationUpdated: (updatedLocation: Location) => void;
}

export function LocationEditDialog({ location, open, onOpenChange, onLocationUpdated }: LocationEditDialogProps) {
    const t = useTranslations('dashboard.locations');
    const [editedLocation, setEditedLocation] = useState<Omit<Location, "id" | "facilitiesCount">>({
        name: "",
        address: "",
        postalCode: "",
        country: "",
    });
    const [errors, setErrors] = useState<{
        name?: string;
        address?: string;
    }>({});

    useEffect(() => {
        if (location) {
            setEditedLocation({
                name: location.name,
                address: location.address,
                postalCode: location.postalCode || "",
                country: location.country || "",
            });
        }
    }, [location]);

    const validateForm = () => {
        const newErrors: { name?: string; address?: string } = {};
        let isValid = true;

        if (!editedLocation.name.trim()) {
            newErrors.name = t('error.nameRequired') || 'Name is required';
            isValid = false;
        }

        if (!editedLocation.address.trim()) {
            newErrors.address = t('error.addressRequired') || 'Address is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleEditLocation = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch(`/api/locations/${location.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedLocation)
            });

            if (!response.ok) throw new Error('Failed to update location');

            const updatedLocation = await response.json();
            onLocationUpdated(updatedLocation);
            onOpenChange(false);
            setErrors({});

            toast.success(t('success.update'));
        } catch (error) {
            console.error('Error updating location:', error);
            toast.error(t('error.update'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{t('editLocation')}</DialogTitle>
                    <DialogDescription>
                        {t('editLocationDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name" className="flex">
                            {t('locationName')}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="edit-name"
                            name="name"
                            value={editedLocation.name}
                            onChange={e => setEditedLocation({ ...editedLocation, name: e.target.value })}
                            placeholder={t('locationNamePlaceholder')}
                            required
                            aria-required="true"
                            aria-invalid={!!errors.name}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500" role="alert">{errors.name}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-address" className="flex">
                            {t('address')}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="edit-address"
                            name="address"
                            value={editedLocation.address}
                            onChange={e => setEditedLocation({ ...editedLocation, address: e.target.value })}
                            placeholder={t('addressPlaceholder')}
                            required
                            aria-required="true"
                            aria-invalid={!!errors.address}
                            className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500" role="alert">{errors.address}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-postalCode">{t('postalCode')}</Label>
                            <Input
                                id="edit-postalCode"
                                name="postalCode"
                                value={editedLocation.postalCode}
                                onChange={e => setEditedLocation({ ...editedLocation, postalCode: e.target.value })}
                                placeholder={t('postalCodePlaceholder')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-country">{t('country')}</Label>
                            <Input
                                id="edit-country"
                                name="country"
                                value={editedLocation.country}
                                onChange={e => setEditedLocation({ ...editedLocation, country: e.target.value })}
                                placeholder={t('countryPlaceholder')}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleEditLocation} type="submit">
                        {t('saveChanges')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 