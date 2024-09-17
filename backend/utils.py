import json
from datetime import datetime

def increment_app_search_counts(search_label:str):
    """
    Increment the regional total for a specific feature.

    Args:
        search_label (str): The name of the search label to increment. Either "regional_total" or "zip_code_total"
    """
    filename = "search_counts_all.json"
    with open(filename, "r") as file:
        data = json.load(file)
    data["app_search_counts"][search_label] += 1
    with open(filename, "w") as file:
        json.dump(data, file)



# Just in case the json data file for analytics is not there, we can initialize it with default values
# Used in check_api_call_limit.py
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