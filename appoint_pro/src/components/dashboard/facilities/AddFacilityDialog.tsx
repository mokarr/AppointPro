'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { FacilityType, Facility } from "@prisma/client";

interface AddFacilityDialogProps {
    locationId: string;
    onFacilityAdded?: (newFacility: Facility) => void;
    trigger?: React.ReactNode;
}

interface FacilityFormData {
    name: string;
    description: string;
    price: string;
    type: FacilityType;
}

export function AddFacilityDialog({ locationId, onFacilityAdded, trigger }: AddFacilityDialogProps) {
    const t = useTranslations('dashboard.facilities');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newFacility, setNewFacility] = useState<FacilityFormData>({
        name: "",
        description: "",
        price: "",
        type: FacilityType.PRIVATE,
    });

    const handleAddFacility = async () => {
        if (!newFacility.name.trim()) {
            toast.error(t('error.nameRequired'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/facilities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newFacility,
                    price: parseFloat(newFacility.price) || 0,
                    locationId,
                }),
            });

            if (!response.ok) throw new Error('Failed to add facility');

            const addedFacility = await response.json();
            setNewFacility({
                name: "",
                description: "",
                price: "",
                type: FacilityType.PRIVATE,
            });
            setIsOpen(false);
            toast.success(t('success.add'));
            onFacilityAdded?.(addedFacility);
        } catch (error) {
            console.error('Error adding facility:', error);
            toast.error(t('error.add'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        {t('addFacility')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('addNew')}</DialogTitle>
                    <DialogDescription>
                        {t('addNewDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input
                            id="name"
                            value={newFacility.name}
                            onChange={(e) =>
                                setNewFacility(prev => ({ ...prev, name: e.target.value }))
                            }
                            placeholder={t('namePlaceholder')}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">{t('description')}</Label>
                        <Input
                            id="description"
                            value={newFacility.description}
                            onChange={(e) =>
                                setNewFacility(prev => ({ ...prev, description: e.target.value }))
                            }
                            placeholder={t('descriptionPlaceholder')}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">{t('price')}</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={newFacility.price}
                            onChange={(e) =>
                                setNewFacility(prev => ({ ...prev, price: e.target.value }))
                            }
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">{t('type')}</Label>
                        <Select
                            value={newFacility.type}
                            onValueChange={(value) =>
                                setNewFacility(prev => ({ ...prev, type: value as FacilityType }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectType')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={FacilityType.PRIVATE}>{t('type.private')}</SelectItem>
                                <SelectItem value={FacilityType.PUBLIC}>{t('type.public')}</SelectItem>
                                <SelectItem value={FacilityType.CLASSES}>{t('type.classes')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleAddFacility}
                        disabled={isLoading}
                    >
                        {isLoading ? t('adding') : t('add')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 