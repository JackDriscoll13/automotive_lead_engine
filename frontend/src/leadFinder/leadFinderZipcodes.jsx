import React, { useState, useRef, useEffect } from 'react';

// FontAwesome for tooltip/info icon
import { FaInfoCircle } from 'react-icons/fa';


// Logging functions (with timestamp)
const getTimestamp = () => new Date().toISOString();
const log = (message, data = null) => console.log(`[${getTimestamp()}] ${message}`, data );


const SearchByZipcodes = ({ backendUrl }) => {
    const [messages, setMessages] = useState([]);
    const [results, setResults] = useState(null);

    // State to track the zip codes and radius input by the user
    const [zipCodes, setZipCodes] = useState('');
    const [radius, setRadius] = useState(5000);
    // State to track input validity and error message
    const [isValidInput, setIsValidInput] = useState(true);
    const [inputError, setInputError] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        adjustTextareaHeight();
    }, [zipCodes]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 4 * 24); // 4 lines * 24px line height
            textarea.style.height = `${newHeight}px`;
        }
    };


    // Function to validate zip codes

    const validateZipCodes = (input) => {
        const trimmedInput = input.replace(/\s/g, '').replace(/,$/, '');
        const zipCodePattern = /^(\d{5},)*\d{5}(,)?$/;
        const isValid = zipCodePattern.test(trimmedInput);
        const zipCodeCount = trimmedInput.split(',').length;

        if (!isValid) {
            setInputError('Please enter valid zip codes (5 digits each, separated by commas).');
            return false;
        } else if (zipCodeCount > 50) {
            setInputError('Please enter no more than 50 zip codes.');
            return false;
        } else {
            setInputError('');
            return true;
        }
    };

    const handleZipCodeChange = (e) => {
        const newValue = e.target.value;
        setZipCodes(newValue);
        setIsValidInput(validateZipCodes(newValue));
    };

    const handleSearch = async () => {
        // Check if the input is valid
         if (!isValidInput) {
            alert(inputError);
            return;
        }
      setMessages([]);
      setResults(null);
  
      const response = await fetch(`${backendUrl}/search_carwashes_zipcodes`, {
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
                        setMessages(prev => [...prev, { type: 'progress', message: data.message }]);
                    } else if (data.type === 'warning') {
                        setMessages(prev => [...prev, { type: 'warning', message: data.message }]);
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
        <div className="container mx-auto mt-6 p-4">
           <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="max-w-md mx-auto mb-12">
                <div className="flex flex-col items-center border-b-2 border-charcoal py-4 shadow-md">
                    <div className="w-full mb-4 flex flex-col items-center">
                    <div className="flex">
                        <label htmlFor="zipCodes" className="block text-lg font-medium text-gray-700 mb-2 text-center">
                            Enter zip codes:
                        </label>
                        <div className="relative group ml-1">
                                <FaInfoCircle className="text-gray-500 hover:text-gray-700 cursor-help"/>
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                                    Enter up to 50 zip codes, separated by commas.
                                </div>
                        </div>
                        </div>
                        <textarea
                    ref={textareaRef}
                    id="zipCodes"
                    value={zipCodes}
                    onChange={handleZipCodeChange}
                    placeholder="e.g. 90210, 10001, 60601"
                    className={`appearance-none bg-white border ${isValidInput ? 'border-gray-300' : 'border-red-500'} rounded-md shadow-sm w-3/4 max-w-md text-gray-700 py-2 px-3 leading-tight focus:outline-none focus:ring-0.5 focus:ring-charcoal focus:border-charcoal resize-none overflow-y-auto`}
                    style={{ minHeight: '24px', maxHeight: '96px' }}
                />
                {!isValidInput && inputError && (
                    <p className="text-red-500 text-xs mt-1">
                        {inputError}
                    </p>
                )}
                    </div>
                    <div className="w-full mr-2 flex-col items-center mb-2 justify-center">
                        <div className="flex justify-center">
                        <label htmlFor="radius" className="block text-md font-medium text-gray-700 mb-2 text-center">
                            Adjust search radius:
                        </label>
                        <div className="relative group ml-1">
                                <FaInfoCircle className="text-gray-500 hover:text-gray-700 cursor-help"/>
                                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                                    You want to adjust the search radius depending on the population density of the zip codes you're interested in. 
                                    Urban zip codes will require a smaller radius, while rural zip codes will require a larger radius. An average radius is 5000 meters.
                                </div>
                        </div>
                    </div>
                        <div className="text-sm text-center">{radius} m</div>
                    <div className="flex justify-center">
                        <input
                            type="range"
                            min="2000"
                            max="20000"
                            step="100"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-1/2 mr-2 text-center"
                        />
                    </div>
                    <div className="flex justify-center">
                    {radius > 8000 && (
                        <p className="text-yellow-600 text-xs mb-2 w-1/2 text-center">
                            Warning: It's rare for zip codes to be this large. Please ensure you know what you're doing.
                        </p>
                    )}
                    </div>
                    </div>
                    <button
                        type="submit"
                        className="flex-shrink-0 bg-charcoal hover:bg-gray-700 border-charcoal hover:border-gray-700 text-sm border-4 text-white py-1 px-2 rounded"
                    >
                        Search
                    </button>
                </div>
            </form>

            <div className="mt-4 justify-center text-center flex col gap-x-12">
                <div className="bg-gray-100 p-4 h-[50vh] w-[25vw] rounded text-sm text-gray-700 overflow-x-auto overflow-y-auto shadow-md border-2 border-gray-300">
                    {messages.length > 0 && (
                            <div className="mt-4">
                                <h2 className="text-xl font-semibold mb-2">Search Logs:</h2>
                                <ul className="list-none pl-10 text-left">
                                    {messages.map((message, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">&mdash;</span>
                                            <span className={message.type === 'warning' ? 'text-red-600 font-semibold' : ''}>
                                                {message.message}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </div>
                {results && (
                    <div className="bg-gray-100 p-4 h-[50vh] w-[40vw] rounded text-sm text-gray-700 overflow-x-aut shadow-md border-2 border-gray-300">
                        <h2 className="text-xl font-semibold mb-2">Results:</h2>
                        <p className="text-md font-semibold italic mb-2">Searched {results.num_zip_codes} zip codes, found {results.num_results} car washes in {results.exc_time} seconds.</p>
                        <pre className="bg-gray-200 p-4 h-[35vh] rounded text-sm text-gray-700 overflow-x-auto overflow-y-auto text-left">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchByZipcodes;