


### Backend Notes 


# GOOGLE API ENDPOINTS
 
All API endpoints used in this application are from the (New) Google Places Api, details are here: 
- [Places Documentation/Overview](https://developers.google.com/maps/documentation/places/web-service/op-overview): 
- [Pricing](https://mapsplatform.google.com/pricing/): 


An important price detail to remember: 
  "For Place Details (New), Nearby Search (New), and Text Search (New), use the FieldMask header in API requests to specify the list of fields to return in the response. You are then billed at the highest SKU applicable to your request. That means if you select fields in both the (Basic) SKU and the (Advanced) SKU, you are billed based on the (Advanced) SKU."

In both of my text and nearby sea

- Text Search Api (Advanced): 
  - Price: 35$ per 1000 Api Calls
  - We use the text search in the "General Location Search Feature" 
  - This API can be called 1-3 times when a user hits "search"

- Geocoding Api 
  - Price: 5$ per 1000 Api cals 
  - We use the geocoding to convert zip codes to coordinates in the "Zip Code Search Feature" 

- Nearby Search Api (Advanced)



# ZIP Code Feature: 

How it works: 
- User enters a zip code or a list of zip codes. 
- Application sends those zip codes to the google geocoding api, which converts the zip codes to lat and lng. 
- Application takes the lat and lng and uses them to ping the google nearby search api.
- Google nearby endpoint returns car washes within a specific radius of that lat and lng. 
  - The radius represents the area in/around that zip code. It should be adjusted based on population density of the zip codes you are looking up. 
  - For example a rural area might have zip codes that cover larger areas, urban areas will have smaller zip codes. 


Reasoning / Justification of Services: 
**Converting zip codes to lat lng: **
  - I had a few differnt options here, I mainly considered: 
    - Using Geopy with Nominatim geocoder, which is based on OpenStreetMap data. This is an api call that's free.
    - Using Uszipcode library, which essentially is a local database of zip codes and fields attached to them. 
  - Ultimatley, I chose to use the google geocoding API because I was already using a google api as the cornerstone 
  - of this project. Plus its reliable and should be free/extremely low cost. 

