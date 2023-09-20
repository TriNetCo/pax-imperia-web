import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { _logEvent } from './AzureAuth';

const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        const eventName = 'navigation';
        const eventMessage = `${location.pathname}${location.search}`;
        console.log(`${eventName}: ${eventMessage}`);

        _logEvent(eventName, eventMessage);

    }, [location]);
};

export default usePageTracking;
