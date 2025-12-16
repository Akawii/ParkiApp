// contexts/BookingContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Booking {
    id: string;
    location: string;
    address: string;
    startTime: number;
    duration: number; // em minutos
    price: number;
    lockerNumber: string;
}

interface BookingContextType {
    activeBooking: Booking | null;
    setActiveBooking: (booking: Booking | null) => void;
    timeRemaining: number; // em segundos
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        if (!activeBooking) {
            setTimeRemaining(0);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const endTime = activeBooking.startTime + (activeBooking.duration * 60 * 1000);
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            
            setTimeRemaining(remaining);

            if (remaining === 0) {
                setActiveBooking(null);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [activeBooking]);

    return (
        <BookingContext.Provider value={{ activeBooking, setActiveBooking, timeRemaining }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within BookingProvider');
    }
    return context;
}