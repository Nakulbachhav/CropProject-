# AgriSathi - AI Assistant for Farmers 🌱

A production-ready Flask web application that provides AI-powered agricultural assistance in Marathi and English. Built with a GenZ, plant-themed design and smooth animations.

## Features

- **Voice Chatbot**: Ask farming questions in Marathi/English with voice responses
- **Disease Detection**: Upload plant images for disease identification and treatment advice
- **Fertilizer Recommendation**: Get personalized fertilizer advice based on soil analysis
- **Crop Recommendation**: Discover the best crops for your soil and season
- **Weather Advisory**: Get farming-specific weather alerts and seasonal advice

## Tech Stack

- **Backend**: Python 3.11 + Flask 3
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Animations**: GSAP + ScrollTrigger, Lenis smooth scrolling
- **APIs**: OpenAI (Whisper + GPT-4o-mini), Plant.id, OpenWeather, gTTS
- **Design**: GenZ plant-themed UI with glassmorphism effects

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd "crop project"

# Copy environment file
copy env.example .env
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure API Keys

Edit `.env` file and add your API keys:

```env
# OpenAI API Key (required for chat and speech)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Plant.id API Key (required for plant identification)
PLANT_ID_API_KEY=your-plant-id-api-key-here

# OpenWeather API Key (required for weather data)
OPENWEATHER_API_KEY=your-openweather-api-key-here
```

### 4. Run the Application

```bash
flask --app app run --debug
```

### 5. Access the Application

- **Local**: http://localhost:5000
- **Mobile**: http://[your-laptop-ip]:5000 (same Wi-Fi network)

## API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add to `.env` file

### Plant.id API Key
1. Visit [Plant.id](https://plant.id/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env` file

### OpenWeather API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key
4. Add to `.env` file

## Project Structure

```
agrisathi/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── README.md             # This file
├── services/             # Backend services
│   ├── __init__.py
│   ├── openai_speech.py  # Whisper STT service
│   ├── openai_chat.py    # GPT-4o-mini chat service
│   ├── tts.py            # Marathi TTS service
│   ├── plant_id.py       # Plant identification service
│   ├── weather.py        # Weather API service
│   ├── fertilizer.py     # Fertilizer recommendation logic
│   ├── crop_reco.py      # Crop recommendation logic
│   └── utils.py          # Common utilities
├── static/               # Static assets
│   ├── css/
│   │   └── style.css     # Custom CSS
│   ├── js/
│   │   ├── main.js       # Main JavaScript
│   │   ├── chat.js       # Voice chat functionality
│   │   ├── disease.js    # Disease detection
│   │   └── forms.js       # Form handling
│   ├── assets/
│   │   ├── logo.svg      # App logo
│   │   └── hero-plant.json # Lottie animation
│   └── media/             # Generated audio files
└── templates/            # HTML templates
    ├── base.html         # Base template
    ├── index.html        # Landing page
    ├── chat.html         # Voice chatbot
    ├── disease.html       # Disease detection
    ├── fertilizer.html   # Fertilizer recommendation
    ├── crop.html         # Crop recommendation
    └── weather.html      # Weather advisory
```

## Features Overview

### 🎤 Voice Chatbot
- Press and hold to record questions in Marathi or English
- Get AI-powered farming advice with voice responses
- Fallback to text input if microphone is not available

### 🔍 Disease Detection
- Upload plant images for instant disease identification
- Get treatment recommendations in Marathi and English
- Confidence scores and detailed analysis

### 🌱 Fertilizer Recommendation
- Input soil pH and NPK levels
- Get personalized fertilizer advice
- Crop-specific recommendations

### 🌾 Crop Recommendation
- Select soil conditions and growing season
- Get 2-3 recommended crops with rationale
- Season-specific advice (Kharif/Rabi/Zaid)

### 🌤️ Weather Advisory
- Get current weather and 5-day forecast
- Farming-specific weather alerts
- Location-based recommendations

## Development

### Running in Development Mode

```bash
# Enable debug mode
set FLASK_DEBUG=1
flask --app app run
```

### Mobile Testing

1. Find your laptop's IP address
2. Run Flask with host binding:
   ```bash
   flask --app app run --host=0.0.0.0
   ```
3. Access from mobile: `http://[your-ip]:5000`

### API Endpoints

- `GET /` - Landing page
- `GET /chat` - Voice chatbot
- `GET /disease` - Disease detection
- `GET /fertilizer` - Fertilizer recommendation
- `GET /crop` - Crop recommendation
- `GET /weather` - Weather advisory

- `POST /api/chat` - Chat API (audio/text)
- `POST /api/disease` - Plant identification
- `POST /api/fertilizer` - Fertilizer recommendation
- `POST /api/crop` - Crop recommendation
- `GET/POST /api/weather` - Weather data

## Troubleshooting

### Common Issues

1. **Microphone not working**: Check browser permissions
2. **API errors**: Verify API keys in `.env` file
3. **Audio playback issues**: Check browser audio settings
4. **Mobile access**: Ensure same Wi-Fi network

### Error Messages

- "API key not configured" → Add missing API keys to `.env`
- "Microphone access denied" → Allow microphone in browser
- "Network error" → Check internet connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes only. Please ensure you have proper API keys and follow the terms of service for all external APIs.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Verify all API keys are correctly configured
3. Ensure all dependencies are installed
4. Check browser console for JavaScript errors

---

**AgriSathi** - तुमचा मराठी शेतकरी सहायक 🌱


