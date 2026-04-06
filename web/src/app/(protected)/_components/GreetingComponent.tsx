'use client';

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { NextAuthUserSession } from '@/types';

export default function GreetingComponent() {
    const [greeting, setGreeting] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState('');

    const session = useSession();
    const data = session.data as NextAuthUserSession;

    useEffect(() => {
        const updateGreetingAndTime = () => {
            const now = moment();
            const hours = now.hour();
            if (hours < 12) {
                setGreeting('Good Morning, ');
            } else if (hours < 17) {
                setGreeting('Good Afternoon, ');
            } else {
                setGreeting('Good Evening, ');
            }

            const formattedDate = now.format('dddd, Do MMMM, h:mm A');
            setCurrentDateTime(formattedDate);
        };

        updateGreetingAndTime();

        // Optional: Update the time every minute
        const timer = setInterval(updateGreetingAndTime, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="ml-6 md:ml-auto text-xs md:text-base">
            <h4 className="text-gray-700 font-semibold">{greeting} {data?.user?.firstName} {data?.user?.lastName}</h4>
            <p className="text-gray-400 md:text-sm">{currentDateTime}</p>
        </div>
    );
}


