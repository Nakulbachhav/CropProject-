"""
Common utilities and helpers for AgriSathi
"""

import os
from dotenv import load_dotenv

load_dotenv()

def validate_api_keys():
    """Check if required API keys are available"""
    required_keys = [
        'OPENAI_API_KEY',
        'PLANT_ID_API_KEY', 
        'OPENWEATHER_API_KEY'
    ]
    
    available_keys = []
    for key in required_keys:
        if os.getenv(key):
            available_keys.append(key)
    
    return {
        'openai': 'OPENAI_API_KEY' in available_keys,
        'plant_id': 'PLANT_ID_API_KEY' in available_keys,
        'weather': 'OPENWEATHER_API_KEY' in available_keys,
        'all_available': len(available_keys) == len(required_keys)
    }

def translate_to_marathi(text):
    """Simple translation helper - in production, use proper translation service"""
    # This is a placeholder - in a real app, you'd use Google Translate API or similar
    return f"[Marathi translation of: {text}]"

def format_confidence(confidence):
    """Format confidence percentage"""
    if confidence is None:
        return "Unknown"
    return f"{confidence:.1f}%"

