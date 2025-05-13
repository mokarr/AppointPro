'use client';

import React, { useState } from 'react';

interface LocationSettingsProps {
    locationId: string;
}

const LocationSettings: React.FC<LocationSettingsProps> = ({ locationId }) => {
    const [settings, setSettings] = useState({
        openingHours: '',
        // Add more settings fields as needed
    });

    const handleSettingsChange = (field: string, value: string) => {
        setSettings({ ...settings, [field]: value });
    };

    const saveSettings = () => {
        // Implement save logic here
        console.log('Settings saved for location:', locationId, settings);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Location Settings
            </h2>
            <div className="flex flex-col">
                <label className="text-gray-600 dark:text-gray-300 mb-2">Opening Hours</label>
                <input
                    type="text"
                    value={settings.openingHours}
                    onChange={(e) => handleSettingsChange('openingHours', e.target.value)}
                    className="mb-4 p-2 border rounded"
                />
                <button onClick={saveSettings} className="bg-blue-500 text-white p-2 rounded">
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default LocationSettings; 