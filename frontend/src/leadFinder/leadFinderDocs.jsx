import React from 'react'

const LeadFinderDocs = () => {
    return ( 
        <div className="container mx-auto mt-6 p-4">
            <h3 className="text-xl font-semibold">Application Overview</h3>
            <p className="text-gray-700 mt-4">
                This Lead Generator application is a tool that allows you to search for car washes and car detail shops in a given location. 
                The application is divided into two main sections: General Location Search and Zip Code Search. 
                The General Location Search allows users to search for car washes by entering a location (town, city, state, even zip code). 
                The Zip Code Search specifically enables users to search for car washes by entering a zip code or a list of zip codes. 
                The application uses the Google Places API to fetch car wash data based on the user's search query. 
                The fetched data is then displayed in a json format, which includes the name, address, and phone number of each car wash. 
                Users can download the search results in CSV format by clicking on the "Download CSV" button. 
                This puts the search results into a clean list of leads that can be viewed in excel or imported into a CRM system.
                The application is still under development, and more features will be added in the future and as the needs of the business change.
            </p>
            <h3 className="text-xl font-semibold mt-6">General Location Search</h3>
            <p className="text-gray-700 mt-4">
                The General Location Search enables users to search for car washes by entering a location. 
                The location can be a town, city, state, or even a zip code. Try putting in your hometown or a nearby city to see what car washes and detail shops are in the area.
                You can then download the results in CSV format by clicking on the "Download CSV" button.
             </p> 
             <p className="text-gray-700 mt-4">
                The General Location Search is useful for quickly getting a loose list of car washes in an area. 
                Please note that the search results may not be exhaustive, and some car washes may not be included in the search results.
                The resolution of these search results is limited to the location entered by the user, and by limitations of the Google Places API.
            </p>
            <h3 className="text-xl font-semibold mt-6">Zip Code Search</h3>
            <p className="text-gray-700 mt-4">
                The Zip Code Search feature is still under development. 
                When complete, this feature will allow users to search for car washes by zip code and by a list of zip codes. 
                This will enable better precision allow for a more targeted and organized lead generation process.
            </p>
            <h3 className="text-xl font-semibold mt-6">Application Limitiations</h3>
            <p className="text-gray-700 mt-4">
                At the time of writing, the Google Places API limits the number of search results to 20. 
                However, the application is designed to handle pagination and fetch more results if available. 
                The google API allows pagination for up to 3 api calls, which means the application can fetch up to 60 search results per query.
            </p>
            <p className="text-gray-700 mt-4">
                Also, the Google Places API is not free! For this reason, the application is limited to a specific number of requests per day and per month.
                </p>
        </div>
    );
}; 

export default LeadFinderDocs;