"""
OpenWeather API service for weather data and farming advisories
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

def get_weather_data(lat=None, lon=None, city=None):
    """
    Get weather data from OpenWeather API
    
    Args:
        lat: Latitude
        lon: Longitude  
        city: City name (alternative to lat/lon)
    
    Returns:
        dict: Weather data
    """
    try:
        if not OPENWEATHER_API_KEY:
            return {
                'current': {'temp': 25, 'humidity': 60, 'description': 'Partly cloudy'},
                'forecast': [],
                'error': 'API key not configured'
            }
        
        if city:
            # Get coordinates for city
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct"
            geo_params = {
                'q': city,
                'limit': 1,
                'appid': OPENWEATHER_API_KEY
            }
            geo_response = requests.get(geo_url, params=geo_params, timeout=10)
            
            if geo_response.status_code == 200:
                geo_data = geo_response.json()
                if geo_data:
                    lat = geo_data[0]['lat']
                    lon = geo_data[0]['lon']
                else:
                    return {'error': 'City not found'}
            else:
                return {'error': 'Geocoding failed'}
        
        if not lat or not lon:
            return {'error': 'Location not provided'}
        
        # Get current weather
        current_url = "https://api.openweathermap.org/data/2.5/weather"
        current_params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        
        current_response = requests.get(current_url, params=current_params, timeout=10)
        
        if current_response.status_code != 200:
            return {'error': 'Weather API failed'}
        
        current_data = current_response.json()
        
        # Get 5-day forecast
        forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
        forecast_params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        
        forecast_response = requests.get(forecast_url, params=forecast_params, timeout=10)
        forecast_data = forecast_response.json() if forecast_response.status_code == 200 else {'list': []}
        
        return {
            'current': {
                'temp': current_data['main']['temp'],
                'humidity': current_data['main']['humidity'],
                'description': current_data['weather'][0]['description'],
                'wind_speed': current_data['wind']['speed'],
                'pressure': current_data['main']['pressure']
            },
            'forecast': forecast_data.get('list', [])[:5]  # Next 5 periods
        }
        
    except Exception as e:
        print(f"Error getting weather data: {e}")
        return {
            'current': {'temp': 25, 'humidity': 60, 'description': 'Partly cloudy'},
            'forecast': [],
            'error': str(e)
        }

def advisory_from_weather(weather_data):
    """
    Generate farming advisory based on weather data
    
    Args:
        weather_data: Weather data from get_weather_data()
    
    Returns:
        dict: {'marathi': str, 'english': str}
    """
    try:
        current = weather_data.get('current', {})
        temp = current.get('temp', 25)
        humidity = current.get('humidity', 60)
        description = current.get('description', '')
        wind_speed = current.get('wind_speed', 0)
        
        # Generate advisory based on conditions
        marathi_advisory = ""
        english_advisory = ""
        
        # Temperature advice
        if temp < 15:
            marathi_advisory += "• तापमान कमी आहे. संवेदनशील पिकांना संरक्षण द्या.\n"
            english_advisory += "• Temperature is low. Protect sensitive crops.\n"
        elif temp > 35:
            marathi_advisory += "• तापमान जास्त आहे. पाणीपुरवठा वाढवा आणि छाया द्या.\n"
            english_advisory += "• Temperature is high. Increase irrigation and provide shade.\n"
        
        # Humidity advice
        if humidity > 80:
            marathi_advisory += "• आर्द्रता जास्त आहे. फंगल रोगांवर लक्ष द्या.\n"
            english_advisory += "• High humidity. Watch for fungal diseases.\n"
        elif humidity < 30:
            marathi_advisory += "• आर्द्रता कमी आहे. पाणीपुरवठा वाढवा.\n"
            english_advisory += "• Low humidity. Increase irrigation.\n"
        
        # Wind advice
        if wind_speed > 10:
            marathi_advisory += "• वाऱ्याची गती जास्त आहे. तरुण पिकांना संरक्षण द्या.\n"
            english_advisory += "• High wind speed. Protect young crops.\n"
        
        # Weather condition advice
        if 'rain' in description.lower():
            marathi_advisory += "• पाऊस पडत आहे. पाण्याचा निचरा सुनिश्चित करा.\n"
            english_advisory += "• Rain expected. Ensure proper drainage.\n"
        elif 'clear' in description.lower():
            marathi_advisory += "• स्पष्ट हवामान. पिकांची नियमित तपासणी करा.\n"
            english_advisory += "• Clear weather. Regular crop monitoring recommended.\n"
        
        if not marathi_advisory:
            marathi_advisory = "• सामान्य हवामान. नियमित शेतीच्या कामांना पुढे चालवा.\n"
            english_advisory = "• Normal weather. Continue regular farming activities.\n"
        
        return {
            'marathi': marathi_advisory,
            'english': english_advisory
        }
        
    except Exception as e:
        print(f"Error generating weather advisory: {e}")
        return {
            'marathi': "हवामानाची माहिती उपलब्ध नाही.",
            'english': "Weather information not available."
        }

