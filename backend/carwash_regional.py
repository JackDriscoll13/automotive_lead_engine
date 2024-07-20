import requests
import time
from utils import check_api_call_limit

def get_all_car_washes(api_key, region):
    """ Primary function to ping the google places API and get all car washes in a region """

    base_url = "https://places.googleapis.com/v1/places:searchText"
    
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

    while True:
        # Check API call limit before making the next request
        success, message, counts = check_api_call_limit("google_maps_api_key", daily_limit=800, monthly_limit=5800)
        if not success:
            return {"error": f"Limit exceeded: {message}. Total calls: {counts['total_calls']}, Monthly calls: {counts['monthly_calls']}, Daily calls: {counts['daily_calls']}."}


        if next_page_token:
            data["pageToken"] = next_page_token
        
        response = requests.post(base_url, json=data, headers=headers)
        results = response.json()
        print(results)
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

