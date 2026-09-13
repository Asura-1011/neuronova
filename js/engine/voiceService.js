/**
 * NeuroNova VoiceService
 * Provider Pattern Architecture for Text-to-Speech
 * Supports ElevenLabsVoiceProvider (Vercel Serverless API), GrokVoiceProvider & BrowserVoiceProvider
 * NO API keys in client code!
 */

// Provider 1: Browser Native Web Speech API (Fallback)
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
const GrokVoiceProvider = {
  name: 'grok',
  backendApiEndpoint: '/api/voice/speech',

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
      return BrowserVoiceProvider.speak(text, settings);
    }
  },

  stop() {
    BrowserVoiceProvider.stop();
  }
};

// Provider 3: ElevenLabs High Quality Multilingual Text-to-Speech
// Calls secure serverless API endpoint (/api/tts) which accesses ELEVENLABS_API_KEY.
// Enforces Credit Saving Rules (In-memory Blob Cache & Audio Stop Guard).
const ElevenLabsVoiceProvider = {
  name: 'elevenlabs',
  backendApiEndpoint: '/api/tts',
  currentAudio: null,
  audioCache: new Map(), // In-memory audio cache: key = language:text -> blobUrl

  async speak(text, settings) {
    if (!text || !text.trim()) return true;

    const trimmedText = text.trim();
    const lang = settings.language || 'en-US';
    const cacheKey = `${lang}:${trimmedText}`;

    // CREDIT SAVING RULE 1: Stop any currently playing audio before starting new audio
    this.stop();

    // CREDIT SAVING RULE 2: Check in-memory audio blob cache to avoid duplicate API calls
    if (this.audioCache.has(cacheKey)) {
      console.log('[ElevenLabsVoiceProvider] Using cached speech audio for key:', cacheKey);
      const cachedUrl = this.audioCache.get(cacheKey);
      this.playAudioUrl(cachedUrl);
      return true;
    }

    try {
      console.log('[ElevenLabsVoiceProvider] Requesting TTS audio from secure backend endpoint /api/tts...');
      const response = await fetch(this.backendApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmedText,
          language: lang
        })
      });

      if (!response.ok) {
        throw new Error(`Server API endpoint returned status ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache audio blob URL for future credit-saving reuse during current session
      this.audioCache.set(cacheKey, audioUrl);

      this.playAudioUrl(audioUrl);
      return true;
    } catch (err) {
      console.warn('[ElevenLabsVoiceProvider] API request failed, falling back to BrowserVoiceProvider:', err);
      // Seamless credit-saving fallback to browser native Web Speech API
      return BrowserVoiceProvider.speak(text, settings);
    }
  },

  playAudioUrl(url) {
    this.stop();
    this.currentAudio = new Audio(url);
    this.currentAudio.play().catch(e => {
      console.warn('[ElevenLabsVoiceProvider] Audio playback failed:', e);
    });
  },

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    BrowserVoiceProvider.stop();
  }
};

const VoiceService = {
  isEnabled: true,
  activeProvider: 'elevenlabs', // 'elevenlabs', 'browser', or 'grok'
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
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
        if (parsed.activeProvider) {
          this.activeProvider = parsed.activeProvider;
        }
      } catch (e) {}
    }
  },

  save() {
    const dataToSave = {
      ...this.settings,
      activeProvider: this.activeProvider
    };
    localStorage.setItem('neuro_nova_voice_settings', JSON.stringify(dataToSave));
  },

  setProvider(providerName) {
    if (providerName === 'elevenlabs') {
      this.activeProvider = 'elevenlabs';
    } else if (providerName === 'grok') {
      this.activeProvider = 'grok';
    } else {
      this.activeProvider = 'browser';
    }
    this.save();
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

    if (this.activeProvider === 'elevenlabs') {
      ElevenLabsVoiceProvider.speak(formattedText, this.settings);
    } else if (this.activeProvider === 'grok') {
      GrokVoiceProvider.speak(formattedText, this.settings);
    } else {
      BrowserVoiceProvider.speak(formattedText, this.settings);
    }
  },

  stop() {
    ElevenLabsVoiceProvider.stop();
    GrokVoiceProvider.stop();
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
