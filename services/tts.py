"""
Text-to-Speech service for Marathi using gTTS
"""

import os
import uuid
from gtts import gTTS
from dotenv import load_dotenv

load_dotenv()

def speak_marathi(text):
    """
    Convert Marathi text to speech and save as MP3
    
    Args:
        text: Marathi text to convert to speech
    
    Returns:
        str: Relative URL to the generated MP3 file
    """
    try:
        # Generate unique filename
        filename = f"answer-{uuid.uuid4().hex[:8]}.mp3"
        filepath = os.path.join('static', 'media', filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Create TTS object for Marathi
        tts = gTTS(text=text, lang='mr', slow=False)
        
        # Save to file
        tts.save(filepath)
        
        # Return relative URL
        return f"/media/{filename}"
        
    except Exception as e:
        print(f"Error in TTS generation: {e}")
        # Return a placeholder or error audio file
        return "/media/error.mp3"

