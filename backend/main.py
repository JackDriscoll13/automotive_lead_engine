# Fast API main file
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
# Local Imports 
from carwash_regional import get_all_car_washes

# 
from pydantic import BaseModel

class SearchCarwashesRequest(BaseModel):
    region: str




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # My frontend url (localhost )
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()

# Load the api key from dotenv:
GOOGLE_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("No API key found. Please set the GOOGLE_MAPS_API_KEY environment variable in the .env file.")

@app.post("/search_carwashes")
def search_carwashes(request: SearchCarwashesRequest):
    """Get a list of car washes in a region"""
    car_washes = get_all_car_washes(GOOGLE_API_KEY, request.region)
    return car_washes
