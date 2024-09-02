


### Backend Notes 

# ZIP Code Feature: 

How it works: 
- User enters a zip code or a list of zip codes. 
- Application sends those zip codes to the google geocoding api, which converts the zip codes to lat and lng. 
- Application takes the lat and lng and uses them to ping the google nearby search api.
- Google nearby endpoint returns car washes within a specific radius of that lat and lng. 


Reasoning / Justification of Services: 
**Converting zip codes to lat lng: **
  - I had a few differnt options here, I mainly considered: 
    - Using Geopy with Nominatim geocoder, which is based on OpenStreetMap data. This is an api call that's free.
    - Using Uszipcode library, which essentially is a local database of zip codes and fields attached to them. 
  - Ultimatley, I chose to use the google geocoding API because I was already using a google api as the cornerstone 
  - of this project. Plus its reliable and should be free/extremely low cost. 

