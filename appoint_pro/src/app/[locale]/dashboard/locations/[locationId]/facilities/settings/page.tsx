import React from 'react';

export const metadata = {
    title: "Faciliteiten-instellingen | AppointPro",
    description: "Beheer de instellingen van uw faciliteiten",
};

export default function FacilitiesSettingsPage({ params }: { params: { locationId: string } }) {
    const { locationId } = params;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Faciliteiten-instellingen</h1>
                    <p className="text-muted-foreground">
                        Beheer de instellingen van uw faciliteiten
                    </p>
                </div>
                {/* Add facilities settings component here */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Hier kunt u de instellingen van uw faciliteiten beheren.
                    </p>
                </div>
            </div>
        </div>
    );
} 