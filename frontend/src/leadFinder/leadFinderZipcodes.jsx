import React, {useState, useEffect } from 'react'
import { downloadCSV } from './leadFinderUtils';
import { FaTools } from 'react-icons/fa'; // Importing an icon from react-icons




const SearchByZipcodes = ({ backendUrl }) => {
    const [messages, setMessages] = useState([]);
    const [results, setResults] = useState(null);
    const [zipCodes, setZipCodes] = useState('');
    const [radius, setRadius] = useState(5000);

    const handleSearch = async () => {
        setMessages([]);
        setResults(null);
    
        const response = await fetch(`${backendUrl}/search_zip_codes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ zip_codes: zipCodes.split(','), radius: radius }),
        });
    
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
    
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const decodedChunk = decoder.decode(value, { stream: true });
          const lines = decodedChunk.split('\n');
          
          lines.forEach(line => {
            if (line.trim() !== '') {
              const data = JSON.parse(line);
              if (data.type === 'progress') {
                setMessages(prev => [...prev, data.message]);
              } else if (data.type === 'result') {
                setResults(data);
              }
            }
          });
        }
      };
    
      return (
        <div className="p-4">
          <input
            type="text"
            value={zipCodes}
            onChange={(e) => setZipCodes(e.target.value)}
            placeholder="Enter zip codes (comma-separated)"
            className="border p-2 mr-2"
          />
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            placeholder="Radius (meters)"
            className="border p-2 mr-2"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">
            Search
          </button>
          
          <div className="mt-4">
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          
          {results && (
            <div className="mt-4">
              <h2>Results:</h2>
              <p>Number of car washes found: {results.num_results}</p>
              <p>Number of zip codes searched: {results.num_zip_codes}</p>
              <ul>
                {results.results.map((carWash, index) => (
                  <li key={index}>
                    {carWash.name} - Rating: {carWash.goog_rating}, Address: {carWash.address}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }


export default SearchByZipcodes;


// // SearchByZipcodes component, for now just return a div with a message
// const SearchByZipcodes = ({ backendUrl }) => {
//     console.log("Test backendUrl: ", backendUrl);

//     // Handle Submit function
//     return (
//         <div className="flex flex-col items-center justify-center h-full p-4">
//            <FaTools className="text-4xl mr-2 animate-pulse text-red-800" /> {/* Icon with rotation */}
//            <span className="text-md font-bold text-gray-700 mt-2 text-center">This feature is still under development. Stay tuned!</span>
//            <span className="text-sm text-gray-700 mt-2 text-center max-w-96">
//                 *When complete, this feature will allow the user to search for car washes by zip code and by a list of zip codes. 
//                 This will enable a more targeted and organized lead generation process.
//            </span>
//         </div>
//     );
// };

// export default SearchByZipcodes;