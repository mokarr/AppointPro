import React, { useState } from 'react';

interface OpeningHoursSettingsProps {
    openingHours: Record<string, { open: string; close: string }>;
    onSave: (openingHours: Record<string, { open: string; close: string }>) => void;
}

const OpeningHoursSettings: React.FC<OpeningHoursSettingsProps> = ({ openingHours, onSave }) => {
    const [localOpeningHours, setLocalOpeningHours] = useState(openingHours);

    const handleChange = (day: string, field: 'open' | 'close', value: string) => {
        setLocalOpeningHours({ ...localOpeningHours, [day]: { ...localOpeningHours[day], [field]: value } });
    };

    const handleSave = () => {
        onSave(localOpeningHours);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Opening Hours
            </h2>
            <div className="space-y-4">
                {Object.entries(localOpeningHours).map(([day, hours]) => (
                    <div key={day} className="flex flex-col">
                        <label className="text-gray-600 dark:text-gray-300 mb-2">{day}</label>
                        <div className="flex gap-4">
                            <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleChange(day, 'open', e.target.value)}
                                className="mb-4 p-2 border rounded"
                            />
                            <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleChange(day, 'close', e.target.value)}
                                className="mb-4 p-2 border rounded"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">
                Save Opening Hours
            </button>
        </div>
    );
};

export default OpeningHoursSettings; 