import { SearchActivities } from "@/components/search/SearchActivities"

export const metadata = {
    title: "Search Activities | AppointPro",
    description: "Find and filter sports activities from various organizations",
}

export default function SearchActivitiesPage() {
    return (
        <main className="container mx-auto py-8 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Find Activities</h1>
                    <p className="text-muted-foreground">
                        Discover and filter through sports activities from various organizations
                    </p>
                </div>
                <SearchActivities />
            </div>
        </main>
    )
} 