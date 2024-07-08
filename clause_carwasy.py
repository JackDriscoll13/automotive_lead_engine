import requests
import time

def get_all_car_washes(api_key, region):
    base_url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.location,nextPageToken"
    }
    
    data = {
        "textQuery": f"car wash in {region}",
        "languageCode": "en"
    }
    
    all_car_washes = []
    next_page_token = None
    
    while True:
        if next_page_token:
            data["pageToken"] = next_page_token
        
        response = requests.post(base_url, json=data, headers=headers)
        results = response.json()
        
        places = results.get("places", [])
        for place in places:
            car_wash = {
                "name": place["displayName"]["text"],
                "address": place.get("formattedAddress"),
                "rating": place.get("rating"),
                "lat": place["location"]["latitude"],
                "lng": place["location"]["longitude"]
            }
            all_car_washes.append(car_wash)
        
        next_page_token = results.get("nextPageToken")
        
        if not next_page_token:
            break
        
        # Wait before making the next request (to comply with API usage limits)
        time.sleep(2)
    
    return all_car_washes

# Usage example
api_key = "AIzaSyCLf6ZnBPM2HsiE-943gtHVkU8XNZRpn5s"
region = "Long Island, NY"
car_washes = get_all_car_washes(api_key, region)

for car_wash in car_washes:
    print(f"Name: {car_wash['name']}")
    print(f"Address: {car_wash['address']}")
    print(f"Rating: {car_wash['rating']}")
    print(f"Location: {car_wash['lat']}, {car_wash['lng']}")
    print("---")

print(f"Total car washes found: {len(car_washes)}")