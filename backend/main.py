# Fast API main file
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import time
# Local Imports 
from carwash_regional import get_all_car_washes
from utils import check_api_call_limit
# 
from pydantic import BaseModel

class SearchCarwashesRequest(BaseModel):
    region: str


app = FastAPI()

# Define allowed origins
allowed_origins = [
    "https://qfresheners.com",
    "https://www.qfresheners.com",
    # Include your local development URL if needed, e.g.:
    # "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Specify the HTTP methods you want to allow
    allow_headers=["*"],  # You might want to restrict this to specific headers
)
load_dotenv()

# Load the api key from dotenv:
GOOGLE_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No API key found. Please set the GOOGLE_MAPS_API_KEY environment variable in the .env file.")

@app.post("/search_carwashes")
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
    

