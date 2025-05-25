import { cn } from "@/lib/utils";
import React from "react";

type BookingStep = {
    number: number;
    label: string;
    isCompleted?: boolean;
    isCurrent?: boolean;
};

type BookingIndicatorProps = {
    primaryColor: string;
    currentStep: number;
    isClassBooking?: boolean | null;
};

export function BookingIndicator({ primaryColor, currentStep, isClassBooking = null }: BookingIndicatorProps) {
    const steps: BookingStep[] = [
        { number: 1, label: "Type" },
        { number: 2, label: "Locatie" },
        { number: 3, label: isClassBooking === null ? "Keuze" : (isClassBooking ? "Les" : "Faciliteit") },
        { number: 4, label: "Tijdslot" },
        { number: 5, label: "Bevestiging" },
    ];

    const getStepStyle = (step: BookingStep) => {
        if (step.number < currentStep) {
            return {
                circle: "bg-green-600",
                text: "text-green-600"
            };
        }
        if (step.number === currentStep) {
            return {
                circle: "",
                text: ""
            };
        }
        return {
            circle: "bg-gray-300",
            text: "text-gray-600"
        };
    };

    return (
        <div className="mb-8 px-2">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center">
                            <div 
                                className={cn(
                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base",
                                    getStepStyle(step).circle
                                )}
                                style={step.number === currentStep ? { backgroundColor: primaryColor } : undefined}
                            >
                                {step.number < currentStep ? "✓" : step.number}
                            </div>
                            <span 
                                className={cn(
                                    "mt-2 font-medium text-xs sm:text-sm text-center max-w-[60px] sm:max-w-none",
                                    getStepStyle(step).text
                                )}
                                style={step.number === currentStep ? { color: primaryColor } : undefined}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={cn(
                                "h-1 flex-1 mx-1 sm:mx-4",
                                step.number < currentStep ? "bg-green-500" : "bg-gray-300"
                            )} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
