"use client"

import { useEffect } from 'react';
import Cookies from 'js-cookie';

export function useEmailMonitoring() {
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    
    const callEmailMonitoring = async () => {
      if (!isMounted) return;
      
      const userEmail = Cookies.get('userEmail');
      
      if (!userEmail) {
        console.log('No user email found in cookies');
        return;
      }

      try {
        console.log('Calling email monitoring API...');
        const response = await fetch(
          `/api/routes/Google?action=startEmailMonitoring`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        console.log('Email monitoring status:', data);
      } catch (error) {
        console.error('Email monitoring error:', error.message);
      }
    };

    callEmailMonitoring();

    intervalId = setInterval(callEmailMonitoring, 60000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
}