# Utility functions for the backend

import json
import os
from datetime import datetime

def check_api_call_limit_new(endpoint_name:str, 
                             daily_limit:int=800, monthly_limit:int=5800):
    """
    Check if the API call limit has been reached for a specific endpoint.

    This function manages and tracks API call counts on a daily and monthly basis,
    ensuring that usage stays within specified limits. It maintains a JSON file
    to persist call counts across application restarts.

    Args:
        endpoint_name (str): A description or identifier for the API endpoint. Either "nearby_search_calls" or "text_search_calls"
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

    filename = "search_counts_all.json"
    current_date = datetime.now().date()
    current_month = datetime.now().month
    if not os.path.exists(filename):
        print("File does not exist. Creating new file. ")
        # If the file does not exist, we need to create it and initialize the counts
        all_data = initialize_search_counts_file(filename)
        data = all_data[endpoint_name]

    else:
        with open(filename, "r") as file:
            all_data = json.load(file)
            data = all_data[endpoint_name]
    
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
    
    print("Updating the file with the new counts")
    print(f"The new counts are: {data}")
    print(f"The full file is: {all_data}")
    print(f"The endpoint name is: {endpoint_name}")

    # We don't want to update the app_search_counts for geocode_calls, since that's a separate endpoint
    all_data[endpoint_name] = data
    new_file = all_data
    print(f"The new file will be: {new_file}")

    # We can update the file with the new counts
    with open(filename, "w") as file:
        json.dump(new_file, file)
    return True, "", counts  # No limit exceeded




# Just in case the file is not there, we can initialize it with default values
def initialize_search_counts_file(filename):
    """
    Initialize the search counts file with default values.
    """
    initial_data = {
        "app_search_counts": {
            "regional_total": 0,
            "zip_code_total": 0
        },
        "nearby_search_calls": {
            "total_count": 0,
            "monthly_count": 0,
            "daily_count": 0,
            "last_call_date": datetime.now().strftime("%Y-%m-%d"),
            "current_month": datetime.now().month
        },
        "text_search_calls": {
            "total_count": 0,
            "monthly_count": 0,
            "daily_count": 0,
            "last_call_date": datetime.now().strftime("%Y-%m-%d"),
            "current_month": datetime.now().month
        }
    }

    with open(filename, "w") as file:
        json.dump(initial_data, file, indent=4)

    return initial_data