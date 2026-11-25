#!/usr/bin/env python3
"""
Test if API key is valid
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_key():
    """Test if API key is valid"""
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("No API key found")
        return False
    
    if api_key.startswith('sk-'):
        print("API key format looks correct")
        print(f"Key starts with: {api_key[:10]}...")
        return True
    else:
        print("API key format looks incorrect")
        print(f"Key starts with: {api_key[:10]}...")
        return False

if __name__ == "__main__":
    test_api_key()

