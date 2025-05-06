"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { BookingConfirmationInput } from '@/models/BookingConfirmationInput';

interface Props {
    bookingData: BookingConfirmationInput;
}

const SendBookingConfirmationToast = ({ bookingData }: Props) => {
    useEffect(() => {
        const sendEmail = async () => {
            try {
                const response = await fetch('/api/mail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData),
                });
                if (!response.ok) {
                    toast.warning('Bevestigingsmail kon niet worden verzonden');
                }
            } catch (error) {
                toast.warning('Bevestigingsmail kon niet worden verzonden');
            }
        };
        sendEmail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
};

export default SendBookingConfirmationToast; 