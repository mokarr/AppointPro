"use client"

import { useState, useEffect } from "react"
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
import { Euro, MapPin, Calendar, Clock, User, Filter, Tag, Loader2 } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"
import { useDebounce } from "@/hooks/useDebounce"
import { useTranslations } from "next-intl"
// Feature definitions
type FeatureCategory = 'sport' | 'surface' | 'indoor' | 'amenities'

type Feature = {
    id: string
    name: string
    category: FeatureCategory
}

type Facility = {
    id: string
    title: string
    organization: string
    organizationSubdomain: string
    location: string
    address?: string
    price: number
    availableSpots?: number
    features: string[]
    openingHours?: {
        open: string
        close: string
    }
}

// Available features
const availableFeatures: Feature[] = [
    // Sport types
    { id: 'sport-tennis', name: 'Tennis', category: 'sport' },
    { id: 'sport-basketball', name: 'Basketball', category: 'sport' },
    { id: 'sport-volleyball', name: 'Volleyball', category: 'sport' },
    { id: 'sport-football', name: 'Football', category: 'sport' },
    { id: 'sport-badminton', name: 'Badminton', category: 'sport' },
    { id: 'sport-squash', name: 'Squash', category: 'sport' },
    { id: 'sport-swimming', name: 'Swimming', category: 'sport' },

    // Surface types
    { id: 'surface-clay', name: 'Clay', category: 'surface' },
    { id: 'surface-hard', name: 'Hard court', category: 'surface' },
    { id: 'surface-grass', name: 'Grass', category: 'surface' },
    { id: 'surface-artificial-grass', name: 'Artificial grass', category: 'surface' },
    { id: 'surface-carpet', name: 'Carpet', category: 'surface' },
    { id: 'surface-wood', name: 'Wood', category: 'surface' },

    // Indoor / Outdoor
    { id: 'indoor-indoor', name: 'Indoor', category: 'indoor' },
    { id: 'indoor-outdoor', name: 'Outdoor', category: 'indoor' },
    { id: 'indoor-covered', name: 'Covered', category: 'indoor' },

    // Amenities
    { id: 'amenities-changing-room', name: 'Changing room', category: 'amenities' },
    { id: 'amenities-shower', name: 'Shower', category: 'amenities' },
    { id: 'amenities-lighting', name: 'Lighting', category: 'amenities' },
    { id: 'amenities-parking', name: 'Parking', category: 'amenities' },
    { id: 'amenities-wheelchair-accessible', name: 'Wheelchair accessible', category: 'amenities' },
]

