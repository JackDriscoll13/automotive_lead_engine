################################################################################
#### IMPORTS ####
################################################################################
# FastApi Imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Python Imports
import os
import time
import json
from datetime import datetime
from dotenv import load_dotenv

# Local Imports 
from carwash_regional import get_all_car_washes
from carwash_zipcode import generate_carwashes_by_zipcode2
from check_api_call_limit import increment_app_search_counts
from retrieve_analytics import retrieve_analytics_data


#  Just defining my models here for simplicity
class SearchCarwashesRequest(BaseModel):
    region: str

class SearchZipCodesRequest(BaseModel):
    zip_codes: str | list[str]
    included_types: str | list[str]
    radius: int = 5000


################################################################################
#### SETUP ####
################################################################################
app = FastAPI()

# Define allowed origins
allowed_origins = [
    "https://qfresheners.com",
    "https://www.qfresheners.com",
    # If developing locally, e.g.:
    "http://localhost:5173",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  
    allow_headers=["*"],  
)

# Load the api key from dotenv:
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No API key found. Please set the GOOGLE_MAPS_API_KEY environment variable in the .env file.")

################################################################################
#### MAIN TWO ENDPOINTS ####
################################################################################
@app.post("/search_carwashes_regions")
def search_carwashes(request: SearchCarwashesRequest):
    """Get a list of car washes in a region"""
    start_time = time.time()
    # Increment the regional total
    increment_app_search_counts("regional_total")
    # Call the primary function
    car_washes_result = get_all_car_washes(GOOGLE_API_KEY, request.region)
    if "error" in car_washes_result:
        # Return or handle the error message as needed for the frontend
        return car_washes_result
    else: 
        num_results = len(car_washes_result)
        total_time = round((time.time() - start_time), 2)
        return {'results': car_washes_result, 'num_results': num_results, 'exc_time': total_time}
    

@app.post("/search_carwashes_zipcodes")
async def search_carwashes(request: SearchZipCodesRequest):
    """Take a list of zip codes and return a robust list of car washes for each zip code."""
    increment_app_search_counts("zip_code_total")
    # This endpoint is basically a generator that returns a yield of data to the frontend through a streaming response
    return StreamingResponse(generate_carwashes_by_zipcode2(GOOGLE_API_KEY, request.zip_codes, request.included_types, request.radius), media_type="text/event-stream")

################################################################################
#### ANALYTICS ENDPOINT for Analytics Dashboard, and Utility Endpoint to check Current API Call Limits
################################################################################
@app.get("/api_analytics")
def api_analytics():
    """Get API analytics data"""
    analytics_data = retrieve_analytics_data()
    # Filter the data for the current date
    return analytics_data

@app.get("/check_api_call_limits")
def check_api_call_limits():
    """Check the current API self imposed call limit for all endpoints used in this app"""
    # Read in the api_limit_config.json file
    with open('api_limit_config.json', 'r') as file:
        api_limits = json.load(file)
    return api_limits

################################################################################
