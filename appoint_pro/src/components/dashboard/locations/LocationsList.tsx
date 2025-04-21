"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MapPin, Building, Edit, Trash, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { toast } from "sonner"

type Location = {
    id: string
    name: string
    address: string
    postalCode?: string
    country?: string
    facilitiesCount: number
}

export function LocationsList() {
    const [locations, setLocations] = useState<Location[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
    const [newLocation, setNewLocation] = useState<Omit<Location, "id" | "facilitiesCount">>({
        name: "",
        address: "",
        postalCode: "",
        country: "",
    })

    // Fetch locations from the API
    useEffect(() => {
        const fetchLocations = async () => {
            setIsLoading(true)
            try {
                const response = await fetch('/api/locations')
                if (!response.ok) throw new Error('Failed to fetch locations')

                let locationsData = await response.json()

                // Format the data to match our component's expected format
                locationsData = locationsData.map((location: any) => ({
                    id: location.id,
                    name: location.name,
                    address: location.address,
                    postalCode: location.postalCode || "",
                    country: location.country || "",
                    facilitiesCount: location._count?.facilities || 0
                }))

                setLocations(locationsData)
            } catch (error) {
                console.error('Error fetching locations:', error)
                toast.error('Er is een fout opgetreden bij het ophalen van de locaties')
                // Set mock data for demo purposes if API fails
                setMockData()
            } finally {
                setIsLoading(false)
            }
        }

        fetchLocations()
    }, [])

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

    const handleAddLocation = async () => {
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

            toast.success('Locatie succesvol toegevoegd')
        } catch (error) {
            console.error('Error adding location:', error)
            toast.error('Er is een fout opgetreden bij het toevoegen van de locatie')

            // For demo fallback if API fails
            const newLocationWithId: Location = {
                ...newLocation,
                id: `${locations.length + 1}`,
                facilitiesCount: 0,
            }
            setLocations([...locations, newLocationWithId])
            setNewLocation({ name: "", address: "", postalCode: "", country: "" })
            setIsAddLocationOpen(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Locaties laden...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Uw locaties</h2>
                <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Nieuwe locatie
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>Voeg een nieuwe locatie toe</DialogTitle>
                            <DialogDescription>
                                Vul de details in van de nieuwe sportlocatie
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Naam locatie</Label>
                                <Input
                                    id="name"
                                    value={newLocation.name}
                                    onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                                    placeholder="Bijv. SportCenter Amsterdam"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Adres</Label>
                                <Input
                                    id="address"
                                    value={newLocation.address}
                                    onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
                                    placeholder="Straat en huisnummer"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="postalCode">Postcode</Label>
                                    <Input
                                        id="postalCode"
                                        value={newLocation.postalCode}
                                        onChange={e => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                                        placeholder="1234 AB"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Land</Label>
                                    <Input
                                        id="country"
                                        value={newLocation.country}
                                        onChange={e => setNewLocation({ ...newLocation, country: e.target.value })}
                                        placeholder="Nederland"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddLocationOpen(false)}>Annuleren</Button>
                            <Button onClick={handleAddLocation}>Locatie toevoegen</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {locations.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-lg text-muted-foreground">Er zijn nog geen locaties toegevoegd.</p>
                    <Button onClick={() => setIsAddLocationOpen(true)} variant="link" className="mt-2">
                        Voeg je eerste locatie toe
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {locations.map((location) => (
                        <Card key={location.id} className="flex flex-col">
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
                                    <span>{location.facilitiesCount} faciliteiten</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between mt-auto">
                                <Button variant="outline" className="flex items-center gap-1" asChild>
                                    <Link href={`/dashboard/locations/${location.id}/facilities`}>
                                        <Plus className="h-4 w-4" />
                                        Faciliteiten
                                    </Link>
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
} 