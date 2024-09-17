# Overview

**Summary:**
This is the codebase for [qfresheners.com/leads](https://www.qfresheners.com/leads).

The primary purpose of this application is to generate leads for a company that sells ancillary items to automotive businesses. The app allows sales people to quickly explore locations and generate long sheets of leads that can be used to contact businesses or fed into CRM tools.

The intended user base is extremley small (2-4 people.)

The application is publicly deployed for ease of use and because there is limited potnetial for abuse.

**Tech Stack:** 
The frontend is React JS, Tailwind CSS, and Chart JS (react-chart-js2) for the Analytics Chart. 

The backend is built in python with FastApi. 

Core Concepts: 
This applicaiton uses 3 endpoints from the new Google Places API to collect information on businesses through different means. 

The Location Search Feature uses the [text search](https://developers.google.com/maps/documentation/places/web-service/text-search) endpoint to find businesses given a text query and a location. This feature is built in a minimal way and is basically a glorified wrapper on the text search endpoint. 

The Zip Code Search feature combines google's [geocoding api](https://developers.google.com/maps/documentation/geocoding/overview) and the [nearby search](https://developers.google.com/maps/documentation/places/web-service/nearby-search) to search businesses in a list of zip codes. This enables users to search up to 50 zip codes at a time. It also enables high resolution using a radius users can customize. This feature uses a python generator to stream data in real time to the frontend via FastApi's streaming response model. 

I reccomend playing with the application to get a feel for how it works before diving into the code. The analytics page is helpful for understanding how many api calls you are making with each search. 

Or if you're a psycopath you can read the docs I wrote below....


# Google API Endpoints and Pricing
 
All API endpoints used in this application are from the (New) Google Places Api, details are here: 
- [Places Documentation/Overview](https://developers.google.com/maps/documentation/places/web-service/op-overview): 
- [Pricing](https://mapsplatform.google.com/pricing/): 


Pricing: 
An important price detail to remember: 
  "For Place Details (New), Nearby Search (New), and Text Search (New), use the FieldMask header in API requests to specify the list of fields to return in the response. You are then billed at the highest SKU applicable to your request. That means if you select fields in both the (Basic) SKU and the (Advanced) SKU, you are billed based on the (Advanced) SKU."

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


  
# Text Search Feature

Main Endpoints this feature uses:
Text Search: 
https://developers.google.com/maps/documentation/places/web-service/text-search
(Places API NEW)

How it works:
- User inputs a search query
- User inputs a location.
- Application pings text search api, wraps results in a dictionary.
  - If there is more than 20 results, the app grabs the nextPageToken and retreives the next results (MAX 60 results).
- Wraps result in nice output and allows user to download csv. 

Field Mask: 
Reference the [carwash_zipcode.py](../backend/carwash_regional.py) file to examine and change our current field mask. 


# ZIP Code Feature: 

Main Endpoints this feature uses: 
Nearby Search: 
https://developers.google.com/maps/documentation/places/web-service/nearby-search
(Places API NEW)

Geocoding API: 
I'm using the [googlemaps](https://pypi.org/project/googlemaps/) to ping the geocoding api. 
The library converts the zipcode to lat and lng with this call to the api: 
`return client._request("/maps/api/geocode/json", params).get("results", [])`


How it works: 
- User enters a zip code or a list of zip codes. 
- Application sends those zip codes to the google geocoding api, which converts the zip codes to lat and lng. 
- Application takes the lat and lng and uses them to ping the google nearby search api.
- Google nearby endpoint returns car washes within a specific radius of that lat and lng. 
  - The radius represents the area in/around that zip code. It should be adjusted based on population density of the zip codes you are looking up. 
  - For example a rural area might have zip codes that cover larger areas, urban areas will have smaller zip codes. 
- We loop over each zip code, sequencially converting each one to coordnitates and pinging the nearby search api. 
- As this endpoint runs, we yield results to the frontend via a generator through fastapi's [streaming response](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse).

- Note that, as of now, there is no pagnation in the nearby search feature, so *a maximum of 20 businesses can be returned per zip code*.

Reasoning / Justification of Services: 
**Converting zip codes to lat lng: **
  - I had a few differnt options here, I mainly considered: 
    - Using Geopy with Nominatim geocoder, which is based on OpenStreetMap data. This is an api call that's free.
    - Using Uszipcode library, which essentially is a local database of zip codes and fields attached to them. 
  - Ultimatley, I chose to use the google geocoding API because I was already using a google api as the cornerstone 
  - of this project. Plus its reliable and should be extremely low cost. 

Field Mask: 
Reference the [carwash_zipcode.py](../backend/carwash_zipcode.py) file to examine and change our current field mask. 

Included Types:
    Included types lets you specify a list of types from [here](https://developers.google.com/maps/documentation/places/web-service/place-types#table-a) to filter the search results.

    Automotive Types to include?:
        car_dealer
        car_rental
        car_repair
        car_wash
        electric_vehicle_charging_station
        gas_station
        parking
        rest_stop

I've decided to let users choose what types to include in the zipcode feature. We are letting them include:
  [car_wash, car_rental, gas_station, car_dealer, car_repair, parking] 

Future Work on this Feature:
The main think that might be useful to implement with this feature is some way of automatically retrieving the size or population density of the zip codes we are searching. If we could programaitcally select the search readius (rather than enter it manually as we are currently, that would be ideal.)


# Analytics Page

I keep track of our API calls and search count in a simple local json file. [search_counts_all.json](../backend/search_counts_all.json)

- I use the [check_api_call_limit.py](../backend/check_api_call_limit.py) before sending each request to check if we have reached our limit and also to update the file. 
  - If we have reached our limit, the function returns early before updating the file and lets the application know that either a daily or monthly api limit has been reached. 
- Everytime a user clicks a search button, the total search counts are incremented via the increment_app_search_count function, which lives in [utils](../backend/utils.py) 

- The analytics data is served to the frontend via the "/api_analytics" endpoint. 
  - This data is then visualized in a frontend dashboard.
  - The frontend also retreives information on our self imposed api limits discussed earlier.
    - This information is defined in [api_limit_config.json](../backend/api_limit_config.json) and served to the frontend via the "/check_api_call_limits" endpoint. 

# Deployment

The app is containerized with docker and deployed using aws lightsail. Although lightsail isn't optimal in many cases, this app should be small enough to live on a micro lightsail instance. I really like lightsail for its consistent pricing.

The frontend and backend are dockerized in seperate containers, and our development is continiously integreated into deployment via aws ECR. 

Connecting the frontend and backend containers in docker:
- Because the frontend and backend containers both live on the same LightSail instance (machine), I can connect them via a docker network. 
  - This is pretty simple and just means I pass the name of the container followed by the port when pinging my backend from my frontend. 
  - I just spin up each container on the same docker network network and change the url to my backend to the name of that container. 
- I use a proxy to get around the fact that the browser doesn't let me ping an http endpoint:     
    - In [default.conf](../frontend/default.conf)
    - location /api/ {
            proxy_pass http://backend:8000/;
        }

The app is deployed on the qfresheners.com domain and uses SSL certificates for https.

The lightsail instance is set up to auto renew certificates with a recurring cron job. 


Deployment Commands: 
Backend: 
docker run -d --name backend --network web -p 8000:8000 -e GOOGLE_MAPS_API_KEY=your_api_key_here image_name

Frontend: 
docker run -d   --name frontend  -p 80:80   -p 443:443   -v certbot-etc:/etc/letsencrypt  --network web image_name




