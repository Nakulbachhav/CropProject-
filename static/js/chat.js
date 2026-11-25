/**
 * AgriSathi Chat JavaScript
 * Handles voice recording, text input, and chat functionality
 */

class VoiceChat {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingTimer = null;
        this.startTime = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkMicrophonePermission();
    }

    initializeElements() {
        this.recordBtn = document.getElementById('record-btn');
        this.micIcon = document.getElementById('mic-icon');
        this.statusText = document.getElementById('status-text');
        this.timer = document.getElementById('timer');
        this.waveform = document.getElementById('waveform');
        this.textInput = document.getElementById('text-input');
        this.sendTextBtn = document.getElementById('send-text-btn');
        this.responseArea = document.getElementById('response-area');
        this.marathiResponse = document.getElementById('marathi-response');
        this.englishResponse = document.getElementById('english-response');
        this.playAudioBtn = document.getElementById('play-audio-btn');
        this.newQuestionBtn = document.getElementById('new-question-btn');
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.errorMessage = document.getElementById('error-message');
        this.retryBtn = document.getElementById('retry-btn');
    }

    attachEventListeners() {
        // Voice recording events
        this.recordBtn.addEventListener('mousedown', () => this.startRecording());
        this.recordBtn.addEventListener('mouseup', () => this.stopRecording());
        this.recordBtn.addEventListener('mouseleave', () => this.stopRecording());
        
        // Touch events for mobile
        this.recordBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startRecording();
        });
        this.recordBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopRecording();
        });

        // Text input events
        this.sendTextBtn.addEventListener('click', () => this.sendTextMessage());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendTextMessage();
            }
        });

        // Response actions
        this.playAudioBtn.addEventListener('click', () => this.playAudio());
        this.newQuestionBtn.addEventListener('click', () => this.resetChat());
        this.retryBtn.addEventListener('click', () => this.resetChat());

        // Sample questions
        document.querySelectorAll('.sample-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const marathiText = btn.querySelector('p:first-child').textContent;
                this.textInput.value = marathiText;
                this.sendTextMessage();
            });
        });
    }

    async checkMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            this.statusText.textContent = 'Click and hold to record your question';
        } catch (error) {
            console.warn('Microphone access denied:', error);
            this.statusText.textContent = 'Microphone access required for voice input';
            this.recordBtn.disabled = true;
        }
    }

    async startRecording() {
        if (this.isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.audioChunks = [];
            this.isRecording = true;
            this.startTime = Date.now();

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processRecording();
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.updateRecordingUI();
            this.startTimer();

        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Failed to access microphone. Please check permissions.');
        }
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;

        this.isRecording = false;
        this.mediaRecorder.stop();
        this.stopTimer();
        this.updateRecordingUI(false);
    }

    updateRecordingUI(recording = true) {
        if (recording) {
            this.recordBtn.classList.add('recording');
            this.statusText.textContent = 'Recording... Release to stop';
            this.waveform.classList.remove('hidden');
            this.timer.classList.remove('hidden');
        } else {
            this.recordBtn.classList.remove('recording');
            this.statusText.textContent = 'Processing...';
            this.waveform.classList.add('hidden');
        }
    }

    startTimer() {
        this.recordingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 100);
    }

    stopTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    async processRecording() {
        if (this.audioChunks.length === 0) {
            this.showError('No audio recorded. Please try again.');
            return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.sendAudioToAPI(audioBlob);
    }

    async sendTextMessage() {
        const text = this.textInput.value.trim();
        if (!text) return;

        this.hideAllStates();
        this.showLoading(this.loadingState);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();
            
            if (data.ok) {
                this.displayResponse(data);
            } else {
                this.showError(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error sending text message:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading(this.loadingState);
        }
    }

    async sendAudioToAPI(audioBlob) {
        this.hideAllStates();
        this.showLoading(this.loadingState);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch('/api/chat', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.ok) {
                this.displayResponse(data);
            } else {
                this.showError(data.error || 'Failed to process audio');
            }
        } catch (error) {
            console.error('Error sending audio:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading(this.loadingState);
        }
    }

    displayResponse(data) {
        this.marathiResponse.textContent = data.marathi;
        this.englishResponse.textContent = data.english;
        
        // Store audio URL for playback
        this.currentAudioUrl = data.audio_url;
        
        this.hideAllStates();
        this.responseArea.classList.remove('hidden');
        
        // Animate response appearance
        gsap.fromTo(this.responseArea, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }

    async playAudio() {
        if (!this.currentAudioUrl) return;

        try {
            const audio = new Audio(this.currentAudioUrl);
            audio.play();
            
            // Update button state
            this.playAudioBtn.innerHTML = `
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                </svg>
                <span>Playing...</span>
            `;
            
            audio.onended = () => {
                this.playAudioBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                    </svg>
                    <span>Play Answer</span>
                `;
            };
        } catch (error) {
            console.error('Error playing audio:', error);
            this.showError('Failed to play audio');
        }
    }

    resetChat() {
        this.hideAllStates();
        this.textInput.value = '';
        this.currentAudioUrl = null;
        this.statusText.textContent = 'Click and hold to record your question';
        this.timer.classList.add('hidden');
        this.timer.textContent = '00:00';
    }

    showError(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.classList.remove('hidden');
    }

    hideAllStates() {
        this.responseArea.classList.add('hidden');
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

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the chat page
    if (document.getElementById('record-btn')) {
        new VoiceChat();
    }
    
    // Handle URL parameters for pre-filled text
    const urlParams = new URLSearchParams(window.location.search);
    const preText = urlParams.get('text');
    if (preText) {
        const textInput = document.getElementById('text-input');
        if (textInput) {
            textInput.value = decodeURIComponent(preText);
        }
    }
});


