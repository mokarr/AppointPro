'use client';

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

type Location = {
    id: string;
    name: string;
    address: string;
    postalCode?: string;
    country?: string;
    facilitiesCount: number;
}

type LocationDeleteDialogProps = {
    location: Location;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LocationDeleteDialog({ location, open, onOpenChange }: LocationDeleteDialogProps) {
    const t = useTranslations('dashboard.locations');
    const router = useRouter();

    const handleDeleteLocation = async () => {
        try {
            const response = await fetch(`/api/locations/${location.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (errorData.code === "BOOKINGS_EXIST" || errorData.code === "CONSTRAINT_ERROR") {
                    toast.error(errorData.error);

                    if (errorData.details) {
                        toast.error(errorData.details, { duration: 5000 });
                    }

                    onOpenChange(false);
                    return;
                }

                throw new Error('Failed to delete location');
            }

            toast.success(t('success.delete'));
            router.push('/dashboard/locations');
        } catch (error) {
            console.error('Error deleting location:', error);
            toast.error(t('error.delete'));
        }
    };

    return (
        <DeleteConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleDeleteLocation}
            onCancel={() => onOpenChange(false)}
            title={t('deleteLocation')}
            description={t('deleteLocationConfirmation')}
            warningMessage={t('deleteFacilitiesWarning')}
            cancelText={t('cancel')}
            confirmText={t('deleteConfirm')}
            showWarningOnConfirm={true}
            itemDetails={
                <>
                    <p className="font-medium">
                        {location.name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {location.address}
                    </p>
                </>
            }
        />
    );
} 