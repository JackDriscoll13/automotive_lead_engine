from datetime import datetime 
import json

def retrieve_analytics_data():
        
    # Read in the analytics data
    try:
        with open('search_counts_all.json', 'r') as file:
            analytics_data = json.load(file)
    except FileNotFoundError:
        return {"error": "Analytics data file not found"}
    except json.JSONDecodeError:
        return {"error": "Error decoding analytics data"}  
    
    print('Analytics data: ')
    print(analytics_data)

    # Get the current date
    current_date = datetime.now().strftime("%Y-%m-%d")

    # Initialize the new data dictionary with nested structures
    new_data = {
        'app_search_counts': analytics_data['app_search_counts'],
        'nearby_search_calls': {},
        'text_search_calls': {},
        'geocode_calls': {}
    }

    # Nearby search calls
    if current_date == analytics_data['nearby_search_calls']['last_call_date']:
        new_data['nearby_search_calls']['monthly_count_not_today'] = analytics_data['nearby_search_calls']['monthly_count'] - analytics_data['nearby_search_calls']['daily_count']
        new_data['nearby_search_calls']['daily_count'] = analytics_data['nearby_search_calls']['daily_count']
    else:
        new_data['nearby_search_calls']['monthly_count_not_today'] = analytics_data['nearby_search_calls']['monthly_count']
        new_data['nearby_search_calls']['daily_count'] = 0

    # Text search calls
    if current_date == analytics_data['text_search_calls']['last_call_date']:
        new_data['text_search_calls']['monthly_count_not_today'] = analytics_data['text_search_calls']['monthly_count'] - analytics_data['text_search_calls']['daily_count']
        new_data['text_search_calls']['daily_count'] = analytics_data['text_search_calls']['daily_count']
    else:
        new_data['text_search_calls']['monthly_count_not_today'] = analytics_data['text_search_calls']['monthly_count']
        new_data['text_search_calls']['daily_count'] = 0
        
    # Geocode calls
    if current_date == analytics_data['geocode_calls']['last_call_date']:
        new_data['geocode_calls']['monthly_count_not_today'] = analytics_data['geocode_calls']['monthly_count'] - analytics_data['geocode_calls']['daily_count']
        new_data['geocode_calls']['daily_count'] = analytics_data['geocode_calls']['daily_count']
    else:
        new_data['geocode_calls']['monthly_count_not_today'] = analytics_data['geocode_calls']['monthly_count']
        new_data['geocode_calls']['daily_count'] = 0
    
    print(f"New data: {new_data}")

    return new_data