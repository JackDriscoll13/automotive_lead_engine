


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
  - Price: 5$ per 1000 Api calls 
  - We use the geocoding to convert zip codes to coordinates in the "Zip Code Search Feature" 

- Nearby Search Api (Advanced)
  - Price 35$ per 1000 Api calls
  - In the zip code feauture, after converting zip codes to coordinates, we retrieve car washes "nearby" those coordinates with this api.

API Call Imposed Limitiations: 

- The current goal is to not exceed the google api free tier, which is 200$ per month. 

- Text Search API - Monthly Limit: 1600 calls  Daily limit: 400 calls 
- Nearby Search API: Monthly Limit: 3800 calls  Daily limit: 800 calls
- Geocoding API: Monthly Limit: None 

The thinking here is:
1. The Nearby Search will be used more
2. The Nearby Search is less "call efficient", it uses up more requests per seach. 
3. The geocoding api is inherently related to the nearby search (everytime the application cals the geocoding api it also calls the nearby search api), so there is no need to limit the geocoding api. 

If we max out our limits in a given month we: 
1600 Text Searches = 56$
3800 Nearby Searches = 133$
3800 Geocodings = 19$
Total = 208$ per month which brings our cost to 8$ because of the free tier. 
  




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

