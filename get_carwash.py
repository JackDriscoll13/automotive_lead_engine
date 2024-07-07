import requests
import json
def get_carwash_json(api_key:str, region:str): 
    """Get a list of car washes in a region"""
    endpoint = "https://places.googleapis.com/v1/places:searchText"

    # Set the request headers
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,  
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.priceLevel'
    }

    # Define the JSON payload
    payload = {
        "textQuery": f"All call washes and car detailing in {region}"
    }

    # Send the Post request
    response = requests.post(endpoint, json=payload, headers=headers)
    # Check for successful response
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()
        print(data)
    else:
        print(f"Error: {response.status_code}")
        print(response.text)





# Testing functions
from dotenv import load_dotenv
import os


if __name__ == "__main__":
    # Load the api key from dotenv: 
    load_dotenv()
    API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')
    if not API_KEY:
        raise ValueError("No API key found. Please set the GOOGLE_MAPS_API_KEY environment variable in the .env file.")

    # Test the function 
    response = get_carwash_json(API_KEY, 'San Francisco')
    
    
