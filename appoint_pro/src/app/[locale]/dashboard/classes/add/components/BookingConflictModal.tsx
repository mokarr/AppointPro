import { useTranslations } from "next-intl";
import { ConflictModal } from "./ConflictModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface BookingConflict {
    id: string;
    startTime: string;
    endTime: string;
    facilityName: string;
    customerName: string;
}

interface BookingConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    conflicts: BookingConflict[];
}

export function BookingConflictModal({
    isOpen,
    onClose,
    onConfirm,
    conflicts
}: BookingConflictModalProps) {
    const t = useTranslations('dashboard');

    return (
        <ConflictModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={t('classes.bookingConflicts.title')}
            description={t('classes.bookingConflicts.description')}
            confirmText={t('classes.bookingConflicts.confirm')}
            variant="destructive"
        >
            <div className="space-y-4">
                {conflicts.map((conflict) => (
                    <Card key={conflict.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {conflict.customerName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(conflict.startTime), 'PPp')} - {format(new Date(conflict.endTime), 'p')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {conflict.facilityName}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ConflictModal>
    );
} 