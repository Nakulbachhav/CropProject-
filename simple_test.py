#!/usr/bin/env python3
"""
Simple test script to check APIs
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
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print("OpenAI API: Working")
        return True
    except Exception as e:
        print(f"OpenAI API: Error - {str(e)}")
        return False

def main():
    print("Testing AgriSathi APIs...")
    print("=" * 40)
    
    openai_ok = test_openai()
    
    print("=" * 40)
    if openai_ok:
        print("OpenAI API is working!")
    else:
        print("OpenAI API has issues.")

if __name__ == "__main__":
    main()
