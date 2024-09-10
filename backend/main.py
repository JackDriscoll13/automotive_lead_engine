# Fast API main file
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import os
import time

# Env 
from dotenv import load_dotenv

# Local Imports 
from carwash_regional import get_all_car_washes
from carwash_zipcode import generate_carwashes_by_zipcode2



#  Just defining my models here for simplicity
from pydantic import BaseModel

class SearchCarwashesRequest(BaseModel):
    region: str

class SearchZipCodesRequest(BaseModel):
    zip_codes: str | list[str]
    included_types: str | list[str]
    radius: int = 5000


app = FastAPI()

# Define allowed origins
allowed_origins = [
    "https://qfresheners.com",
    "https://www.qfresheners.com",
    # If developing locally, e.g.:
    "http://localhost:5173",
]

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


@app.post("/search_carwashes_regions")
def search_carwashes(request: SearchCarwashesRequest):
    """Get a list of car washes in a region"""
    # print(f"api key: {GOOGLE_API_KEY}")
    start_time = time.time()
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
    print('Zip codes: ', request.zip_codes)
    print('Included types: ', request.included_types)
    # This endpoint is basically a generator that returns a yield of data to the frontend through a streaming response
    return StreamingResponse(generate_carwashes_by_zipcode2(GOOGLE_API_KEY, request.zip_codes, request.included_types, request.radius), media_type="text/event-stream")
    

