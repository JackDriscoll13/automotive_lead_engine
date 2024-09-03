import asyncio
from fastapi.responses import StreamingResponse
import googlemaps
import json
import requests
from utils import check_api_call_limit

# Lets try to use a generator so we can stream some progress statements to the frontend
async def get_car_washes_by_zip(api_key: str, zip_codes: str | list[str], zipcode_radius: int = 5000):
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
    async def generate():
        if isinstance(zip_codes, str):
            zip_codes_list = [zip_codes]
        else:
            zip_codes_list = zip_codes

        yield json.dumps({
            "type": "progress",
            "message": f"Starting search for {len(zip_codes_list)} zip codes..."}) + "\n"

        gmaps = googlemaps.Client(key=api_key)
        places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        
        all_car_washes = {}  # Use a dictionary to store unique car washes (for deduplication)

        for zip_code in zip_codes_list:
            yield json.dumps({"type": "progress", "message": f"Getting coordinates for car washes in {zip_code}"}) + "\n"
            try:
                geocode_result = gmaps.geocode(f"{zip_code}, USA")
                if not geocode_result:
                    yield json.dumps({"type": "progress", "message": f"Could not find coordinates for zip code {zip_code}"}) + "\n"
                    continue
                
                location = geocode_result[0]['geometry']['location']
            except Exception as e:
                yield json.dumps({"type": "progress", "message": f"Error geocoding zip code {zip_code}: {str(e)}"}) + "\n"
                continue

            yield json.dumps({"type": "progress", "message": f"Searching for car washes within {zipcode_radius}m radius of {zip_code}"}) + "\n"

            params = {
                "key": api_key,
                "location": f"{location['lat']},{location['lng']}",
                "radius": zipcode_radius,
                "type": "car_wash",
                "keyword": "car wash"
            }
            
            next_page_token = None
            callcount = 0

            while True:
                success, message, counts = check_api_call_limit("nearby_search", daily_limit=800, monthly_limit=3800)
                if not success:
                    yield json.dumps({"error": f"Limit exceeded: {message}. Total calls: {counts['total_calls']}, Monthly calls: {counts['monthly_calls']}, Daily calls: {counts['daily_calls']}."}) + "\n"
                    return

                if next_page_token:
                    params["pagetoken"] = next_page_token
                
                response = requests.get(places_url, params=params)
                results = response.json()
                
                if results.get("status") != "OK":
                    yield json.dumps({"type": "progress", "message": f"Error for zip code {zip_code}: {results.get('status')}"}) + "\n"
                    break
                
                for place in results.get("results", []):
                    place_id = place['place_id']
                    if place_id not in all_car_washes:
                        all_car_washes[place_id] = {
                            "name": place["name"],
                            "address": place.get("formattedAddress"),
                            "goog_rating": place.get("rating"),
                            "phone": place.get("nationalPhoneNumber"),
                            "website": place.get("websiteUri"),
                            "lat": place["geometry"]["location"]["lat"],
                            "lng": place["geometry"]["location"]["lng"],
                            "goog_places_id": place_id,
                            "zip_codes_nearby": [zip_code]
                        }
                    else:
                        if zip_code not in all_car_washes[place_id]["zip_codes_nearby"]:
                            all_car_washes[place_id]["zip_codes_nearby"].append(zip_code)
                
                next_page_token = results.get("next_page_token")
                callcount += 1
                if not next_page_token or callcount >= 3:
                    break
                
                await asyncio.sleep(2)

            yield json.dumps({"type": "progress", "message": f"Completed search for {zip_code}"}) + "\n"

        final_results = list(all_car_washes.values())
        yield json.dumps({
            "type": "result",
            "message": "Search complete",
            "results": final_results,
            "num_results": len(final_results),
            "num_zip_codes": len(zip_codes_list)
        }) + "\n"

    return StreamingResponse(generate(), media_type="text/event-stream")