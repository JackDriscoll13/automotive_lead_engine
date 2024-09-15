import requests
import time
import json
#from utils import check_api_call_limit
from check_api_call_limit import  check_api_call_limit_new

def get_all_car_washes(api_key, region):
    """
    Fetch car washes in a region using Google Places API.
    Makes multiple API calls to get car wash and detailing businesses,
    handling pagination and API usage limits.

    Args:
        api_key (str): Google Maps API key.
        region (str): Search region.

    Returns:
        list: Car wash info (name, address, rating, etc.) if successful.
        dict: Error details if API limit exceeded.

    Notes:
        - Uses check_api_call_limit to stay within API limits.
        - Maximum 3 API calls per invocation.
        - Searches for "car wash and car detailing" businesses.
    """

    base_url = "https://places.googleapis.com/v1/places:searchText"
    
    # These headers: we pass the api key, we pass the field mask
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.location,places.id,places.nationalPhoneNumber,places.websiteUri,nextPageToken"
    }
    
    data = {
        "textQuery": f"car wash and car detailing {region}",
        "languageCode": "en"
    }
    
    all_car_washes = []
    next_page_token = None
    callcount = 0

        # Read in the api_limit_config.json file
    with open('api_limit_config.json', 'r') as file:
        api_limits = json.load(file)
        api_limits = api_limits["API_LIMITS"]

    while True:
        # Check API call limit before making the next request
        success, message, counts = check_api_call_limit_new("text_search_calls", daily_limit=600, monthly_limit=5800)
        if not success:
            return {"error": f"Limit exceeded: {message}. Total calls: {counts['total_calls']}, Monthly calls: {counts['monthly_calls']}, Daily calls: {counts['daily_calls']}."}


        if next_page_token:
            data["pageToken"] = next_page_token
        
        response = requests.post(base_url, json=data, headers=headers)
        results = response.json()
        places = results.get("places", [])
        for place in places:
            car_wash = {
                "name": place["displayName"]["text"],
                "address": place.get("formattedAddress"),
                "goog_rating": place.get("rating"),
                "phone": place.get("nationalPhoneNumber"),
                "website": place.get("websiteUri"),
                "lat": place["location"]["latitude"],
                "lng": place["location"]["longitude"],
                "goog_places_id": place['id'], 
            }
            all_car_washes.append(car_wash)
        
        next_page_token = results.get("nextPageToken")
        callcount += 1
        if not next_page_token or callcount > 2 or (len(places) < 19):
            break
        
        # Wait before making the next request (to comply with API usage limits)
        time.sleep(2)
    
    return all_car_washes

