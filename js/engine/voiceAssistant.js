/**
 * NeuroNova Voice Assistant Module (Text-To-Speech)
 * Provides accessible audio readouts for elderly patients
 */

const VoiceAssistant = {
  isEnabled: true,
  currentLanguage: 'en-US',
  rate: 0.9, // Slightly slower speed for dementia patient accessibility

  init() {
    // Check if speechSynthesis is available in browser
    if ('speechSynthesis' in window) {
      console.log('VoiceAssistant: Web Speech API ready.');
    } else {
      console.warn('VoiceAssistant: Web Speech API not supported in this browser.');
    }
  },

  speak(text) {
    if (!this.isEnabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = 1.0;
    utterance.lang = this.currentLanguage;

    // Try to select a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes(this.currentLanguage.split('-')[0]) && v.name.includes('Natural'))
      || voices.find(v => v.lang.includes(this.currentLanguage.split('-')[0]));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  },

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  toggleVoice() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.speak("Voice guidance enabled");
    } else {
      this.stop();
    }
    return this.isEnabled;
  }
};

// Initialize voice assistant on script load
VoiceAssistant.init();
