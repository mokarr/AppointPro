'use client';

import { Button } from "@/components/ui/button";

interface SaveButtonProps {
    onSave: () => void;
}

export const SaveButton = ({ onSave }: SaveButtonProps) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-end">
                <Button 
                    onClick={onSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                    Opslaan
                </Button>
            </div>
        </div>
    );
}; 