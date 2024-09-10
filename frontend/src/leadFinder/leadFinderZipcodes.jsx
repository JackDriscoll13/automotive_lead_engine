import React, { useState, useRef, useEffect } from 'react';
import { downloadCSV } from './leadFinderUtils';
// FontAwesome for tooltip/info icon
import { FaInfoCircle } from 'react-icons/fa';


// Logging functions (with timestamp)
const getTimestamp = () => new Date().toISOString();
const log = (message, data = null) => console.log(`[${getTimestamp()}] ${message}`, data );


const SearchByZipcodes = ({ backendUrl }) => {

    const [messages, setMessages] = useState([]);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // State to track the zip codes and radius input by the user
    const [zipCodes, setZipCodes] = useState('');
    const [radius, setRadius] = useState(5000);

    const [selectedTypes, setSelectedTypes] = useState({
        car_wash: true,
        car_dealer: false,
        car_rental: false,
        car_repair: false,
        gas_station: false,
        parking: false
    });
    
    // Input states, state to track input validity, input error to display, and input textarea height,
    const [isValidInput, setIsValidInput] = useState(true);
    const [inputError, setInputError] = useState('');
    const textareaRef = useRef(null);

    // Adjusting the height of the textarea based on the number of lines of input
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 4 * 24); // 4 lines * 24px line height
            textarea.style.height = `${newHeight}px`;
        }
    };
    useEffect(() => {
        adjustTextareaHeight();
    }, [zipCodes]);

    // Function to validate zip codes
    const validateZipCodes = (input) => {
        const trimmedInput = input.replace(/\s/g, '').replace(/,+$/, ''); // Remove all whitespace and trailing commas
        const zipCodePattern = /^(\d{5},)*\d{5}$/; // Regular expression to match zip codes separated by commas
        const isValid = zipCodePattern.test(trimmedInput); // Check if the input matches the pattern
        const zipCodeCount = trimmedInput.split(',').filter(Boolean).length; // Count the number of zip codes
    
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

    // Function to handle changes to the zip codes input
    const handleZipCodeChange = (e) => {
        const newValue = e.target.value;
        setZipCodes(newValue);
        setIsValidInput(validateZipCodes(newValue));
    };
    const handleTypeChange = (type) => {
        setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
    };

    // Function to handle the search button
    const handleSearch = async () => {
        // Check if the input is valid
        if (!isValidInput) {
            alert(inputError);
            return;
        }
        setMessages([]);
        setResults(null);

        // Clean and filter the zip codes
        const cleanedZipCodes = zipCodes
            .replace(/\s/g, '')
            .split(',')
            .filter(zip => zip.length === 5 && /^\d{5}$/.test(zip));
            
        
        console.log('Sending request to backend with cleaned zip codes:', cleanedZipCodes, ' and radius:', radius);
        const response = await fetch(`${backendUrl}/search_carwashes_zipcodes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zip_codes: cleanedZipCodes, radius: radius }),
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
                        setError('Error parsing JSON:', error);
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
                        className={`appearance-none bg-white border ${isValidInput ? 'border-gray-300' : 'border-red-500'}
                        rounded-md shadow-sm w-3/4 max-w-md text-gray-700 py-2 px-3 leading-tight focus:outline-none focus:ring-0.5
                        focus:ring-charcoal focus:border-charcoal resize-none overflow-y-auto`}
                        style={{ minHeight: '24px', maxHeight: '96px' }}
                    />
                    {!isValidInput && inputError && (
                        <p className="text-red-500 text-xs mt-1">
                            {inputError}
                        </p>
                    )}
                 </div>
                 <div className="flex flex-row items-top">
                    {/* Included Types */}
                    <div className="w-full mr-2 ml-2 flex-col items-center justify-center border-2 border-gray-300 rounded-md p-2">
                    <div className="flex justify-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Select Business Types:
                        </label>
                        <div className="relative group ml-1">
                            <FaInfoCircle className="text-gray-500 hover:text-gray-700 cursor-help"/>
                            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                                Click on the business types to include in your search. At least one type must be selected. 
                                <br/>
                                <br/>
                                Read more about the business types here: https://developers.google.com/maps/documentation/places/web-service/place-types?hl=en#table-a
                                
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {Object.entries(selectedTypes).map(([type, isSelected]) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleTypeChange(type)}
                                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ease-in-out
                                    ${isSelected 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    } border border-transparent`}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
                    {/* Radius input and slider */}
                    <div className="w-full mr-2 ml-2 flex-col items-center justify-center border-2 border-gray-300 rounded-md p-2">
                        <div className="flex justify-center">
                        <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Adjust search radius:
                        </label>
                        <div className="relative group ml-1">
                            <FaInfoCircle className="text-gray-500 hover:text-gray-700 cursor-help"/>
                            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 right-0 bottom-full mb-2 w-48">
                                You want to adjust the search radius depending on the population density of the zip codes you're interested in. 
                                Urban zip codes will require a smaller radius, while rural zip codes will require a larger radius. A good average radius is 5000 meters.
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
                        <p className="text-yellow-600 text-xs mb-2 w-3/4 text-center">
                            Warning: It's rare for zip codes to be this large. Please ensure you know what you're doing.
                        </p>
                    )}
                    </div>
                    </div>
                </div>
                <div className="flex justify-center mt-5">
                    <button
                        type="submit"
                        className="w-48 flex-shrink-0 bg-charcoal hover:bg-gray-700 border-charcoal hover:border-gray-700 text-xl border-4 text-white py-1 px-2 rounded"
                    >
                        Search
                    </button>
                </div>
                </div>
            </form>

            <div className="mt-4 justify-center text-center flex col gap-x-12">
                    {messages.length > 0 && (
                        <div className="bg-gray-100 p-4 h-[55vh] w-[25vw] rounded text-sm text-gray-700 overflow-x-auto overflow-y-auto shadow-md border-2 border-gray-300">
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
                        </div>
                     )}
                {results && (
                    <div className="bg-gray-100 p-4 h-[55vh] w-[40vw] rounded text-sm text-gray-700 overflow-x-aut shadow-md border-2 border-gray-300">
                        <h2 className="text-xl font-semibold mb-2">Results:</h2>
                        <p className="text-md font-semibold italic mb-2">Searched {results.num_zip_codes} zip codes, found {results.num_results} car washes in {results.exc_time} seconds.</p>
                        <pre className="bg-gray-200 p-4 h-[40vh] rounded text-sm text-gray-700 overflow-x-auto overflow-y-auto text-left">
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
            </div>
        </div>
    );
};

export default SearchByZipcodes;