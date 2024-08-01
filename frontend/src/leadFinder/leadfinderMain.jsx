import React, {useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import '../index.css'

// The first leadfinder application
const LeadFinder = () => {
    const backendUrl = "/api";
    // Then use it like:
    console.log("Test backendUrl: ", backendUrl)
    const [location, setLocation] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultsLabel, setResultsLabel] = useState(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setResults(null);
      setError(null);
      setResultsLabel(null);
  
  
      try {
        const response = await fetch(`${backendUrl}/search_carwashes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({region: location}),
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        // Check if the response data contains an error, set the error message accordingly
        if (data.error) {
          setError(data.error); 
          setResults([data]); 
        } else {
          // No error, proceed to set the results
          setResults(data);
        }
      } catch (error) {
        setError('Failed to fetch car washes. Please try again.');
        console.error('There was a problem with the fetch operation:', error);
      } finally {
        setIsLoading(false);
        setResultsLabel(location);
      }
    };
  
  
  
    const convertToCSV = (data) => {
      if (!data || !data.length) return '';
  
      const headers = Object.keys(data[0]);
      const csvRows = [];
  
      // Add headers
      csvRows.push(headers.join(','));
  
      // Add data
      for (const row of data) {
        const values = headers.map(header => {
          const escaped = ('' + row[header]).replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
  
      return csvRows.join('\n');
    };
  
    const downloadCSV = () => {
      if (!results) return;
  
      const csv = convertToCSV(results.results);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      // Format the Results label (first word in location + _carwashes.csv) (special characters removed)
      function formatLabel(resultsLabel) {
        if (resultsLabel) {
          const firstWord = resultsLabel.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
          return `${firstWord}_carwashes.csv`;
        }
        return 'car_washes_carwashes.csv';
      }
      const fileLabel = formatLabel(resultsLabel);
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileLabel);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-charcoal text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold">Car Wash Lead Generator</h1>
          </div>
        </header>
  
        <main className="container mx-auto mt-6 p-4">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
            <div className="flex items-center border-b-2 border-charcoal py-2 shadow-md">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-charcoal hover:bg-gray-700 border-charcoal hover:border-gray-700 text-sm border-4 text-white py-1 px-2 rounded"
              >
                Search Car Washes
              </button>
            </div>
          </form>
          {isLoading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
        
        {results && (
          <div className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-bold text-charcoal">Results for "{resultsLabel}":</h2>
            <div className="text-xs mb-4">({results.num_results} carwashes/detailers returned in {results.exc_time} seconds)</div>
            <pre className="bg-gray-100 p-4 h-[55vh] rounded text-sm text-gray-700 overflow-x-auto overflow-y-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
              {!error && (
                <button
                  onClick={downloadCSV}
                  className="mt-4 bg-charcoal hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Download CSV
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    );
  };

export default LeadFinder;