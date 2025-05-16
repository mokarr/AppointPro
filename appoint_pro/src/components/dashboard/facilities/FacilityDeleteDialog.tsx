'use client';

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Facility } from "@prisma/client";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Building } from "lucide-react";
import { toast } from "sonner";

interface FacilityDeleteDialogProps {
    facility: Facility;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FacilityDeleteDialog({ facility, open, onOpenChange }: FacilityDeleteDialogProps) {
    const t = useTranslations('dashboard.facilities');
    const router = useRouter();

    const handleDeleteFacility = async () => {
        try {
            const response = await fetch(`/api/facilities/${facility.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete facility');
            }

            toast.success(t('deleteSuccess'));
            router.push(`/dashboard/locations/${facility.locationId}`);
        } catch (error) {
            console.error('Error deleting facility:', error);
            toast.error(t('deleteError'));
        }
    };

    return (
        <DeleteConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleDeleteFacility}
            onCancel={() => onOpenChange(false)}
            title={t('deleteFacility')}
            description={t('deleteFacilityDescription', { name: facility.name })}
            warningMessage={t('deleteFacilityWarning')}
            cancelText={t('cancel')}
            confirmText={t('delete')}
            itemDetails={
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{facility.name}</span>
                </div>
            }
            showWarningOnConfirm={true}
        />
    );
} 