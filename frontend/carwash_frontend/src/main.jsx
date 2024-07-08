import React, {useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'


const App = () => {
  const [location, setLocation] = useState('');
  const [results, setResults] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fetch data from backend here
    // For now, we'll just set some dummy results
    setResults({ data: 'Sample data for ' + location });
  };

  const exportCSV = () => {
    // Implement CSV export logic here
    console.log('Exporting CSV...');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-charcoal text-white p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-semibold">Chris's Car Wash Finder</h1>
        </div>
      </header>

      <main className="container mx-auto mt-12 p-4">
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

        {results && (
          <div className="max-w-2xl mx-auto bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-bold mb-4 text-charcoal">Results:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
            <button
              onClick={exportCSV}
              className="mt-6 bg-charcoal hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Export as CSV
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
