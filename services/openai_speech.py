"""
OpenAI Speech-to-Text service using Whisper API
"""

import os
import openai
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

def transcribe(audio_bytes, mime_type):
    """
    Transcribe audio to Marathi text using OpenAI Whisper
    
    Args:
        audio_bytes: Raw audio data
        mime_type: MIME type of the audio (e.g., 'audio/webm')
    
    Returns:
        str: Transcribed text in Marathi
    """
    try:
        # Create a temporary file for the audio
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_file_path = temp_file.name
        
        # Transcribe using OpenAI Whisper
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        with open(temp_file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="mr"  # Marathi language code
            )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return transcript.text.strip()
        
    except Exception as e:
        print(f"Error in transcription: {e}")
        return "क्षमस्व, मी तुमचा संदेश समजू शकत नाही. कृपया पुन्हा प्रयत्न करा."

