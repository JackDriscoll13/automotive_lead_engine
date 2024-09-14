import React, {useState, useEffect } from 'react'

const AnalyticsPage = ({backendUrl}) => {
    // Because the data file lives in the backend, we need to fetch it from there.
    // We will write an endpoint in the backend. 


    try {
        const response = await fetch(`${backendUrl}/api_analytics`, {
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

    return ( 
        <div>
            <h1>Analytics Page</h1>
        </div>  
    )
}

export default SearchByLocation;