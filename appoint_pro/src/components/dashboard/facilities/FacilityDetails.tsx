import { Facility } from '@prisma/client';
import React from 'react';

interface FacilityDetailsProps {
    facility: Facility;
}

const FacilityDetails: React.FC<FacilityDetailsProps> = ({ facility }) => {
    // Fetch and display facility details using facilityId
    // Placeholder content for now
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Facility Details
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
                Details for facility ID: {facility.name}               
            </p>
            <p className="text-gray-600 dark:text-gray-300">
                Price: {facility.price}
            </p>
            {/* Add more facility-specific details here */}
        </div>
    );
};

export default FacilityDetails; 