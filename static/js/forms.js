/**
 * AgriSathi Forms JavaScript
 * Handles fertilizer and crop recommendation forms
 */

class FormHandler {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Fertilizer form elements
        this.fertilizerForm = document.getElementById('fertilizer-form');
        this.cropForm = document.getElementById('crop-form');
        
        // Common elements
        this.loadingState = document.getElementById('loading-state');
        this.results = document.getElementById('results');
        this.errorState = document.getElementById('error-state');
        this.errorMessage = document.getElementById('error-message');
        this.retryBtn = document.getElementById('retry-btn');
        this.newAnalysisBtn = document.getElementById('new-analysis-btn');
        this.chatAboutBtn = document.getElementById('chat-about-btn');
    }

    attachEventListeners() {
        // Fertilizer form
        if (this.fertilizerForm) {
            this.fertilizerForm.addEventListener('submit', (e) => this.handleFertilizerSubmit(e));
            this.setupFertilizerFormInteractions();
        }

        // Crop form
        if (this.cropForm) {
            this.cropForm.addEventListener('submit', (e) => this.handleCropSubmit(e));
            this.setupCropFormInteractions();
        }

        // Common event listeners
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => this.resetForm());
        }
        if (this.newAnalysisBtn) {
            this.newAnalysisBtn.addEventListener('click', () => this.resetForm());
        }
        if (this.chatAboutBtn) {
            this.chatAboutBtn.addEventListener('click', () => this.chatAboutResults());
        }
    }

    setupFertilizerFormInteractions() {
        // pH selection visual feedback
        document.querySelectorAll('input[name="pH"]').forEach(radio => {
            radio.addEventListener('change', function() {
                // Remove active class from all pH options
                document.querySelectorAll('input[name="pH"]').forEach(r => {
                    r.parentElement.classList.remove('border-leaf', 'bg-green-50');
                });
                
                // Add active class to selected option
                if (this.checked) {
                    this.parentElement.classList.add('border-leaf', 'bg-green-50');
                }
            });
        });
    }

    setupCropFormInteractions() {
        // Season selection visual feedback
        document.querySelectorAll('input[name="season"]').forEach(radio => {
            radio.addEventListener('change', function() {
                // Remove active class from all season options
                document.querySelectorAll('input[name="season"]').forEach(r => {
                    r.parentElement.classList.remove('border-leaf', 'bg-green-50');
                });
                
                // Add active class to selected option
                if (this.checked) {
                    this.parentElement.classList.add('border-leaf', 'bg-green-50');
                }
            });
        });
    }

    async handleFertilizerSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.fertilizerForm);
        const data = {
            pH: parseFloat(formData.get('pH')),
            N: parseInt(formData.get('N')),
            P: parseInt(formData.get('P')),
            K: parseInt(formData.get('K')),
            crop: formData.get('crop') || ''
        };

        // Validate required fields
        if (!data.pH || !data.N || !data.P || !data.K) {
            this.showError('Please fill in all required fields.');
            return;
        }

        await this.submitFertilizerRequest(data);
    }

    async handleCropSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.cropForm);
        const data = {
            soil: {
                pH: parseFloat(formData.get('pH')),
                N: parseInt(formData.get('N')),
                P: parseInt(formData.get('P')),
                K: parseInt(formData.get('K'))
            },
            season: formData.get('season'),
            region: formData.get('region') || ''
        };

        // Validate required fields
        if (!data.soil.pH || !data.soil.N || !data.soil.P || !data.soil.K || !data.season) {
            this.showError('Please fill in all required fields.');
            return;
        }

        await this.submitCropRequest(data);
    }

    async submitFertilizerRequest(data) {
        this.hideAllStates();
        this.showLoading(this.loadingState);

        try {
            const response = await fetch('/api/fertilizer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.ok) {
                this.displayFertilizerResults(result);
            } else {
                this.showError(result.error || 'Failed to get fertilizer recommendation');
            }
        } catch (error) {
            console.error('Error submitting fertilizer request:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading(this.loadingState);
        }
    }

    async submitCropRequest(data) {
        this.hideAllStates();
        this.showLoading(this.loadingState);

        try {
            const response = await fetch('/api/crop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.ok) {
                this.displayCropResults(result);
            } else {
                this.showError(result.error || 'Failed to get crop recommendation');
            }
        } catch (error) {
            console.error('Error submitting crop request:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading(this.loadingState);
        }
    }

    displayFertilizerResults(data) {
        // Update soil condition
        const soilConditionEl = document.getElementById('soil-condition');
        if (soilConditionEl) {
            soilConditionEl.innerHTML = `
                <div class="text-lg font-semibold text-ink">${data.soil_condition}</div>
            `;
        }

        // Update recommendations
        document.getElementById('marathi-recommendation').textContent = data.marathi;
        document.getElementById('english-recommendation').textContent = data.english;

        // Update recommendations list
        const recommendationsList = document.getElementById('recommendations-list');
        if (recommendationsList && data.recommendations) {
            recommendationsList.innerHTML = data.recommendations.map((rec, index) => `
                <li class="flex items-start space-x-2">
                    <span class="flex-shrink-0 w-6 h-6 bg-leaf text-white rounded-full flex items-center justify-center text-sm font-semibold">${index + 1}</span>
                    <span class="text-gray-700">${rec}</span>
                </li>
            `).join('');
        }

        this.hideAllStates();
        this.results.classList.remove('hidden');
        this.animateResults();
    }

    displayCropResults(data) {
        // Update season info
        const seasonInfoEl = document.getElementById('season-info');
        if (seasonInfoEl) {
            seasonInfoEl.innerHTML = `
                <div class="text-lg font-semibold text-ink">Season: ${data.season || 'Not specified'}</div>
            `;
        }

        // Update recommendations
        document.getElementById('marathi-recommendation').textContent = data.marathi;
        document.getElementById('english-recommendation').textContent = data.english;

        // Update crops list
        const cropsList = document.getElementById('crops-list');
        if (cropsList && data.crops) {
            cropsList.innerHTML = data.crops.map((crop, index) => `
                <div class="bg-white rounded-xl p-4 border border-gray-200">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-leaf to-green-600 rounded-full flex items-center justify-center text-white font-semibold">${index + 1}</div>
                        <div class="font-semibold text-ink">${crop}</div>
                    </div>
                </div>
            `).join('');
        }

        this.hideAllStates();
        this.results.classList.remove('hidden');
        this.animateResults();
    }

    animateResults() {
        gsap.fromTo(this.results, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }

    chatAboutResults() {
        // Get current form data to create a contextual question
        let question = '';
        
        if (this.fertilizerForm) {
            const formData = new FormData(this.fertilizerForm);
            const pH = formData.get('pH');
            const crop = formData.get('crop');
            question = `माझ्या मातीचा pH ${pH} आहे आणि ${crop || 'पिक'} लावायचे आहे. काय खत वापरावे?`;
        } else if (this.cropForm) {
            const formData = new FormData(this.cropForm);
            const season = formData.get('season');
            const region = formData.get('region');
            question = `${season} हंगामात ${region ? region + ' मध्ये' : ''} कोणती पिके लावावीत?`;
        }
        
        if (question) {
            window.location.href = `/chat?text=${encodeURIComponent(question)}`;
        } else {
            window.location.href = '/chat';
        }
    }

    resetForm() {
        this.hideAllStates();
        
        // Reset form
        if (this.fertilizerForm) {
            this.fertilizerForm.reset();
            // Remove active classes from pH options
            document.querySelectorAll('input[name="pH"]').forEach(radio => {
                radio.parentElement.classList.remove('border-leaf', 'bg-green-50');
            });
        }
        
        if (this.cropForm) {
            this.cropForm.reset();
            // Remove active classes from season options
            document.querySelectorAll('input[name="season"]').forEach(radio => {
                radio.parentElement.classList.remove('border-leaf', 'bg-green-50');
            });
        }
    }

    showError(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.classList.remove('hidden');
    }

    hideAllStates() {
        this.results.classList.add('hidden');
        this.loadingState.classList.add('hidden');
        this.errorState.classList.add('hidden');
    }

    showLoading(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hideLoading(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }
}

// Weather-specific functionality
class WeatherHandler {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.currentLocationBtn = document.getElementById('current-location-btn');
        this.cityInput = document.getElementById('city-input');
        this.citySubmitBtn = document.getElementById('city-submit-btn');
        this.loadingState = document.getElementById('loading-state');
        this.weatherResults = document.getElementById('weather-results');
        this.errorState = document.getElementById('error-state');
        this.errorMessage = document.getElementById('error-message');
        this.retryBtn = document.getElementById('retry-btn');
    }

    attachEventListeners() {
        if (this.currentLocationBtn) {
            this.currentLocationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        }
        
        if (this.citySubmitBtn) {
            this.citySubmitBtn.addEventListener('click', () => this.getCityWeather());
        }
        
        if (this.cityInput) {
            this.cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.getCityWeather();
                }
            });
        }
        
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => this.resetWeather());
        }
    }

    async getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser.');
            return;
        }

        this.hideAllStates();
        this.showLoading(this.loadingState);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.fetchWeatherData(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                this.showError('Unable to get your location. Please try entering your city manually.');
            }
        );
    }

    async getCityWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Please enter a city name.');
            return;
        }

        this.hideAllStates();
        this.showLoading(this.loadingState);

        try {
            const response = await fetch('/api/weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ city: city })
            });

            const data = await response.json();
            
            if (data.ok) {
                this.displayWeatherResults(data);
            } else {
                this.showError(data.error || 'Failed to get weather data');
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading(this.loadingState);
        }
    }

    async fetchWeatherData(lat, lon) {
        try {
            const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            
            if (data.ok) {
                this.displayWeatherResults(data);
            } else {
                this.showError(data.error || 'Failed to get weather data');
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading(this.loadingState);
        }
    }

    displayWeatherResults(data) {
        // Update current weather
        if (data.current) {
            document.getElementById('current-temp').textContent = `${Math.round(data.current.temp)}°C`;
            document.getElementById('current-humidity').textContent = `${data.current.humidity}%`;
            document.getElementById('current-wind').textContent = `${data.current.wind_speed} km/h`;
            document.getElementById('current-condition').textContent = data.current.description;
        }

        // Update advisory
        document.getElementById('marathi-advisory').textContent = data.marathi;
        document.getElementById('english-advisory').textContent = data.english;

        // Update forecast
        this.updateForecast(data.forecast);

        this.hideAllStates();
        this.weatherResults.classList.remove('hidden');
        this.animateWeatherResults();
    }

    updateForecast(forecast) {
        const container = document.getElementById('forecast-container');
        if (!container || !forecast) return;

        container.innerHTML = forecast.slice(0, 5).map(day => `
            <div class="bg-white rounded-xl p-4 text-center">
                <div class="text-sm text-gray-600 mb-2">${new Date(day.dt * 1000).toLocaleDateString()}</div>
                <div class="text-2xl mb-2">${this.getWeatherIcon(day.weather[0].main)}</div>
                <div class="font-semibold text-ink">${Math.round(day.main.temp)}°C</div>
                <div class="text-sm text-gray-600">${day.weather[0].description}</div>
            </div>
        `).join('');
    }

    getWeatherIcon(condition) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Drizzle': '🌦️',
            'Mist': '🌫️',
            'Fog': '🌫️'
        };
        return icons[condition] || '🌤️';
    }

    animateWeatherResults() {
        gsap.fromTo(this.weatherResults, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }

    resetWeather() {
        this.hideAllStates();
        this.cityInput.value = '';
    }

    showError(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.classList.remove('hidden');
    }

    hideAllStates() {
        this.weatherResults.classList.add('hidden');
        this.loadingState.classList.add('hidden');
        this.errorState.classList.add('hidden');
    }

    showLoading(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    }

    hideLoading(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }
}

// Initialize handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form handler for fertilizer and crop pages
    if (document.getElementById('fertilizer-form') || document.getElementById('crop-form')) {
        new FormHandler();
    }
    
    // Initialize weather handler for weather page
    if (document.getElementById('current-location-btn')) {
        new WeatherHandler();
    }
});


