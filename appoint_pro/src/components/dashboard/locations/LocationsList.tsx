"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MapPin, Building, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
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
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLocation)
            })

            if (!response.ok) throw new Error('Failed to add location')

            const addedLocation = await response.json()

            setLocations([...locations, {
                ...addedLocation,
                facilitiesCount: 0
            }])

            setNewLocation({ name: "", address: "", postalCode: "", country: "" })
            setIsAddLocationOpen(false)
            setErrors({})

            toast.success(t('success.add'))
        } catch (error) {
            console.error('Error adding location:', error)
            toast.error(t('error.add'))
        }
    }

    // Reset errors when dialog is closed
    useEffect(() => {
        if (!isAddLocationOpen) {
            setErrors({});
        }
    }, [isAddLocationOpen]);

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
                            <Link href={`/dashboard/locations/${location.id}`} passHref>
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
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
} 