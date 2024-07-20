# Utility functions for the backend

import json
import os
from datetime import datetime

def check_api_call_limit(api_key, limit=100):
    filename = f"{api_key}_calls.json"
    if not os.path.exists(filename):
        data = {"count": 0, "last_reset": str(datetime.now().date())}
    else:
        with open(filename, "r") as file:
            data = json.load(file)
    
    last_reset = datetime.strptime(data["last_reset"], "%Y-%m-%d").date()
    if datetime.now().date() > last_reset:
        data = {"count": 1, "last_reset": str(datetime.now().date())}
    else:
        if data["count"] >= limit:
            return False
        data["count"] += 1
    
    with open(filename, "w") as file:
        json.dump(data, file)
    
    return True



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