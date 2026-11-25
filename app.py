"""
AgriSathi - AI Assistant for Farmers
Flask web application with Marathi-first bilingual support
"""

import os
import uuid
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'static/media'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import services
from services.openai_speech import transcribe
from services.openai_chat import ask_agri_assistant
from services.tts import speak_marathi
from services.plant_id import identify_plant, to_bilingual_summary
from services.weather import get_weather_data, advisory_from_weather
from services.fertilizer import get_fertilizer_recommendation
from services.crop_reco import get_crop_recommendations
from services.utils import validate_api_keys

# Check if we have required API keys
api_keys_available = validate_api_keys()

@app.route('/')
def index():
    """Landing page with features overview"""
    return render_template('index.html', api_keys_available=api_keys_available)

@app.route('/chat')
def chat():
    """Voice-first chatbot interface"""
    return render_template('chat.html')

@app.route('/disease')
def disease():
    """Plant disease detection page"""
    return render_template('disease.html')

@app.route('/fertilizer')
def fertilizer():
    """Fertilizer recommendation page"""
    return render_template('fertilizer.html')

@app.route('/crop')
def crop():
    """Crop recommendation page"""
    return render_template('crop.html')

@app.route('/weather')
def weather():
    """Weather advisory page"""
    return render_template('weather.html')

# API Routes

@app.route('/api/chat', methods=['POST'])
def api_chat():
    """Handle voice/text chat with AI assistant"""
    try:
        if 'audio' in request.files:
            # Voice input
            audio_file = request.files['audio']
            if audio_file.filename == '':
                return jsonify({'ok': False, 'error': 'No audio file provided'})
            
            # Transcribe audio to Marathi text
            audio_bytes = audio_file.read()
            mime_type = audio_file.content_type or 'audio/webm'
            user_text = transcribe(audio_bytes, mime_type)
            
        elif request.json and 'text' in request.json:
            # Text input
            user_text = request.json['text']
        else:
            return jsonify({'ok': False, 'error': 'No audio or text provided'})
        
        if not user_text.strip():
            return jsonify({'ok': False, 'error': 'Empty input'})
        
        # Get AI response
        response = ask_agri_assistant(user_text)
        
        # Generate Marathi TTS
        audio_url = speak_marathi(response['marathi'])
        
        return jsonify({
            'ok': True,
            'marathi': response['marathi'],
            'english': response['english'],
            'audio_url': audio_url
        })
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

@app.route('/api/disease', methods=['POST'])
def api_disease():
    """Plant disease detection API"""
    try:
        if 'file' not in request.files:
            return jsonify({'ok': False, 'error': 'No image file provided'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'ok': False, 'error': 'No file selected'})
        
        # Identify plant
        image_bytes = file.read()
        result = identify_plant(image_bytes)
        
        # Convert to bilingual summary
        summary = to_bilingual_summary(result)
        
        return jsonify({
            'ok': True,
            'marathi': summary['marathi'],
            'english': summary['english'],
            'confidence': result.get('confidence', 0),
            'plant_name': result.get('plant_name', 'Unknown')
        })
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

@app.route('/api/fertilizer', methods=['POST'])
def api_fertilizer():
    """Fertilizer recommendation API"""
    try:
        data = request.json
        if not data:
            return jsonify({'ok': False, 'error': 'No data provided'})
        
        # Validate required fields
        required_fields = ['pH', 'N', 'P', 'K']
        for field in required_fields:
            if field not in data:
                return jsonify({'ok': False, 'error': f'Missing field: {field}'})
        
        # Get recommendation
        recommendation = get_fertilizer_recommendation(
            pH=data['pH'],
            N=data['N'],
            P=data['P'],
            K=data['K'],
            crop=data.get('crop', '')
        )
        
        return jsonify({
            'ok': True,
            'marathi': recommendation['marathi'],
            'english': recommendation['english'],
            'soil_condition': recommendation.get('soil_condition', ''),
            'recommendations': recommendation.get('recommendations', [])
        })
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

@app.route('/api/crop', methods=['POST'])
def api_crop():
    """Crop recommendation API"""
    try:
        data = request.json
        if not data:
            return jsonify({'ok': False, 'error': 'No data provided'})
        
        # Get crop recommendations
        recommendations = get_crop_recommendations(
            soil=data.get('soil', {}),
            season=data.get('season', ''),
            region=data.get('region', '')
        )
        
        return jsonify({
            'ok': True,
            'marathi': recommendations['marathi'],
            'english': recommendations['english'],
            'crops': recommendations.get('crops', [])
        })
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

@app.route('/api/weather', methods=['GET', 'POST'])
def api_weather():
    """Weather advisory API"""
    try:
        if request.method == 'GET':
            # Get coordinates from query params
            lat = request.args.get('lat')
            lon = request.args.get('lon')
            if not lat or not lon:
                return jsonify({'ok': False, 'error': 'Latitude and longitude required'})
        else:
            # Get city from POST body
            data = request.json
            if not data or 'city' not in data:
                return jsonify({'ok': False, 'error': 'City name required'})
            city = data['city']
            lat, lon = None, None
        
        # Get weather data
        weather_data = get_weather_data(lat=lat, lon=lon, city=city if request.method == 'POST' else None)
        
        # Generate advisory
        advisory = advisory_from_weather(weather_data)
        
        return jsonify({
            'ok': True,
            'marathi': advisory['marathi'],
            'english': advisory['english'],
            'current': weather_data.get('current', {}),
            'forecast': weather_data.get('forecast', [])
        })
        
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500

# Serve uploaded files
@app.route('/media/<filename>')
def uploaded_file(filename):
    """Serve uploaded media files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

