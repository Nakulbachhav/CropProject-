/**
 * AgriSathi Disease Detection JavaScript
 * Handles image upload, preview, and plant identification
 */

class DiseaseDetection {
    constructor() {
        this.selectedFile = null;
        this.initializeElements();
        this.attachEventListeners();
        this.setupDragAndDrop();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('upload-zone');
        this.imageInput = document.getElementById('image-input');
        this.uploadBtn = document.getElementById('upload-btn');
        this.imagePreview = document.getElementById('image-preview');
        this.previewImg = document.getElementById('preview-img');
        this.removeImage = document.getElementById('remove-image');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.loadingState = document.getElementById('loading-state');
        this.results = document.getElementById('results');
        this.plantName = document.getElementById('plant-name');
        this.confidence = document.getElementById('confidence');
        this.confidenceBar = document.getElementById('confidence-bar');
        this.marathiAnalysis = document.getElementById('marathi-analysis');
        this.englishAnalysis = document.getElementById('english-analysis');
        this.newAnalysisBtn = document.getElementById('new-analysis-btn');
        this.chatAboutBtn = document.getElementById('chat-about-btn');
        this.errorState = document.getElementById('error-state');
        this.errorMessage = document.getElementById('error-message');
        this.retryBtn = document.getElementById('retry-btn');
    }

    attachEventListeners() {
        // File input events
        this.uploadBtn.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Image preview events
        this.removeImage.addEventListener('click', () => this.removeSelectedImage());
        this.analyzeBtn.addEventListener('click', () => this.analyzeImage());
        
        // Results actions
        this.newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());
        this.chatAboutBtn.addEventListener('click', () => this.chatAboutPlant());
        this.retryBtn.addEventListener('click', () => this.resetAnalysis());
    }

    setupDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => this.highlight(), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => this.unhighlight(), false);
        });

        // Handle dropped files
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        this.uploadZone.classList.add('border-leaf', 'bg-green-50');
    }

    unhighlight() {
        this.uploadZone.classList.remove('border-leaf', 'bg-green-50');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('Image file is too large. Please select an image smaller than 10MB.');
            return;
        }

        this.selectedFile = file;
        this.previewImage(file);
    }

    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImg.src = e.target.result;
            this.uploadZone.classList.add('hidden');
            this.imagePreview.classList.remove('hidden');
            
            // Animate preview appearance
            gsap.fromTo(this.imagePreview, 
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
            );
        };
        reader.readAsDataURL(file);
    }

    removeSelectedImage() {
        this.selectedFile = null;
        this.imageInput.value = '';
        this.imagePreview.classList.add('hidden');
        this.uploadZone.classList.remove('hidden');
        this.hideAllStates();
    }

    async analyzeImage() {
        if (!this.selectedFile) {
            this.showError('Please select an image first.');
            return;
        }

        this.hideAllStates();
        this.showLoading(this.loadingState);

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);

            const response = await fetch('/api/disease', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.ok) {
                this.displayResults(data);
            } else {
                this.showError(data.error || 'Failed to analyze image');
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading(this.loadingState);
        }
    }

    displayResults(data) {
        // Update plant information
        this.plantName.textContent = data.plant_name || 'Unknown Plant';
        this.confidence.textContent = `${data.confidence?.toFixed(1) || 0}%`;
        
        // Animate confidence bar
        const confidencePercent = data.confidence || 0;
        gsap.to(this.confidenceBar, {
            width: `${confidencePercent}%`,
            duration: 1,
            ease: "power2.out"
        });

        // Update analysis text
        this.marathiAnalysis.textContent = data.marathi;
        this.englishAnalysis.textContent = data.english;

        this.hideAllStates();
        this.results.classList.remove('hidden');
        
        // Animate results appearance
        gsap.fromTo(this.results, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }

    chatAboutPlant() {
        const plantName = this.plantName.textContent;
        const question = `माझ्या ${plantName} पिकावर काय काळजी घ्यावी?`;
        window.location.href = `/chat?text=${encodeURIComponent(question)}`;
    }

    resetAnalysis() {
        this.hideAllStates();
        this.removeSelectedImage();
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

// Initialize disease detection when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the disease page
    if (document.getElementById('upload-zone')) {
        new DiseaseDetection();
    }
});