export function SearchActivities() {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [priceRange, setPriceRange] = useState<string>("all")
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const t = useTranslations('user')

    // Debounce search query to prevent excessive API calls
    const debouncedSearch = useDebounce(searchQuery, 500)

    useEffect(() => {
        setDebouncedSearchQuery(debouncedSearch)
    }, [debouncedSearch])


    // Fetch facilities from API
    const fetchFacilities = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Build query parameters
            const queryParams = new URLSearchParams()

            if (debouncedSearchQuery) {
                queryParams.append('search', debouncedSearchQuery)
            }

            if (priceRange !== 'all') {
                // Parse price range for API
                if (priceRange === '0-25') {
                    queryParams.append('minPrice', '0')
                    queryParams.append('maxPrice', '25')
                } else if (priceRange === '26-50') {
                    queryParams.append('minPrice', '26')
                    queryParams.append('maxPrice', '50')
                } else if (priceRange === '51+') {
                    queryParams.append('minPrice', '51')
                }
            }

            if (selectedFeatures.length > 0) {
                selectedFeatures.forEach(feature => {
                    queryParams.append('features', feature)
                })
            }

            // Make the API call
            const response = await fetch(`/api/facilities?${queryParams.toString()}`)

            if (!response.ok) {
                throw new Error(`Error fetching facilities: ${response.status}`)
            }

            const data = await response.json()
            setFacilities(data)
            setFilteredFacilities(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
            toast({
                title: t('search.facilities.error.title') || 'Error',
                description: t('search.facilities.error.description') || 'Failed to load facilities',
                variant: "destructive",
            })

            // Fallback to empty array
            setFacilities([])
            setFilteredFacilities([])
        } finally {
            setIsLoading(false)
        }
    }

    // Filter facilities client-side (as a backup or for additional filtering)
    const filterFacilities = () => {
        const filtered = facilities.filter((facility) => {
            // Filter on search term if not already handled by API
            const matchesSearch = !debouncedSearchQuery ||
                facility.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                facility.organization.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                facility.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                (facility.address && facility.address.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))

            // Filter on price range if not already handled by API
            const matchesPriceRange = priceRange === "all" || (
                priceRange === "0-25" ? facility.price <= 25 :
                    priceRange === "26-50" ? facility.price > 25 && facility.price <= 50 :
                        priceRange === "51+" ? facility.price > 50 : true
            )

            // Filter on selected features if not already handled by API
            const matchesFeatures = selectedFeatures.length === 0 ||
                selectedFeatures.every(feature => facility.features.includes(feature))

            return matchesSearch && matchesPriceRange && matchesFeatures
        })

        setFilteredFacilities(filtered)
    }

    // Fetch facilities when filters change (including initial fetch)
    useEffect(() => {
        fetchFacilities()
    }, [debouncedSearchQuery, priceRange, selectedFeatures]) // eslint-disable-line react-hooks/exhaustive-deps

    // Client-side filtering as backup
    useEffect(() => {
        filterFacilities()
    }, [facilities]) // eslint-disable-line react-hooks/exhaustive-deps

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

    const clearFilters = () => {
        setSelectedFeatures([])
        setPriceRange("all")
    }

    // Handle booking a facility
    const handleBookFacility = (facility: Facility) => {
        // Create URL to the organization's subdomain booking page with facility ID
        const protocol = window.location.protocol
        const domain = window.location.hostname.split('.').slice(-2).join('.')
        const port = window.location.port ? `:${window.location.port}` : ''

        // Construct the URL - using subdomain.domain.com/book/facilityId format
        const bookingUrl = `${protocol}//${facility.organizationSubdomain}.${domain}${port}/book/${facility.id}`

        // Navigate to the booking URL
        window.location.href = bookingUrl
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <Input
                        placeholder="Search facilities, locations, organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                        aria-label="Search facilities"
                    />
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <span>{t('search.facilities.filters.button') || 'Filters'}</span>
                            {selectedFeatures.length > 0 && (
                                <Badge className="ml-1">{selectedFeatures.length}</Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{t('search.facilities.filters.title') || 'Filters'}</SheetTitle>
                            <SheetDescription>
                                {t('search.facilities.filters.description') || 'Filter facilities by criteria'}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="py-6 space-y-6">
                            {/* Price filter */}
                            <div className="space-y-2">
                                <Label>{t('search.facilities.filters.price.label') || 'Price'}</Label>
                                <Select value={priceRange} onValueChange={setPriceRange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('search.facilities.filters.price.placeholder') || 'Select price range'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('search.facilities.filters.price.all') || 'All prices'}</SelectItem>
                                        <SelectItem value="0-25">{t('search.facilities.filters.price.low') || '€0 - €25'}</SelectItem>
                                        <SelectItem value="26-50">{t('search.facilities.filters.price.medium') || '€26 - €50'}</SelectItem>
                                        <SelectItem value="51+">{t('search.facilities.filters.price.high') || '€51+'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Feature filters */}
                            <Accordion type="multiple" defaultValue={['sport-category']}>
                                <AccordionItem value="sport-category">
                                    <AccordionTrigger>{t('search.facilities.filters.categories.sport') || 'Sport'}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('sport').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={feature.id}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={feature.id}
                                                        className="text-sm leading-none"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="indoor-outdoor">
                                    <AccordionTrigger>{t('search.facilities.filters.categories.indoorOutdoor') || 'Indoor/Outdoor'}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('indoor').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={feature.id}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={feature.id}
                                                        className="text-sm leading-none"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="surface-type">
                                    <AccordionTrigger>{t('search.facilities.filters.categories.surface') || 'Surface'}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('surface').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={feature.id}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={feature.id}
                                                        className="text-sm leading-none"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="amenities-list">
                                    <AccordionTrigger>{t('search.facilities.filters.categories.amenities') || 'Amenities'}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getFeaturesByCategory('amenities').map(feature => (
                                                <div key={feature.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={feature.id}
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onCheckedChange={() => toggleFeature(feature.id)}
                                                    />
                                                    <label
                                                        htmlFor={feature.id}
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
                                <Button variant="outline" onClick={clearFilters}>{t('search.facilities.filters.actions.clear') || 'Clear'}</Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button>{t('search.facilities.filters.actions.apply') || 'Apply'}</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-10">
                    <p className="text-lg text-destructive">{t('search.facilities.error.message') || 'Failed to load facilities'}</p>
                    <Button
                        onClick={fetchFacilities}
                        variant="outline"
                        className="mt-4"
                    >
                        {t('search.facilities.error.retry') || 'Retry'}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredFacilities.map((facility) => (
                            <Card key={facility.id} className="flex flex-col overflow-hidden">
                                <div className="p-6 space-y-3">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{facility.title}</h3>
                                        <p className="text-sm text-muted-foreground">{facility.organization}</p>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{facility.location}</span>
                                        </div>
                                        {facility.openingHours && (
                                            <div className="flex items-start gap-2">
                                                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{facility.openingHours.open} - {facility.openingHours.close}</span>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2">
                                            <Euro className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{t('search.facilities.card.price', { price: facility.price })}</span>
                                        </div>
                                        {facility.availableSpots !== undefined && (
                                            <div className="flex items-start gap-2">
                                                <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{t('search.facilities.card.spots', { spots: facility.availableSpots })}</span>
                                            </div>
                                        )}

                                        {/* Features */}
                                        <div className="pt-2">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                                <Tag className="h-4 w-4" />
                                                <span>{t('search.facilities.card.features') || 'Features'}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {facility.features.map(featureId => (
                                                    <Badge key={featureId} variant="secondary" className="text-xs">
                                                        {getFeatureName(featureId)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t mt-auto">
                                    <Button
                                        className="w-full"
                                        onClick={() => handleBookFacility(facility)}
                                    >
                                        {t('search.facilities.card.reserve') || 'Book Now'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {filteredFacilities.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-lg text-muted-foreground">{t('search.facilities.noResults') || 'No facilities found'}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
} 