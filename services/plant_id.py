"""
Plant.id API service for plant identification and disease detection
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

PLANT_ID_API_KEY = os.getenv('PLANT_ID_API_KEY')
PLANT_ID_BASE_URL = "https://api.plant.id/v3"

def identify_plant(image_bytes):
    """
    Identify plant species and diseases using Plant.id API
    
    Args:
        image_bytes: Raw image data
    
    Returns:
        dict: Plant identification results
    """
    try:
        if not PLANT_ID_API_KEY:
            return {
                'plant_name': 'Unknown Plant',
                'confidence': 0,
                'diseases': [],
                'suggestions': 'API key not configured'
            }
        
        # Prepare the request
        files = {
            'images': ('image.jpg', image_bytes, 'image/jpeg')
        }
        
        data = {
            'modifiers': ['similar_images'],
            'plant_details': ['common_names', 'url', 'wiki_description', 'taxonomy'],
            'disease_details': ['common_names', 'url', 'description', 'treatment']
        }
        
        headers = {
            'Api-Key': PLANT_ID_API_KEY
        }
        
        # Make API request
        response = requests.post(
            f"{PLANT_ID_BASE_URL}/identification",
            files=files,
            data=data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract top suggestion
            if result.get('suggestions'):
                top_suggestion = result['suggestions'][0]
                plant_name = top_suggestion.get('plant_name', 'Unknown Plant')
                confidence = top_suggestion.get('probability', 0) * 100
                
                # Extract diseases if any
                diseases = []
                if 'diseases' in top_suggestion:
                    for disease in top_suggestion['diseases']:
                        diseases.append({
                            'name': disease.get('name', 'Unknown Disease'),
                            'probability': disease.get('probability', 0) * 100,
                            'treatment': disease.get('treatment', {})
                        })
                
                return {
                    'plant_name': plant_name,
                    'confidence': confidence,
                    'diseases': diseases,
                    'suggestions': top_suggestion.get('plant_details', {}),
                    'raw_response': result
                }
            else:
                return {
                    'plant_name': 'Unknown Plant',
                    'confidence': 0,
                    'diseases': [],
                    'suggestions': 'No suggestions found'
                }
        else:
            return {
                'plant_name': 'Unknown Plant',
                'confidence': 0,
                'diseases': [],
                'suggestions': f'API error: {response.status_code}'
            }
            
    except Exception as e:
        print(f"Error in plant identification: {e}")
        return {
            'plant_name': 'Unknown Plant',
            'confidence': 0,
            'diseases': [],
            'suggestions': f'Error: {str(e)}'
        }

def to_bilingual_summary(result):
    """
    Convert plant identification result to bilingual summary
    
    Args:
        result: Plant identification result from identify_plant()
    
    Returns:
        dict: {'marathi': str, 'english': str}
    """
    plant_name = result.get('plant_name', 'Unknown Plant')
    confidence = result.get('confidence', 0)
    diseases = result.get('diseases', [])
    
    # Marathi summary
    marathi_text = f"ओळखलेले वनस्पती: {plant_name}\n"
    marathi_text += f"आत्मविश्वास: {confidence:.1f}%\n\n"
    
    if diseases:
        marathi_text += "संभाव्य रोग:\n"
        for disease in diseases[:3]:  # Top 3 diseases
            marathi_text += f"• {disease['name']} ({disease['probability']:.1f}%)\n"
    else:
        marathi_text += "कोणताही रोग आढळला नाही.\n"
    
    # English summary
    english_text = f"Identified Plant: {plant_name}\n"
    english_text += f"Confidence: {confidence:.1f}%\n\n"
    
    if diseases:
        english_text += "Possible Diseases:\n"
        for disease in diseases[:3]:  # Top 3 diseases
            english_text += f"• {disease['name']} ({disease['probability']:.1f}%)\n"
    else:
        english_text += "No diseases detected.\n"
    
    return {
        'marathi': marathi_text,
        'english': english_text
    }

