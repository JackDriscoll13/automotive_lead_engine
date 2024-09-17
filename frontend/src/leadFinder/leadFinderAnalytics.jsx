import React, {useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, annotationPlugin);

const AnalyticsPage = ({backendUrl}) => {
    // Component states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [apiLimits, setApiLimits] = useState(null);


    useEffect(() => {
        // Fetching the main analytics data
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


        // Fetching the api limits
        const fetchApiLimits = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${backendUrl}/check_api_call_limits`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('API limits:', data);   
                setApiLimits(data);
            } catch (error) {
                setError('Failed to fetch API limits. Please try again.');
                console.error('There was a problem with the fetch operation:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
        fetchApiLimits();
    }, [backendUrl]); // Add any other dependencies if needed


    // Helper functions for labels
    const getCurrentMonth = () => {
        const now = new Date();
        return now.toLocaleString('default', { month: 'long', year: 'numeric' });
      };
    const getCurrentMonthAbv = () => {
        const now = new Date();
        return now.toLocaleString('default', { month: 'short', year: 'numeric' });
    }
    const currentmonth = getCurrentMonth()
    const currentmonthabv = getCurrentMonthAbv()
    
    // Doing math for the chart
    const getPercentage = (value, limit) => Math.round((value / limit) * 10000) / 100;

    // Function to round up to the nearest 100 (for the y-axis max)
    const roundUpToNearest100 = (num) => Math.ceil(num / 100) * 100;

    // Calculate the maximum value for the y-axis (for the y-axis max)
    const calculateYAxisMax = () => {
        const maxValue = Math.max(
            (results?.text_search_calls?.monthly_count_not_today || 0) + (results?.text_search_calls?.daily_count || 0),
            results?.nearby_search_calls?.monthly_count_not_today || 0,
            results?.geocode_calls?.monthly_count_not_today || 0
        );
        return roundUpToNearest100(maxValue + 100);
    };

    // Setting up the chart data
    const chartData = {
        labels: ['Text Search Calls', 'Nearby Search Calls', 'Geocode Calls'],
        datasets: [
            {
                label: `API Calls ${currentmonthabv}`,
                data: [
                    results?.text_search_calls?.monthly_count_not_today || 0,
                    results?.nearby_search_calls?.monthly_count_not_today || 0,
                    results?.geocode_calls?.monthly_count_not_today || 0
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                yAxisID: 'y',
            },
            {
                label: 'API Calls Today',
                data: [
                    results?.text_search_calls?.daily_count || 0,
                    results?.nearby_search_calls?.daily_count || 0, 
                    results?.geocode_calls?.daily_count || 0
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                yAxisID: 'y',
            },
            {
                label: '% Monthly API Limit',
                data: [
                    getPercentage((results?.text_search_calls?.monthly_count_not_today || 0) + (results?.text_search_calls?.daily_count || 0), apiLimits?.API_LIMITS?.TEXT_SEARCH?.MONTHLY),
                    getPercentage((results?.nearby_search_calls?.monthly_count_not_today || 0) + (results?.nearby_search_calls?.daily_count || 0), apiLimits?.API_LIMITS?.NEARBY_SEARCH?.MONTHLY),
                    getPercentage((results?.geocode_calls?.monthly_count_not_today || 0) + (results?.geocode_calls?.daily_count || 0), apiLimits?.API_LIMITS?.GEOCODE?.MONTHLY)
                ],
                backgroundColor: 'rgba(255, 223, 128, 0.6)',
                borderColor: 'rgba(255, 223, 128, 1)',
                borderWidth: 1,
                yAxisID: 'y1',
            }
        ],
    };

    // Setting up the chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    sort: (a, b) => {
                        const order = ['API Calls Today', `API Calls ${currentmonthabv}`, '% Monthly API Limit'];
                        return order.indexOf(a.text) - order.indexOf(b.text);
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y;
                            if (context.datasetIndex === 2) {
                                label += '%';
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Calls'
                },
                stacked: true,
                position: 'left',
                max: calculateYAxisMax(),
            },
            y1: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Percentage of Limit'
                },
                position: 'right',
                max: 100,
                grid: {
                    drawOnChartArea: false,
                }
            },
            x: {
                stacked: true
            }
        },
    };
    

    return (
        <div>
            {results && apiLimits && (
            <>
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">Searches All Time</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-100 rounded-lg p-6 transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-600 mb-2 text-center">General Location Searches</h3>
                            <p className="text-4xl font-bold text-blue-900">{(results.app_search_counts.regional_total || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-6 transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-600 mb-2 text-center">Zip Code Searches</h3>
                            <p className="text-4xl font-bold text-blue-900">{(results.app_search_counts.zip_code_total || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-1 text-gray-700">
                        Monthly API Usage
                    </h2>
                    <p className="text-lg font-normal text-gray-600 mb-4">
                        {currentmonth}
                    </p>
                    <div className="h-[400px] w-full">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                    {apiLimits && (
                    <div className="flex flex-col justify-left mt-6 ml-10">
                        <p className="text-xs text-black mb-1">Current Api Limits:
                            Text Search ({apiLimits.API_LIMITS.TEXT_SEARCH.DAILY}/day, {apiLimits.API_LIMITS.TEXT_SEARCH.MONTHLY}/month), 
                            Nearby Search ({apiLimits.API_LIMITS.NEARBY_SEARCH.DAILY}/day, {apiLimits.API_LIMITS.NEARBY_SEARCH.MONTHLY}/month), 
                            Geocode ({apiLimits.API_LIMITS.GEOCODE.DAILY}/day, {apiLimits.API_LIMITS.GEOCODE.MONTHLY}/month)</p>
                        <p className="text-xs text-black">Note: The API limits are imposed internally by this application for the purpose of keeping this servive within the free tier of the Google Places API.
                        Please let the team know if you want to increase or change these limits.
                        </p>
                    </div>
                    )}
                </div>
            </>
            )}
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
        </div>
    );
}

export default AnalyticsPage;

