import React from 'react'

const LeadFinderDocs = () => {
    return ( 
        <div className="container mx-auto mt-6 p-4 w-3/4">
            <h3 className="text-xl font-semibold">Application Overview</h3>
            <p className="text-gray-700 mt-4">
                This Lead Generator application is a tool that allows you to search for automotive related businesses in specific locations. 
                The application is divided into two main sections: General Location Search and Zip Code Search. 
                The General Location Search allows users to search for businesses by entering a location (town, city, state, even zip code).    
                The Zip Code Search specifically enables users to search for automotive related businesses by entering a zip code or a list of zip codes. 
            </p>
            <p className="text-gray-700 mt-4">
                The application uses the Google Places API to fetch business data based on user input.  
                The fetched data is then displayed in a json format, which includes various relevant information about each business.
                Users can download the search results in CSV format by clicking on the "Download CSV" button. 
                This puts the search results into a clean list of leads that can be viewed in excel or imported into a CRM system.
              </p>
            {/* <p className="text-gray-700 mt-4">  
                The application is still under development, and more features will be added in the future and as the needs of the business change.
            </p> */}
            <h3 className="text-xl font-semibold mt-6">General Location Search</h3>
            <p className="text-gray-700 mt-4">
                The General Location Search enables users to search for businesses by entering a query and a location. 
                The location can be a town, city, state, or even a zip code. Try putting in your hometown or a nearby city to see what businesses are in the area.
                You can then download the results in CSV format by clicking on the "Download CSV" button.
             </p> 
             <p className="text-gray-700 mt-4">
                The General Location Search is useful for quickly getting a loose list of car washes/businesses in an area. 
                Please note that the search results may not be exhaustive, and some businesses may not be included in the search results.
                The resolution of these search results is limited to the location entered by the user, and by limitations of the Google Places API.
            </p>
            <h3 className="text-xl font-semibold mt-6">Zip Code Search</h3>
            <p className="text-gray-700 mt-4">
                The Zip Code Search feature allows users to search for car washes by zip code and by a list of zip codes. 
                This features allows for a high resolution search of car washes within a specific area. 
                You can enter a single zip code or a list of zip codes separated by commas.
                The search results will include all the car washes within the specified zip codes.
                You can also specify a search radius in miles (default is 5000 meters) to further refine the search results.
            </p>
            <p className="text-gray-700 mt-4">
                Zip Code Search Parameters: 
            </p>
            <p className="text-gray-700 mt-4">
                Business Types: You can select specific types of businesses to include in your search.
                Read more about the business types here: <a className="text-blue-500" href="https://developers.google.com/maps/documentation/places/web-service/place-types?hl=en#table-a" target="_blank" rel="noopener noreferrer">Business Types</a>.
            </p>
            <p className="text-gray-700 mt-4">
                Search Radius: You can specify a search radius in meters (default is 5000 meters).
                You want to adjust the search radius depending on the population density of the zip codes you're interested in. 
                Urban zip codes will require a smaller radius, while rural zip codes will require a larger radius. (There are more busnisses in a 3000 meter radius in New York than there are in a 3000 meter radius in Alaska. Also zip codes tend to be smaller in denly populated areas). A good average radius is 5000 meters.
            </p>
            <h3 className="text-xl font-semibold mt-6">Limitiations</h3>
            <p className="text-gray-700 mt-4">
                At the time of writing, the Google Places API limits the number of search results to 20. 
                The text search endpoint has pagniation (up to 3 pages), but the nearby search endpoint does not.
                This means the "Location Search" can fetch up to 60 results per serach. 
                The "Zip Code Search" can fetch up to 20 results per zip code.
            </p>
            <p className="text-gray-700 mt-4">
                Also, the Google Places API is not free! For this reason, the application is limited to a specific number of requests per day and per month. 
                You can view the current limits and monthly usage in the analytics tab.
                </p>
            {/* <h3 className="text-xl font-semibold mt-6">Implications for Future Work</h3>
            <p className="text-gray-700 mt-4">
               As the business scales, it will likley make sense to use the base code of this application to build a robust dataset of all the carwashes and car detailers present in the united states.
               That will likley incur a cost if using the google API, but it will provide a more comprehensive and resolute list of leads. 
            </p> */}
        </div>
    );
}; 

export default LeadFinderDocs;