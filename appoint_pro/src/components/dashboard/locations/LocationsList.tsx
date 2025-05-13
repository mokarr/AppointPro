"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MapPin, Building, Edit, Trash, Plus, Loader2, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useTranslations } from "next-intl"

type Location = {
    id: string
    name: string
    address: string
    postalCode?: string
    country?: string
    facilitiesCount: number
}

type ApiLocation = {
    id: string
    name: string
    address: string
    postalCode?: string
    country?: string
    _count?: {
        facilities: number
    }
}

export function LocationsList() {
    const t = useTranslations('dashboard.locations');
    const [locations, setLocations] = useState<Location[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
    const [isEditLocationOpen, setIsEditLocationOpen] = useState(false)
    const [isDeleteLocationOpen, setIsDeleteLocationOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [newLocation, setNewLocation] = useState<Omit<Location, "id" | "facilitiesCount">>({
        name: "",
        address: "",
        postalCode: "",
        country: "",
    })
    const [errors, setErrors] = useState<{
        name?: string;
        address?: string;
    }>({})



    // Fetch locations from the API
    useEffect(() => {
        const fetchLocations = async () => {
            setIsLoading(true)
            try {
                const response = await fetch('/api/locations')
                if (!response.ok) throw new Error('Failed to fetch locations')

                const locationsData: ApiLocation[] = await response.json()

                // Format the data to match our component's expected format
                const formattedLocations = locationsData.map((location) => ({
                    id: location.id,
                    name: location.name,
                    address: location.address,
                    postalCode: location.postalCode || "",
                    country: location.country || "",
                    facilitiesCount: location._count?.facilities || 0
                }))

                // Log the formatted locations for debugging
                console.log('[LocationsList] formattedLocations:', formattedLocations);

                setLocations(formattedLocations)

            } catch (error) {
                console.error('Error fetching locations:', error)
                toast.error(t('error.fetch'))

            } finally {
                setIsLoading(false)

            }
        }

        fetchLocations()
    }, [t])

    const validateForm = () => {
        const newErrors: { name?: string; address?: string } = {};
        let isValid = true;

        if (!newLocation.name.trim()) {
            newErrors.name = t('error.nameRequired') || 'Name is required';
            isValid = false;
        }

        if (!newLocation.address.trim()) {
            newErrors.address = t('error.addressRequired') || 'Address is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleAddLocation = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            // In a real app, make API call to add location
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLocation)
            })

            if (!response.ok) throw new Error('Failed to add location')

            const addedLocation = await response.json()

            // Add the new location to our state
            setLocations([...locations, {
                ...addedLocation,
                facilitiesCount: 0
            }])

            // Reset form and close dialog
            setNewLocation({ name: "", address: "", postalCode: "", country: "" })
            setIsAddLocationOpen(false)
            setErrors({})

            toast.success(t('success.add'))
        } catch (error) {
            console.error('Error adding location:', error)
            toast.error(t('error.add'))

            // For demo fallback if API fails
            const newLocationWithId: Location = {
                ...newLocation,
                id: `${locations.length + 1}`,
                facilitiesCount: 0,
            }
            setLocations([...locations, newLocationWithId])
            setNewLocation({ name: "", address: "", postalCode: "", country: "" })
            setIsAddLocationOpen(false)
            setErrors({})
        }
    }

    const handleEditLocation = async () => {
        if (!selectedLocation) return;

        if (!validateForm()) {
            return;
        }

        try {
            // In a real app, make API call to update location
            const response = await fetch(`/api/locations/${selectedLocation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLocation)
            })

            if (!response.ok) throw new Error('Failed to update location')

            // Update the location in our state
            setLocations(locations.map(loc =>
                loc.id === selectedLocation.id
                    ? { ...loc, ...newLocation }
                    : loc
            ))

            // Reset form and close dialog
            setNewLocation({ name: "", address: "", postalCode: "", country: "" })
            setSelectedLocation(null)
            setIsEditLocationOpen(false)
            setErrors({})

            toast.success(t('success.update'))
        } catch (error) {
            console.error('Error updating location:', error)
            toast.error(t('error.update'))

            // For demo fallback if API fails
            setLocations(locations.map(loc =>
                loc.id === selectedLocation.id
                    ? { ...loc, ...newLocation }
                    : loc
            ))
            setNewLocation({ name: "", address: "", postalCode: "", country: "" })
            setSelectedLocation(null)
            setIsEditLocationOpen(false)
            setErrors({})
        }
    }

    const handleDeleteLocation = async () => {
        if (!selectedLocation) return;

        try {
            // In a real app, make API call to delete location
            const response = await fetch(`/api/locations/${selectedLocation.id}`, {
                method: 'DELETE'
            });

            // Check for error responses
            if (!response.ok) {
                const errorData = await response.json();

                if (errorData.code === "BOOKINGS_EXIST" || errorData.code === "CONSTRAINT_ERROR") {
                    toast.error(errorData.error);

                    // If we have detailed information about which facilities have bookings
                    if (errorData.details) {
                        toast.error(errorData.details, { duration: 5000 });
                    }

                    setIsDeleteLocationOpen(false);
                    return;
                }

                throw new Error('Failed to delete location');
            }

            // Remove the location from our state
            setLocations(locations.filter(loc => loc.id !== selectedLocation.id));
            setSelectedLocation(null);
            setIsDeleteLocationOpen(false);

            toast.success(t('success.delete'));
        } catch (error) {
            console.error('Error deleting location:', error);
            toast.error(t('error.delete'));
        }
    }

    const handleOpenEditDialog = (location: Location) => {
        setSelectedLocation(location)
        setNewLocation({
            name: location.name,
            address: location.address,
            postalCode: location.postalCode || "",
            country: location.country || ""
        })
        setIsEditLocationOpen(true)
    }

    const handleOpenDeleteDialog = (location: Location) => {
        setSelectedLocation(location)
        setIsDeleteLocationOpen(true)
    }

    const handleCancelDelete = () => {
        setIsDeleteLocationOpen(false)
        setSelectedLocation(null)
    }

    // Reset errors when dialog is closed
    useEffect(() => {
        if (!isAddLocationOpen && !isEditLocationOpen) {
            setErrors({});
        }
    }, [isAddLocationOpen, isEditLocationOpen]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">{t('loading')}</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{t('yourLocations')}</h2>
                <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            {t('addLocation')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>{t('addNewLocation')}</DialogTitle>
                            <DialogDescription>
                                {t('addNewLocationDescription')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="flex">
                                    {t('locationName')}
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={newLocation.name}
                                    onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
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
                                <Label htmlFor="address" className="flex">
                                    {t('address')}
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={newLocation.address}
                                    onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
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
                                    <Label htmlFor="postalCode">{t('postalCode')}</Label>
                                    <Input
                                        id="postalCode"
                                        name="postalCode"
                                        value={newLocation.postalCode}
                                        onChange={e => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                                        placeholder={t('postalCodePlaceholder')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">{t('country')}</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        value={newLocation.country}
                                        onChange={e => setNewLocation({ ...newLocation, country: e.target.value })}
                                        placeholder={t('countryPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddLocationOpen(false)}>
                                {t('cancel')}
                            </Button>
                            <Button onClick={handleAddLocation} type="submit">
                                {t('addLocation')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {locations.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-lg text-muted-foreground">{t('noLocations')}</p>
                    <Button onClick={() => setIsAddLocationOpen(true)} variant="link" className="mt-2">
                        {t('createFirstLocation')}
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {locations.map((location) => (
                        <Card
                            key={location.id}
                            className="flex flex-col"
                            data-location-id={location.id}
                        >
                            <Link href={`/dashboard/facilities/${location.id}`} passHref>
                                <CardHeader>
                                    <CardTitle>{location.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {location.address}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Building className="h-4 w-4" />
                                        <span>{location.facilitiesCount} {t('facilities')}</span>
                                    </div>
                                </CardContent>
                            </Link>
                            <CardFooter className="flex justify-between mt-auto">
                                <Button variant="outline" className="flex items-center gap-1" asChild>
                                    <Link href={`/dashboard/locations/${location.id}/facilities`}>
                                        <Plus className="h-4 w-4" />
                                        {t('facilities')}
                                    </Link>
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleOpenEditDialog(location)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleOpenDeleteDialog(location)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Location Dialog */}
            <Dialog open={isEditLocationOpen} onOpenChange={setIsEditLocationOpen}>
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
                                value={newLocation.name}
                                onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
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
                                value={newLocation.address}
                                onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
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
                                    value={newLocation.postalCode}
                                    onChange={e => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                                    placeholder={t('postalCodePlaceholder')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-country">{t('country')}</Label>
                                <Input
                                    id="edit-country"
                                    name="country"
                                    value={newLocation.country}
                                    onChange={e => setNewLocation({ ...newLocation, country: e.target.value })}
                                    placeholder={t('countryPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditLocationOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleEditLocation} type="submit">
                            {t('saveChanges')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Location Dialog */}
            <DeleteConfirmationDialog
                open={isDeleteLocationOpen}
                onOpenChange={setIsDeleteLocationOpen}
                onConfirm={handleDeleteLocation}
                onCancel={handleCancelDelete}
                title={t('deleteLocation')}
                description={t('deleteLocationConfirmation')}
                warningMessage={t('deleteFacilitiesWarning')}
                cancelText={t('cancel')}
                confirmText={t('deleteConfirm')}
                showWarningOnConfirm={true}
                itemDetails={
                    selectedLocation && (
                        <>
                            <p className="font-medium">
                                {selectedLocation.name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {selectedLocation.address}
                            </p>
                        </>
                    )
                }
            />
        </div>
    )
} 