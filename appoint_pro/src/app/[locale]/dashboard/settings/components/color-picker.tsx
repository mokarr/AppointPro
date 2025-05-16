'use client';

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label: string;
}

export const ColorPicker = ({ value, onChange, label }: ColorPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempColor, setTempColor] = useState(value);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempColor(e.target.value);
    }, []);

    const handleClose = useCallback(() => {
        onChange(tempColor);
        setIsOpen(false);
    }, [tempColor, onChange]);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="flex items-center space-x-2">
                <div 
                    className="w-12 h-12 border rounded cursor-pointer"
                    style={{ backgroundColor: value }}
                    onClick={() => setIsOpen(true)}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-32 p-2 border rounded text-sm"
                />
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <input
                                type="color"
                                value={tempColor}
                                onChange={handleChange}
                                className="w-64 h-64"
                            />
                            <div className="mt-4 flex justify-end space-x-2">
                                <Button onClick={() => setIsOpen(false)} variant="outline">
                                    Annuleren
                                </Button>
                                <Button onClick={handleClose}>
                                    Toepassen
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 