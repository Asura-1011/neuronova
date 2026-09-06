/**
 * NeuroNova VoiceService (Parts 12, 13, 14, 15, 16)
 * Provider Pattern Architecture for Text-to-Speech
 * Supports BrowserVoiceProvider (fallback) & GrokVoiceProvider (Backend API route ready)
 * NO API keys in client code!
 */

// Provider 1: Browser Native Web Speech API
const BrowserVoiceProvider = {
  name: 'browser',

  speak(text, settings) {
    if (!('speechSynthesis' in window)) return false;

    window.speechSynthesis.cancel();
    if (!text || !text.trim()) return true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate || 0.85; // Slower default pace for elderly users
    utterance.pitch = settings.pitch || 1.0;
    utterance.volume = settings.volume || 1.0;
    utterance.lang = settings.language || 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes(settings.language.split('-')[0]) && v.name.includes('Natural')) ||
                           voices.find(v => v.lang.includes(settings.language.split('-')[0]));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  },

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};

// Provider 2: Grok / xAI Voice API Prepared Provider
// Communicates ONLY with secure backend route (/api/voice/speech), keeping secrets safe!
const GrokVoiceProvider = {
  name: 'grok',
  backendApiEndpoint: '/api/voice/speech', // Secure backend API endpoint

  async speak(text, settings) {
    try {
      const response = await fetch(this.backendApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.voice || 'warm-calm',
          language: settings.language || 'en-US',
          rate: settings.rate || 0.85
        })
      });

      if (!response.ok) {
        throw new Error('Grok Voice Backend API unreachable');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      return true;
    } catch (err) {
      console.warn('GrokVoiceProvider unavailable, falling back to BrowserVoiceProvider:', err);
      // Fallback seamlessly to Browser Voice
      return BrowserVoiceProvider.speak(text, settings);
    }
  },

  stop() {
    BrowserVoiceProvider.stop();
  }
};

const VoiceService = {
  isEnabled: true,
  activeProvider: 'browser', // 'browser' or 'grok'
  settings: {
    language: 'en-US',
    rate: 0.85, // Calm pacing for elderly
    pitch: 1.0,
    volume: 1.0
  },

  init() {
    const saved = localStorage.getItem('neuro_nova_voice_settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {}
    }
  },

  save() {
    localStorage.setItem('neuro_nova_voice_settings', JSON.stringify(this.settings));
  },

  setProvider(providerName) {
    if (providerName === 'grok') {
      this.activeProvider = 'grok';
    } else {
      this.activeProvider = 'browser';
    }
  },

  speak(text, context = 'general') {
    if (!this.isEnabled) return;

    // Apply supportive context prefixes if relevant
    let formattedText = text;
    if (context === 'welcome') {
      formattedText = `Welcome. ${text}`;
    } else if (context === 'game_start') {
      formattedText = `Take your time and do your best. ${text}`;
    } else if (context === 'success') {
      formattedText = `Excellent work! ${text}`;
    } else if (context === 'mistake') {
      formattedText = `That's okay. ${text}`;
    }

    if (this.activeProvider === 'grok') {
      GrokVoiceProvider.speak(formattedText, this.settings);
    } else {
      BrowserVoiceProvider.speak(formattedText, this.settings);
    }
  },

  stop() {
    BrowserVoiceProvider.stop();
  },

  toggleVoice() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.speak("Voice guidance enabled", "general");
    } else {
      this.stop();
    }
    return this.isEnabled;
  },

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
  }
};

VoiceService.init();
