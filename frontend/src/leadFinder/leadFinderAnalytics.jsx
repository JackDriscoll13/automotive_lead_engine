import React, {useState, useEffect } from 'react'

const AnalyticsPage = ({backendUrl}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log('Fetching analytics...');
                const response = await fetch(`${backendUrl}/api_analytics`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('Analytics data:', data);
                if (data.error) {
                    setError(data.error);
                    setResults([data]);
                } else {
                    setResults(data);
                }
            } catch (error) {
                setError('Failed to fetch analytics. Please try again.');
                console.error('There was a problem with the fetch operation:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [backendUrl]); // Add any other dependencies if needed

    return ( 
        <div>
            <h1>Analytics Page</h1>
        </div>  
    )
}

export default AnalyticsPage;