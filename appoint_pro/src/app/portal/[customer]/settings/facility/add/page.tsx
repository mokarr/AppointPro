"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Toaster  } from "@/components/"
import { LocationCombobox } from "@/components/input/location-combobox"

const AddFacilityPage = () => {
    const [location, setLocation] = useState("")

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(location)
        // toast({
        //     title: "Form Submitted",
        //     description: `Selected location: ${location}`,
        // })
    }

    return (
        <div>
            <h1>Add Facility</h1>

            <form onSubmit={onSubmit} className="space-y-4">
                <Input name="name" placeholder="Facility Name" required autoComplete="name" />

                <LocationCombobox value={location} onChange={setLocation} />

                <Button className="w-full" type="submit">
                    Add Facility
                </Button>
            </form>
        </div>
    )
}

export default AddFacilityPage
