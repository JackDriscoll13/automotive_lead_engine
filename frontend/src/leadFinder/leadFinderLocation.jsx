import React, {useState, useEffect} from 'react'
import { downloadCSV } from './leadFinderUtils';
import { LoadingSpinner } from './leadFinderUtils';
import { FaInfoCircle } from 'react-icons/fa';

const SearchByLocation = ({backendUrl} ) => {
    const [location, setLocation] = useState('');
    const [selectedQuery, setSelectedQuery] = useState('car_washes_detailers');
    const [customQuery, setCustomQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    const queryOptions = {
      car_washes_detailers: '"Car washes and car detailers"',
      car_dealers: '"Car washes"',
      auto_repair: '"Gas stations and car parking lots"',
      custom: "Custom Search..." 
  };


  // Function to get the Search Query
  const getSearchQuery = () => {
      if (selectedQuery === 'custom') {
        return `"${customQuery}" in`;
      }
      return `${queryOptions[selectedQuery].toLowerCase()} in`;
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setResults(null);
      setError(null);

      try {
        const response = await fetch(`${backendUrl}/search_carwashes_regions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({region: location, query: getSearchQuery()}),
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
      }
    };

  const handleDownloadCSV = () => {
      console.log("Downloading CSV");
      if (results && results.results) {
          downloadCSV(results.results, `${location}_text_search_results.csv`);
      } else {
          console.error('No valid data available for CSV download');
      }
  };

  // Functiion to update the title of the results 
  const [resultsTitleQuery, setResultsTitleQuery] = useState('');
  const [resultsTitleLocation, setResultsTitleLocation] = useState('');

  useEffect(() => {
    if (results) {
      setResultsTitleQuery(getSearchQuery());
      setResultsTitleLocation(location);
    }
  }, [results]);

  
    return ( 
      <div className="container mx-auto mt-6 p-4">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
          {/* Search For */}
          <div className="flex flex-col items-center pb-4 shadow-md">
            <div className="flex flex-col items-left w-3/4">
            <div className="flex justify-between">
                  <label className="block text-sm font-semibold text-gray-700 ml-1 text-left">
                      Search For:
                    </label>
                    <div className="relative group ml-1">
                      <FaInfoCircle className="text-gray-500 hover:text-gray-700 cursor-help"/>
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                        Enter your search query. This tool is optimized for car washes, detailers, and other car-related businesses, but you can search for any business type.
                      </div>
                    </div>
              </div>
              <div className="w-full mb-2 relative">
              <select
                value={selectedQuery}
                onChange={(e) => setSelectedQuery(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md shadow-sm w-full text-gray-700 py-2 px-3 pr-8 leading-tight focus:outline-none focus:ring-0.5 focus:ring-charcoal focus:border-charcoal"
              >
                {Object.entries(queryOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
              {selectedQuery === 'custom' && (
                <div className="w-full mb-2 text-gray-700">
                  <input
                    type="text"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder='e.g. "Pizza Restaurants"'
                    className="appearance-none bg-white border border-gray-300 rounded-md shadow-sm w-full text-gray-700 py-2 px-3 leading-tight focus:outline-none focus:ring-0.5 focus:ring-charcoal focus:border-charcoal"
                  />
                </div>
              )}
              {/* Location/Region */}
              <div className="flex justify-between mt-6">
                  <label className="block text-sm font-semibold text-gray-700 ml-1 text-left">
                      In Location/Region:
                    </label>
                    <div className="relative group ml-1">
                      <FaInfoCircle className="text-gray-500 hover:text-gray-700 cursor-help"/>
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                        Enter the location or region you want to search. Try entering your hometown or a nearby city.
                        <br />
                        <br />
                        Best formatted as Town, State (e.g. "Chicago, IL").
                      </div>
                    </div>
              </div>
              <div className="w-full mb-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder='Enter location'
                  className="appearance-none bg-white border border-gray-300 rounded-md shadow-sm w-full text-gray-700 py-2 px-3 leading-tight focus:outline-none focus:ring-0.5 focus:ring-charcoal focus:border-charcoal"
                />
              </div>
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-60 flex-shrink-0 text-xl border-4 text-white py-1 px-2 rounded flex items-center justify-center ${
                    isLoading
                      ? 'bg-gray-500 border-gray-500 cursor-not-allowed'
                      : 'bg-charcoal hover:bg-gray-700 border-charcoal hover:border-gray-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="w-5 h-5 mr-2" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
              </div>
            </div>
          </form>
          {isLoading && <p className="text-center text-gray-700">Searching for {getSearchQuery()} "{location}"...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
        
        {results && (
          <div className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-bold text-charcoal">Results for {resultsTitleQuery} "{resultsTitleLocation}":</h2>
            <div className="text-xs mb-4">({results.num_results} businesses returned in {results.exc_time} seconds)</div>
            <pre className="bg-gray-100 p-4 h-[30vh] rounded text-sm text-gray-700 overflow-x-auto overflow-y-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
              {!error && (
                <div className="flex justify-center mt-4">
                <button
                  onClick={handleDownloadCSV}
                  className="mt-4 bg-charcoal hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Download CSV
                </button>
              </div>
              )}
            </div>
          )}
        </div>
    );
 };

 export default SearchByLocation; 
