/**
 * NeuroNova VoiceAssistant Wrapper
 * Delegates directly to the modular VoiceService for speech synthesis and Grok voice readiness
 */

const VoiceAssistant = {
  get isEnabled() {
    return VoiceService.isEnabled;
  },
  set isEnabled(val) {
    VoiceService.isEnabled = val;
  },

  get currentLanguage() {
    return VoiceService.settings.language;
  },
  set currentLanguage(lang) {
    VoiceService.updateSettings({ language: lang });
  },

  speak(text, context = 'general') {
    VoiceService.speak(text, context);
  },

  stop() {
    VoiceService.stop();
  },

  toggleVoice() {
    return VoiceService.toggleVoice();
  }
};
