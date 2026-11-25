"""
OpenAI Chat service using GPT-4o-mini for agricultural assistance
"""

import os
import openai
from dotenv import load_dotenv
import re

load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

def ask_agri_assistant(user_text):
    """
    Get agricultural advice from AI assistant in Marathi and English
    
    Args:
        user_text: User's question in Marathi or English
    
    Returns:
        dict: {'marathi': str, 'english': str}
    """
    try:
        system_prompt = """You are AgriSathi, an expert agricultural assistant for Indian farmers. 
        
        Always respond in this exact format:
        <mr>Your answer in Marathi (Devanagari script)</mr>
        <en>Your answer in English</en>
        
        Guidelines:
        - Be practical and specific to Indian farming conditions
        - Use simple, clear language that farmers can understand
        - Focus on actionable advice
        - Mention relevant crops, seasons, and regional considerations
        - Keep responses concise but informative
        - If asked about diseases, mention symptoms and treatments
        - If asked about fertilizers, mention specific NPK ratios and organic alternatives
        - If asked about weather, give farming-specific advice"""
        
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        
        # Parse Marathi and English sections
        marathi_match = re.search(r'<mr>(.*?)</mr>', content, re.DOTALL)
        english_match = re.search(r'<en>(.*?)</en>', content, re.DOTALL)
        
        marathi_text = marathi_match.group(1).strip() if marathi_match else "माफ करा, मी तुमच्या प्रश्नाचे उत्तर देऊ शकत नाही."
        english_text = english_match.group(1).strip() if english_match else "Sorry, I couldn't provide an answer to your question."
        
        return {
            'marathi': marathi_text,
            'english': english_text
        }
        
    except Exception as e:
        print(f"Error in chat completion: {e}")
        return {
            'marathi': "माफ करा, तांत्रिक समस्या आहे. कृपया पुन्हा प्रयत्न करा.",
            'english': "Sorry, there's a technical issue. Please try again."
        }

