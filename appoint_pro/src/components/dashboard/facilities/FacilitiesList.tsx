"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash, Euro, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

// Typen voor kenmerken
type FeatureCategory = 'sport' | 'surface' | 'indoor' | 'amenities'

type Feature = {
    id: string
    name: string
    category: FeatureCategory
}

type Facility = {
    id: string
    name: string
    description: string
    price: number
    features: { id: string; name: string; category: string }[]
}

type Location = {
    id: string
    name: string
    address: string
}

interface FacilitiesListProps {
    locationId: string
}

export function FacilitiesList({ locationId }: FacilitiesListProps) {
    const [location, setLocation] = useState<Location | null>(null)
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false)
    const [newFacility, setNewFacility] = useState<Omit<Facility, "id">>({
        name: "",
        description: "",
        price: 0,
        features: []
    })
    const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { getTranslation } = useLanguage();

    // Fetch data from an API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch location data
                const locationResponse = await fetch(`/api/locations/${locationId}`)
                if (!locationResponse.ok) throw new Error(getTranslation('errors.fetchLocationFailed'))
                const locationData = await locationResponse.json()
                setLocation(locationData)

                // Fetch facilities for this location
                const facilitiesResponse = await fetch(`/api/locations/${locationId}/facilities`)
                if (!facilitiesResponse.ok) throw new Error(getTranslation('errors.fetchFacilitiesFailed'))
                const facilitiesData = await facilitiesResponse.json()
                setFacilities(facilitiesData)

                // Fetch all available features
                const featuresResponse = await fetch('/api/features')
                if (!featuresResponse.ok) throw new Error(getTranslation('errors.fetchFeaturesFailed'))
                const featuresData = await featuresResponse.json()
                setAvailableFeatures(featuresData)

            } catch (error) {
                console.error('Error fetching data:', error)
                toast.error(getTranslation('errors.fetchDataFailed'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [locationId, getTranslation])

    const handleAddFacility = async () => {
        try {
            // In de echte implementatie zou je deze API call maken
            // const response = await fetch(`/api/locations/${locationId}/facilities`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(newFacility)
            // })
            // if (!response.ok) throw new Error('Failed to add facility')
            // const addedFacility = await response.json()

            // Voor demo doeleinden
            const addedFacility: Facility = {
                ...newFacility,
                id: `${facilities.length + 1}`,
                features: newFacility.features,
            }

            setFacilities([...facilities, addedFacility])
            setNewFacility({ name: "", description: "", price: 0, features: [] })
            setIsAddFacilityOpen(false)

            toast.success(getTranslation('facilities.addSuccess'))
        } catch (error) {
            console.error('Error adding facility:', error)
            toast.error(getTranslation('errors.addFacilityFailed'))
        }
    }

    const toggleFeature = (feature: Feature) => {
        setNewFacility(prev => {
            const isFeatureSelected = prev.features.some(f => f.id === feature.id)

            if (isFeatureSelected) {
                return {
                    ...prev,
                    features: prev.features.filter(f => f.id !== feature.id)
                }
            } else {
                return {
                    ...prev,
                    features: [...prev.features, feature]
                }
            }
        })
    }

    const getFeaturesByCategory = (category: FeatureCategory): Feature[] => {
        return availableFeatures.filter(feature => feature.category === category) as Feature[]
    }

    if (isLoading) {
        return <div className="flex justify-center py-8">{getTranslation('common.loading')}</div>
    }

    if (!location) {
        return <div className="py-8">{getTranslation('errors.locationNotFound')}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                <div>
                    <h2 className="text-2xl font-semibold">{location.name}</h2>
                    <p className="text-muted-foreground">{location.address}</p>
                </div>
                <Dialog open={isAddFacilityOpen} onOpenChange={setIsAddFacilityOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            {getTranslation('facilities.addNew')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[650px]">
                        <DialogHeader>
                            <DialogTitle>{getTranslation('facilities.addNewTitle')}</DialogTitle>
                            <DialogDescription>
                                {getTranslation('facilities.addNewDescription')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{getTranslation('facilities.name')}</Label>
                                <Input
                                    id="name"
                                    value={newFacility.name}
                                    onChange={e => setNewFacility({ ...newFacility, name: e.target.value })}
                                    placeholder={getTranslation('facilities.namePlaceholder')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">{getTranslation('facilities.description')}</Label>
                                <Textarea
                                    id="description"
                                    value={newFacility.description}
                                    onChange={e => setNewFacility({ ...newFacility, description: e.target.value })}
                                    placeholder={getTranslation('facilities.descriptionPlaceholder')}
                                    rows={3}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">{getTranslation('facilities.price')}</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={newFacility.price}
                                    onChange={e => setNewFacility({ ...newFacility, price: parseFloat(e.target.value) })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-base">{getTranslation('facilities.features')}</Label>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Sport Types */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{getTranslation('facilities.sportTypes')}</Label>
                                        <div className="grid gap-2">
                                            {getFeaturesByCategory('sport').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`feature-${feature.id}`}
                                                        checked={newFacility.features.some(f => f.id === feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature)}
                                                    />
                                                    <label
                                                        htmlFor={`feature-${feature.id}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Indoor/Outdoor */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{getTranslation('facilities.indoorOutdoor')}</Label>
                                        <div className="grid gap-2">
                                            {getFeaturesByCategory('indoor').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`feature-${feature.id}`}
                                                        checked={newFacility.features.some(f => f.id === feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature)}
                                                    />
                                                    <label
                                                        htmlFor={`feature-${feature.id}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Surface Type */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{getTranslation('facilities.surfaceType')}</Label>
                                        <div className="grid gap-2">
                                            {getFeaturesByCategory('surface').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`feature-${feature.id}`}
                                                        checked={newFacility.features.some(f => f.id === feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature)}
                                                    />
                                                    <label
                                                        htmlFor={`feature-${feature.id}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{getTranslation('facilities.amenities')}</Label>
                                        <div className="grid gap-2">
                                            {getFeaturesByCategory('amenities').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`feature-${feature.id}`}
                                                        checked={newFacility.features.some(f => f.id === feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature)}
                                                    />
                                                    <label
                                                        htmlFor={`feature-${feature.id}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddFacilityOpen(false)}>
                                {getTranslation('common.cancel')}
                            </Button>
                            <Button onClick={handleAddFacility}>
                                {getTranslation('facilities.addFacility')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {facilities.map((facility) => (
                    <Card key={facility.id}>
                        <CardHeader>
                            <CardTitle>{facility.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">{facility.description}</p>

                            <div className="flex items-center gap-1 text-sm font-medium">
                                <Euro className="h-4 w-4" />
                                <span>{facility.price.toFixed(2)} {getTranslation('facilities.perHour')}</span>
                            </div>

                            {/* Kenmerken weergeven */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Tag className="h-4 w-4" />
                                    <span>{getTranslation('facilities.features')}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {facility.features.map(feature => (
                                        <Badge key={feature.id} variant="secondary">
                                            {feature.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Trash className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {facilities.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-lg text-muted-foreground">{getTranslation('facilities.noFacilities')}</p>
                    <Button onClick={() => setIsAddFacilityOpen(true)} variant="link" className="mt-2">
                        {getTranslation('facilities.addFirstFacility')}
                    </Button>
                </div>
            )}
        </div>
    )
} 