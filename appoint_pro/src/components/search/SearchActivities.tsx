"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Euro, MapPin, Calendar, Clock, User, Filter, Tag } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useLanguage } from "@/contexts/LanguageContext"

// Dezelfde feature definities als in FacilitiesList.tsx
type FeatureCategory = 'sport' | 'surface' | 'indoor' | 'amenities'

type Feature = {
    id: string
    name: string
    category: FeatureCategory
}

// Beschikbare kenmerken
const availableFeatures: Feature[] = [
    // Sport types
    { id: 'tennis', name: 'Tennis', category: 'sport' },
    { id: 'basketball', name: 'Basketball', category: 'sport' },
    { id: 'volleyball', name: 'Volleyball', category: 'sport' },
    { id: 'football', name: 'Football', category: 'sport' },
    { id: 'badminton', name: 'Badminton', category: 'sport' },
    { id: 'squash', name: 'Squash', category: 'sport' },
    { id: 'swimming', name: 'Swimming', category: 'sport' },

    // Ondergrond types
    { id: 'clay', name: 'Clay', category: 'surface' },
    { id: 'hard', name: 'Hard court', category: 'surface' },
    { id: 'grass', name: 'Grass', category: 'surface' },
    { id: 'artificial-grass', name: 'Artificial grass', category: 'surface' },
    { id: 'carpet', name: 'Carpet', category: 'surface' },
    { id: 'wood', name: 'Wood', category: 'surface' },

    // Indoor / Outdoor
    { id: 'indoor', name: 'Indoor', category: 'indoor' },
    { id: 'outdoor', name: 'Outdoor', category: 'indoor' },
    { id: 'covered', name: 'Covered', category: 'indoor' },

    // Voorzieningen
    { id: 'changing-room', name: 'Changing room', category: 'amenities' },
    { id: 'shower', name: 'Shower', category: 'amenities' },
    { id: 'lighting', name: 'Lighting', category: 'amenities' },
    { id: 'parking', name: 'Parking', category: 'amenities' },
    { id: 'wheelchair-accessible', name: 'Wheelchair accessible', category: 'amenities' },
]

type Activity = {
    id: string
    title: string
    organization: string
    location: string
    date: string
    time: string
    price: number
    spots: number
    features: string[]
}

