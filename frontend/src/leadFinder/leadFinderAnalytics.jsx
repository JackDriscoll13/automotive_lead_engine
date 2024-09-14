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
            <h1>Analytics Dashboard</h1>
            {results && (
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">Searches All Time</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md">
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Zip Code Searches</h3>
                            <p className="text-4xl font-bold text-blue-600">{results['app_search_counts']['zip_code_total'] || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6 transition-all duration-300 hover:shadow-md">
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Total General Location Searches</h3>
                            <p className="text-4xl font-bold text-green-600">{results.totalGeneralLocationSearches || 0}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ... existing results display ... */}
        </div>

    );
}

export default AnalyticsPage;