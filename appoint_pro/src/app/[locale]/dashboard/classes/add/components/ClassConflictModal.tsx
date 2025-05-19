import { useTranslations } from "next-intl";
import { ConflictModal } from "./ConflictModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ClassConflict {
    id: string;
    startTime: string;
    endTime: string;
    facilityName: string;
    className: string;
    instructor: string;
}

interface ClassConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    conflicts: ClassConflict[];
}

export function ClassConflictModal({
    isOpen,
    onClose,
    conflicts
}: ClassConflictModalProps) {
    const t = useTranslations('dashboard');

    return (
        <ConflictModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onClose}
            title={t('classes.classConflicts.title')}
            description={t('classes.classConflicts.description')}
            confirmText={t('common.close')}
        >
            <div className="space-y-4">
                {conflicts.map((conflict) => (
                    <Card key={conflict.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {conflict.className}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(conflict.startTime), 'PPp')} - {format(new Date(conflict.endTime), 'p')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('classes.instructor')}: {conflict.instructor}
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