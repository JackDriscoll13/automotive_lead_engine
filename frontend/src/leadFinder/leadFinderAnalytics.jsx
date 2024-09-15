import React, {useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, annotationPlugin);

const AnalyticsPage = ({backendUrl}) => {
    // Component state 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);


    // 
    const TEXT_SEARCH_LIMIT = 1000; // Replace with your actual limit
    const NEARBY_SEARCH_LIMIT = 3800; // Replace with your actual limit
    const GEOCODE_LIMIT = 3800; 

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
    //
    const getPercentage = (value, limit) => Math.round((value / limit) * 10000) / 100;

    // Function to round up to the nearest 100
    const roundUpToNearest100 = (num) => Math.ceil(num / 100) * 100;

    // Calculate the maximum value for the y-axis
    const calculateYAxisMax = () => {
        const maxValue = Math.max(
            (results?.text_search_calls?.monthly_count_not_today || 0) + (results?.text_search_calls?.daily_count || 0),
            results?.nearby_search_calls?.monthly_count_not_today || 0,
            results?.geocode_calls?.monthly_count_not_today || 0
        );
        return roundUpToNearest100(maxValue + 100);
    };

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
                    getPercentage((results?.text_search_calls?.monthly_count_not_today || 0) + (results?.text_search_calls?.daily_count || 0), TEXT_SEARCH_LIMIT),
                    getPercentage((results?.nearby_search_calls?.monthly_count_not_today || 0) + (results?.nearby_search_calls?.daily_count || 0), NEARBY_SEARCH_LIMIT),
                    getPercentage((results?.geocode_calls?.monthly_count_not_today || 0) + (results?.geocode_calls?.daily_count || 0), GEOCODE_LIMIT)
                ],
                backgroundColor: 'rgba(255, 223, 128, 0.6)',
                borderColor: 'rgba(255, 223, 128, 1)',
                borderWidth: 1,
                yAxisID: 'y1',
            }
        ],
    };
    
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
            {results && (
            <>
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">Searches All Time</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-100 rounded-lg p-6 transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-600 mb-2 text-center">General Location Searches</h3>
                            <p className="text-4xl font-bold text-blue-900">{results.app_search_counts.regional_total || 0}</p>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-6 transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-600 mb-2 text-center">Zip Code Searches</h3>
                            <p className="text-4xl font-bold text-blue-900">{results.app_search_counts.zip_code_total || 0}</p>
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
                    <div className="flex justify-left mt-4 ml-10">
                        <p className="text-xs text-black">Current Api Limits: Text Search (1000/day, 3800/month), Nearby Search (1000/day, 3800/month), Geocode (1000/day, 3800/month)</p>
                    </div>
                </div>
            </>
            )}
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
        </div>
    );
}

export default AnalyticsPage;

