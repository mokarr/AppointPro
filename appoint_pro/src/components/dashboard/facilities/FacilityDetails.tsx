'use client';

import { Facility } from '@prisma/client';
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Building, Euro, Edit, Trash, Settings } from "lucide-react";
import { useState } from "react";
import { FacilityEditDialog } from "@/components/dashboard/facilities/FacilityEditDialog";
import { FacilityDeleteDialog } from "@/components/dashboard/facilities/FacilityDeleteDialog";
import Link from "next/link";

interface FacilityDetailsProps {
    facility: Facility;
}

export default function FacilityDetails({ facility }: FacilityDetailsProps) {
    const t = useTranslations('dashboard.facilities');
    const [isEditFacilityOpen, setIsEditFacilityOpen] = useState(false);
    const [isDeleteFacilityOpen, setIsDeleteFacilityOpen] = useState(false);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b pb-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {facility.name}
                        </h1>
                        {facility.description && (
                            <p className="text-muted-foreground">{facility.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditFacilityOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('edit')}
                        </Button>
                        <Button variant="outline" onClick={() => setIsDeleteFacilityOpen(true)}>
                            <Trash className="h-4 w-4 mr-2" />
                            {t('delete')}
                        </Button>
                        <Button asChild>
                            <Link href={`/dashboard/facilities/${facility.id}/settings`} className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                {t('settings')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Facility Details Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6">{t('facilityDetails')}</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h3 className="font-medium mb-1">{t('price')}</h3>
                                    <p className="text-muted-foreground">€{facility.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h3 className="font-medium mb-1">{t('type')}</h3>
                                    <p className="text-muted-foreground">{t(`facilityType.${facility.type.toLowerCase()}`)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Facility Dialog */}
            <FacilityEditDialog
                facility={facility}
                open={isEditFacilityOpen}
                onOpenChange={setIsEditFacilityOpen}
                onFacilityUpdated={() => {}}
            />

            {/* Delete Facility Dialog */}
            <FacilityDeleteDialog
                facility={facility}
                open={isDeleteFacilityOpen}
                onOpenChange={setIsDeleteFacilityOpen}
            />
        </div>
    );
} 