# Utility functions for the backend

import json
import os
from datetime import datetime

def check_api_call_limit(endpoint_desc:str, daily_limit:int=800, monthly_limit:int=5800):
    """
    Check if the API call limit has been reached for a specific endpoint.

    This function manages and tracks API call counts on a daily and monthly basis,
    ensuring that usage stays within specified limits. It maintains a JSON file
    to persist call counts across application restarts.

    Args:
        endpoint_desc (str): A description or identifier for the API endpoint.
        daily_limit (int, optional): Maximum number of calls allowed per day. Defaults to 800.
        monthly_limit (int, optional): Maximum number of calls allowed per month. Defaults to 5800.

    Returns:
        tuple: A tuple containing three elements:
            - bool: True if the call is within limits, False otherwise.
            - str: An error message if a limit is exceeded, empty string otherwise.
            - dict: Current call counts, including total, monthly, and daily calls.

    Side effects:
        - Creates or updates a JSON file named '{endpoint_desc}_calls.json' to track API calls.
        - Increments call counts and updates timestamps in the JSON file.

    Note:
        This function resets daily counts at the start of each new day and
        monthly counts at the beginning of each new month.
    
    """

    filename = f"{endpoint_desc}_calls.json"
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

#     secret_name = "google_maps_endpoint_desc_carwash"
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