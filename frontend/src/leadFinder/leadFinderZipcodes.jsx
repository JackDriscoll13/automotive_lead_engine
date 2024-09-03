import React, { useState } from 'react';


// Logging functions (with timestamp)
const getTimestamp = () => new Date().toISOString();
const log = (message, data = null) => console.log(`[${getTimestamp()}] ${message}`, data );


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
  
      log('Response received:', response);
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      log('Starting to read stream');
      let buffer = '';
      while (true) {
          const { value, done } = await reader.read();
          if (done) {
              log('Stream finished');
              break;
          }
  
          const decodedChunk = decoder.decode(value, { stream: true });
          log('Received chunk:', decodedChunk);
          buffer += decodedChunk;
  
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
              const line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);
  
              if (line.trim() !== '') {
                  log('Processing line:', line);
                  try {
                      const data = JSON.parse(line);
                      if (data.type === 'progress') {
                          log('Progress update:', data.message);
                          setMessages(prev => [...prev, data.message]);
                      } else if (data.type === 'result') {
                          log('Received final result:', data);
                          setResults(data);
                      }
                  } catch (error) {
                      console.error('Error parsing JSON:', error);
                  }
              }
          }
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
                                {carWash.name} - Rating: {carWash.goog_rating}, 
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchByZipcodes;