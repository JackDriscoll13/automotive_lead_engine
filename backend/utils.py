# Utility functions for the backend

import json
import os
from datetime import datetime

def check_api_call_limit(api_key, daily_limit=800, monthly_limit=5800):
    filename = f"{api_key}_calls.json"
    current_date = datetime.now().date()
    current_month = datetime.now().month
    if not os.path.exists(filename):
        data = {
            "total_count": 0,
            "monthly_count": 0,
            "daily_count": 0,
            "last_call_date": str(current_date),
            "current_month": current_month
        }
    else:
        with open(filename, "r") as file:
            data = json.load(file)
    
    last_call_date = datetime.strptime(data["last_call_date"], "%Y-%m-%d").date()
    if current_date > last_call_date:
        data["daily_count"] = 0  # Reset daily count for a new day
    
    if data["current_month"] != current_month:
        data["monthly_count"] = 0  # Reset monthly count for a new month
        data["current_month"] = current_month
    
    # Increment counts
    data["total_count"] += 1
    data["monthly_count"] += 1
    data["daily_count"] += 1
    data["last_call_date"] = str(current_date)  # Update last call date
    
    # Check daily or monthly limit and prepare return data
    counts = {
        "total_calls": data["total_count"],
        "monthly_calls": data["monthly_count"],
        "daily_calls": data["daily_count"]
    }
    
    if data["daily_count"] > daily_limit:
        return False, "Daily limit exceeded", counts
    elif data["monthly_count"] > monthly_limit:
        return False, "Monthly limit exceeded", counts
    
    with open(filename, "w") as file:
        json.dump(data, file)
    
    return True, "", counts  # No limit exceeded



# Foor working retrieving secrets from AWS Secrets Manager
# import boto3
# from botocore.exceptions import ClientError


# def get_secret():

#     secret_name = "google_maps_api_key_carwash"
#     region_name = "us-east-2"

#     # Create a Secrets Manager client
#     session = boto3.session.Session()
#     client = session.client(
#         service_name='secretsmanager',
#         region_name=region_name
#     )

#     try:
#         get_secret_value_response = client.get_secret_value(
#             SecretId=secret_name
#         )
#     except ClientError as e:
#         # For a list of exceptions thrown, see
#         # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
#         raise e

#     secret = get_secret_value_response['SecretString']

#     # Your code goes here.