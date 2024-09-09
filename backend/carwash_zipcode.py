import time
from fastapi.responses import StreamingResponse
import googlemaps
import json
import requests
from utils import check_api_call_limit

# Lets try to use a generator so we can stream some progress statements to the frontend
def generate_carwashes_by_zipcode2(api_key: str, zip_codes: str | list[str], zipcode_radius: int = 5000):
    """
    Fetch car washes for one or more zip codes using Google Places API Nearby Search.
    Includes deduplication based on place_id and streams updates.

    Args:
        api_key (str): Google Maps API key.
        zip_codes (str or list): Single zip code or list of zip codes.
        zipcode_radius (int): The radius of the search in meters. Defaults to 5000.

    Returns:
        StreamingResponse: Streams updates and final results.
    """
    # Initialize the start time so we can calculate how long the function takes to run
    start_time = time.time()

    # If the zip code is a string convert it to a list
    if isinstance(zip_codes, str):
        zip_codes_list = [zip_codes]
    else:
        zip_codes_list = zip_codes

    # Start the stream with a progress message
    yield json.dumps({
        "type": "progress",
        "message": f"Starting search for {len(zip_codes_list)} zip codes..."}) + "\n"

    # Initialize the Google Maps client
    gmaps = googlemaps.Client(key=api_key)
    places_url = "https://places.googleapis.com/v1/places:searchNearby"
    
    all_car_washes = {}  # Use a dictionary to store unique car washes (for deduplication)

    # Iterate over each zip code
    for zip_code in zip_codes_list:
        yield json.dumps({"type": "progress", "message": f"Getting coordinates for car washes in {zip_code}"}) + "\n"
        try:
            # Geocode the zip code to get the latitude and longitude
            geocode_result = gmaps.geocode(f"{zip_code}, USA")
            if not geocode_result:
                yield json.dumps({"type": "progress", "message": f"Could not find coordinates for zip code {zip_code}"}) + "\n"
                continue
            location = geocode_result[0]['geometry']['location']
        except Exception as e:
            yield json.dumps({"type": "progress", "message": f"Error geocoding zip code {zip_code}: {str(e)}"}) + "\n"
            continue

        # Once we have the coordinates, search for car washes in area (within the specified radius) of that zip code
        yield json.dumps({"type": "progress", "message": f"Coordinates for {zip_code} are: {location}"}) + "\n"
        yield json.dumps({"type": "progress", "message": f"Searching for car washes within {zipcode_radius}m radius of {zip_code}"}) + "\n"

        # We set up the params for the Google Places API Nearby Search
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.location,places.id,places.nationalPhoneNumber,places.websiteUri"
        }

        params = {
        "includedTypes": [
            "car_wash",
            "car_repair",
            "gas_station",
            "rest_stop"
        ],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
            "center": {
                "latitude": location["lat"],
                "longitude": location["lng"]
            },
            "radius": zipcode_radius
            }
            
        }
        }
        
        # As of now, there is no next page token with this endpoint, no need to set it

        num_car_washes_found = 0
        while True:
            # We check if we've exceeded our api call limit, if so we stream an error message and break out of the loop 
            success, message, counts = check_api_call_limit("nearby_search", daily_limit=800, monthly_limit=3800)
            if not success:
                yield json.dumps({"error": f"Limit exceeded: {message}. Total calls: {counts['total_calls']}, Monthly calls: {counts['monthly_calls']}, Daily calls: {counts['daily_calls']}."}) + "\n"
                return

            
            # Finally, we make the request to the Google Places API with the params we've set up
            response = requests.post(places_url, json=params, headers=headers)
            results = response.json()
            if len(results['places']) > 19:
                yield json.dumps({"type": "warning", 
                                  "message": f"Found {len(results['places'])} car washes in {zip_code}. This likely means the radius is too large and you did not capture all car washes within this zip code. Try a smaller radius."}) + "\n"
            if len(results['places']) == 0:
                yield json.dumps({"type": "warning", 
                                  "message": f"Found 0 car washes in {zip_code}. This is not bad, it just means there are no car washes within the radius of {zipcode_radius}m."}) + "\n"
            print('Total results: ', len(results['places']))

            # If the status is not OK, we stream an error message and break out of the loop
            if response.status_code != 200:
                print(response.text)
                yield json.dumps({"error": f"Error: {response.status_code} - {response.text}"}) + "\n"
                break
            
            # Iterate over the results and add them to the all_car_washes dictionary
            for place in results["places"]:
                num_car_washes_found += 1
                place_id = place['id']
        

                # If the place_id is not in the all_car_washes dictionary, we add it
                if place_id not in all_car_washes:
                    all_car_washes[place_id] = {
                        "name": place["displayName"]["text"],
                        "address": place.get("formattedAddress"),
                        "goog_rating": place.get("rating"),
                        "phone": place.get("nationalPhoneNumber"),
                        "website": place.get("websiteUri"),
                        "lat": place["location"]["latitude"],
                        "lng": place["location"]["longitude"],
                        "goog_places_id": place_id,
                        "zip_codes_nearby": [zip_code]
                    }
                else:
                    # If the place_id is already in the all_car_washes dictionary, we add the zip code to the list of zip codes nearby
                    if zip_code not in all_car_washes[place_id]["zip_codes_nearby"]:
                        all_car_washes[place_id]["zip_codes_nearby"].append(zip_code)
            
    

        
            break
            
        # Want to keep track of how many car washes we've found for the given zip code
        yield json.dumps({"type": "progress", "message": f"Completed search for {zip_code}; {num_car_washes_found} car washes found"}) + "\n"

    final_results = list(all_car_washes.values())
    yield json.dumps({
        "type": "result",
        "message": "Search complete",
        "results": final_results,
        "num_results": len(final_results),
        "num_zip_codes": len(zip_codes_list),
        "exc_time": round((time.time() - start_time), 2)
    }) + "\n"
