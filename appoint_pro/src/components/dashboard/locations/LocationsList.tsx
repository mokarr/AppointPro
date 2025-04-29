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
import { useLanguage } from "@/contexts/LanguageContext"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

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
    const { getTranslation } = useLanguage();
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

                setLocations(formattedLocations)
            } catch (error) {
                console.error('Error fetching locations:', error)
                toast.error(getTranslation('dashboard.locations.error.fetch'))
                // Set mock data for demo purposes if API fails
                setMockData()
            } finally {
                setIsLoading(false)
            }
        }

        fetchLocations()
    }, [getTranslation])

    // Mock data fallback for demo purposes
    const setMockData = () => {
        setLocations([
            {
                id: "1",
                name: "SportCenter Pro - Amsterdam",
                address: "Sportlaan 123, 1234 AB, Amsterdam",
                postalCode: "1234 AB",
                country: "Netherlands",
                facilitiesCount: 4,
            },
            {
                id: "2",
                name: "SportCenter Pro - Utrecht",
                address: "Olympialaan 45, 3543 CC, Utrecht",
                postalCode: "3543 CC",
                country: "Netherlands",
                facilitiesCount: 3,
            },
        ])
    }

    const validateForm = () => {
        const newErrors: { name?: string; address?: string } = {};
        let isValid = true;

        if (!newLocation.name.trim()) {
            newErrors.name = getTranslation('dashboard.locations.error.nameRequired') || 'Name is required';
            isValid = false;
        }

        if (!newLocation.address.trim()) {
            newErrors.address = getTranslation('dashboard.locations.error.addressRequired') || 'Address is required';
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

            toast.success(getTranslation('dashboard.locations.success.add'))
        } catch (error) {
            console.error('Error adding location:', error)
            toast.error(getTranslation('dashboard.locations.error.add'))

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

            toast.success(getTranslation('dashboard.locations.success.update'))
        } catch (error) {
            console.error('Error updating location:', error)
            toast.error(getTranslation('dashboard.locations.error.update'))

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

            toast.success(getTranslation('dashboard.locations.success.delete'));
        } catch (error) {
            console.error('Error deleting location:', error);
            toast.error(getTranslation('dashboard.locations.error.delete'));
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
                <span className="ml-2 text-muted-foreground">{getTranslation('dashboard.locations.loading')}</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{getTranslation('dashboard.locations.yourLocations')}</h2>
                <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            {getTranslation('dashboard.locations.addLocation')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>{getTranslation('dashboard.locations.addNewLocation')}</DialogTitle>
                            <DialogDescription>
                                {getTranslation('dashboard.locations.addNewLocationDescription')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="flex">
                                    {getTranslation('dashboard.locations.locationName')}
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={newLocation.name}
                                    onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                                    placeholder={getTranslation('dashboard.locations.locationNamePlaceholder')}
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
                                    {getTranslation('dashboard.locations.address')}
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={newLocation.address}
                                    onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
                                    placeholder={getTranslation('dashboard.locations.addressPlaceholder')}
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
                                    <Label htmlFor="postalCode">{getTranslation('dashboard.locations.postalCode')}</Label>
                                    <Input
                                        id="postalCode"
                                        name="postalCode"
                                        value={newLocation.postalCode}
                                        onChange={e => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                                        placeholder={getTranslation('dashboard.locations.postalCodePlaceholder')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">{getTranslation('dashboard.locations.country')}</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        value={newLocation.country}
                                        onChange={e => setNewLocation({ ...newLocation, country: e.target.value })}
                                        placeholder={getTranslation('dashboard.locations.countryPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddLocationOpen(false)}>
                                {getTranslation('dashboard.locations.cancel')}
                            </Button>
                            <Button onClick={handleAddLocation} type="submit">
                                {getTranslation('dashboard.locations.addLocation')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {locations.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-lg text-muted-foreground">{getTranslation('dashboard.locations.noLocations')}</p>
                    <Button onClick={() => setIsAddLocationOpen(true)} variant="link" className="mt-2">
                        {getTranslation('dashboard.locations.createFirstLocation')}
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
                                    <span>{location.facilitiesCount} {getTranslation('dashboard.locations.facilities')}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between mt-auto">
                                <Button variant="outline" className="flex items-center gap-1" asChild>
                                    <Link href={`/dashboard/locations/${location.id}/facilities`}>
                                        <Plus className="h-4 w-4" />
                                        {getTranslation('dashboard.locations.facilities')}
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
                        <DialogTitle>{getTranslation('dashboard.locations.editLocation')}</DialogTitle>
                        <DialogDescription>
                            {getTranslation('dashboard.locations.editLocationDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name" className="flex">
                                {getTranslation('dashboard.locations.locationName')}
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={newLocation.name}
                                onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                                placeholder={getTranslation('dashboard.locations.locationNamePlaceholder')}
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
                                {getTranslation('dashboard.locations.address')}
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="edit-address"
                                name="address"
                                value={newLocation.address}
                                onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
                                placeholder={getTranslation('dashboard.locations.addressPlaceholder')}
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
                                <Label htmlFor="edit-postalCode">{getTranslation('dashboard.locations.postalCode')}</Label>
                                <Input
                                    id="edit-postalCode"
                                    name="postalCode"
                                    value={newLocation.postalCode}
                                    onChange={e => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                                    placeholder={getTranslation('dashboard.locations.postalCodePlaceholder')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-country">{getTranslation('dashboard.locations.country')}</Label>
                                <Input
                                    id="edit-country"
                                    name="country"
                                    value={newLocation.country}
                                    onChange={e => setNewLocation({ ...newLocation, country: e.target.value })}
                                    placeholder={getTranslation('dashboard.locations.countryPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditLocationOpen(false)}>
                            {getTranslation('dashboard.locations.cancel')}
                        </Button>
                        <Button onClick={handleEditLocation} type="submit">
                            {getTranslation('dashboard.locations.saveChanges')}
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
                title={getTranslation('dashboard.locations.deleteLocation')}
                description={getTranslation('dashboard.locations.deleteLocationConfirmation')}
                warningMessage={getTranslation('dashboard.locations.deleteFacilitiesWarning')}
                cancelText={getTranslation('dashboard.locations.cancel')}
                confirmText={getTranslation('dashboard.locations.deleteConfirm')}
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