import React, {useState, useEffect } from 'react'
import { downloadCSV } from './leadFinderUtils';
import { FaTools } from 'react-icons/fa'; // Importing an icon from react-icons

// SearchByZipcodes component, for now just return a div with a message
const SearchByZipcodes = ({ backendUrl }) => {
    console.log("Test backendUrl: ", backendUrl);

    // Handle Submit function
    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
           <FaTools className="text-4xl mr-2 animate-pulse text-red-800" /> {/* Icon with rotation */}
           <span className="text-md font-bold text-gray-700 mt-2 text-center">This feature is still under development. Stay tuned!</span>
           <span className="text-sm text-gray-700 mt-2 text-center max-w-96">
                *When complete, this feature will allow the user to search for car washes by zip code and by a list of zip codes. 
                This will enable a more targeted and organized lead generation process.
           </span>
        </div>
    );
};

export default SearchByZipcodes;