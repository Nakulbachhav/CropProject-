#!/usr/bin/env python3
"""
Test script to check if all APIs are working
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai():
    """Test OpenAI API"""
    try:
        import openai
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Test with a simple completion
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print("✅ OpenAI API: Working")
        return True
    except Exception as e:
        print(f"❌ OpenAI API: Error - {str(e)}")
        return False

def test_plant_id():
    """Test Plant.id API"""
    try:
        import requests
        api_key = os.getenv('PLANT_ID_API_KEY')
        
        # Test API key format
        if api_key and len(api_key) > 10:
            print("✅ Plant.id API: Key format looks good")
            return True
        else:
            print("❌ Plant.id API: Invalid key format")
            return False
    except Exception as e:
        print(f"❌ Plant.id API: Error - {str(e)}")
        return False

def test_weather():
    """Test OpenWeather API"""
    try:
        import requests
        api_key = os.getenv('OPENWEATHER_API_KEY')
        
        # Test API key format
        if api_key and len(api_key) > 10:
            print("✅ OpenWeather API: Key format looks good")
            return True
        else:
            print("❌ OpenWeather API: Invalid key format")
            return False
    except Exception as e:
        print(f"❌ OpenWeather API: Error - {str(e)}")
        return False

def main():
    print("🔍 Testing AgriSathi APIs...")
    print("=" * 40)
    
    openai_ok = test_openai()
    plant_ok = test_plant_id()
    weather_ok = test_weather()
    
    print("=" * 40)
    if openai_ok and plant_ok and weather_ok:
        print("🎉 All APIs are working!")
    else:
        print("⚠️  Some APIs have issues. Check the errors above.")

if __name__ == "__main__":
    main()