export function SearchActivities() {
    const [searchQuery, setSearchQuery] = useState("")
    const [priceRange, setPriceRange] = useState<string>("all")
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const { getTranslation } = useLanguage()

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = getTranslation(key);
        return typeof value === 'string' ? value : '';
    };

    // This would be replaced with actual data from your API
    const mockActivities: Activity[] = [
        {
            id: "1",
            title: "Tennis Court 1",
            organization: "SportCenter Pro Amsterdam",
            location: "Amsterdam",
            date: "2024-03-20",
            time: "14:00",
            price: 30,
            spots: 8,
            features: ['tennis', 'clay', 'indoor', 'lighting'],
        },
        {
            id: "2",
            title: "Tennis Court 2",
            organization: "SportCenter Pro Amsterdam",
            location: "Amsterdam",
            date: "2024-03-20",
            time: "15:00",
            price: 25,
            spots: 4,
            features: ['tennis', 'hard', 'outdoor', 'lighting'],
        },
        {
            id: "3",
            title: "Basketball Court",
            organization: "SportCenter Pro Amsterdam",
            location: "Amsterdam",
            date: "2024-03-21",
            time: "10:00",
            price: 40,
            spots: 10,
            features: ['basketball', 'wood', 'indoor', 'changing-room', 'shower'],
        },
        {
            id: "4",
            title: "Swimming Pool",
            organization: "SportCenter Pro Amsterdam",
            location: "Amsterdam",
            date: "2024-03-21",
            time: "11:00",
            price: 15,
            spots: 20,
            features: ['swimming', 'indoor', 'changing-room', 'shower'],
        },
        {
            id: "5",
            title: "Tennis Court 1",
            organization: "SportCenter Pro Utrecht",
            location: "Utrecht",
            date: "2024-03-22",
            time: "09:00",
            price: 28,
            spots: 6,
            features: ['tennis', 'hard', 'indoor', 'lighting'],
        },
        {
            id: "6",
            title: "Multifunctional Sports Hall",
            organization: "SportCenter Pro Utrecht",
            location: "Utrecht",
            date: "2024-03-22",
            time: "14:00",
            price: 50,
            spots: 30,
            features: ['basketball', 'volleyball', 'badminton', 'wood', 'indoor', 'lighting', 'changing-room', 'shower'],
        },
    ]

    const toggleFeature = (featureId: string) => {
        setSelectedFeatures(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId)
            } else {
                return [...prev, featureId]
            }
        })
    }

    const getFeaturesByCategory = (category: FeatureCategory): Feature[] => {
        return availableFeatures.filter(feature => feature.category === category)
    }

    const getFeatureName = (featureId: string): string => {
        const feature = availableFeatures.find(f => f.id === featureId)
        return feature ? feature.name : featureId
    }

    const filteredActivities = mockActivities.filter((activity) => {
        // Filter op zoekterm
        const matchesSearch =
            activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
            activity.location.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter op prijsklasse
        const matchesPriceRange = priceRange === "all" || (
            priceRange === "0-25" ? activity.price <= 25 :
                priceRange === "26-50" ? activity.price > 25 && activity.price <= 50 :
                    priceRange === "51+" ? activity.price > 50 : true
        )

        // Filter op geselecteerde kenmerken
        const matchesFeatures = selectedFeatures.length === 0 ||
            selectedFeatures.every(feature => activity.features.includes(feature))

        return matchesSearch && matchesPriceRange && matchesFeatures
    })

    const clearFilters = () => {
        setSelectedFeatures([])
        setPriceRange("all")
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <Input
                        placeholder="Zoek activiteiten, locaties, organisaties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <span>{getString('search.activities.filters.button')}</span>
                            {selectedFeatures.length > 0 && (
                                <Badge className="ml-1">{selectedFeatures.length}</Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{getString('search.activities.filters.title')}</SheetTitle>
                            <SheetDescription>
                                {getString('search.activities.filters.description')}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="py-6 space-y-6">
                            {/* Prijs filter */}
                            <div className="space-y-2">
                                <Label>{getString('search.activities.filters.price.label')}</Label>
                                <Select value={priceRange} onValueChange={setPriceRange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={getString('search.activities.filters.price.placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{getString('search.activities.filters.price.all')}</SelectItem>
                                        <SelectItem value="0-25">{getString('search.activities.filters.price.low')}</SelectItem>
                                        <SelectItem value="26-50">{getString('search.activities.filters.price.medium')}</SelectItem>
                                        <SelectItem value="51+">{getString('search.activities.filters.price.high')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Kenmerken filters */}
                            <Accordion type="multiple" defaultValue={['sport']}>
                                <AccordionItem value="sport">
                                    <AccordionTrigger>{getString('search.activities.filters.categories.sport')}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('sport').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`sport-${feature.id}`}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={`sport-${feature.id}`}
                                                        className="text-sm leading-none"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="indoor">
                                    <AccordionTrigger>{getString('search.activities.filters.categories.indoorOutdoor')}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('indoor').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`indoor-${feature.id}`}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={`indoor-${feature.id}`}
                                                        className="text-sm leading-none"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="surface">
                                    <AccordionTrigger>{getString('search.activities.filters.categories.surface')}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('surface').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`surface-${feature.id}`}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={`surface-${feature.id}`}
                                                        className="text-sm leading-none"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="amenities">
                                    <AccordionTrigger>{getString('search.activities.filters.categories.amenities')}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('amenities').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`amenities-${feature.id}`}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={`amenities-${feature.id}`}
                                                        className="text-sm leading-none"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" onClick={clearFilters}>{getString('search.activities.filters.actions.clear')}</Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button>{getString('search.activities.filters.actions.apply')}</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredActivities.map((activity) => (
                    <Card key={activity.id} className="flex flex-col overflow-hidden">
                        <div className="p-6 space-y-3">
                            <div className="space-y-1">
                                <h3 className="font-semibold">{activity.title}</h3>
                                <p className="text-sm text-muted-foreground">{activity.organization}</p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{activity.location}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{activity.date}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{activity.time}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Euro className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{getString('search.activities.card.price').replace('{price}', String(activity.price))}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{getString('search.activities.card.spots').replace('{spots}', String(activity.spots))}</span>
                                </div>

                                {/* Kenmerken weergeven */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                        <Tag className="h-4 w-4" />
                                        <span>{getString('search.activities.card.features')}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {activity.features.map(featureId => (
                                            <Badge key={featureId} variant="secondary" className="text-xs">
                                                {getFeatureName(featureId)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t mt-auto">
                            <Button className="w-full">{getString('search.activities.card.reserve')}</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredActivities.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-lg text-muted-foreground">{getString('search.activities.noResults')}</p>
                </div>
            )}
        </div>
    )
} 