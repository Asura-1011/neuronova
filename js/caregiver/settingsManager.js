/**
 * SettingsManager Component (Caregiver side)
 * Security PIN settings, Demo Mode toggle, Baseline Target, and Grok Voice API configuration.
 */

const SettingsManager = {
  render(container) {
    const patient = AdaptiveEngine.getPatient();
    const caregiver = AdaptiveEngine.getCaregiver();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <!-- Demo Mode Section (Part 7) -->
        <div style="background:linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(139, 92, 246, 0.15)); padding:20px; border-radius:var(--radius-md); border:2px dashed var(--accent-amber);">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:16px;">
            <div>
              <h3 style="color:var(--accent-amber); display:flex; align-items:center; gap:8px;">⚡ Demo Mode Simulation</h3>
              <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:4px;">
                Enable Demo Mode to test the 3-Day Baseline Assessment flow (Day 1 → Day 2 → Day 3 → Level Up) instantly without waiting 3 calendar days.
              </p>
            </div>
            <button class="btn ${BaselineService.isDemoMode ? 'btn-primary' : 'btn-secondary'}" onclick="SettingsManager.toggleDemoMode()">
              ${BaselineService.isDemoMode ? '⚡ DEMO MODE ACTIVE' : 'Enable Demo Mode'}
            </button>
          </div>
        </div>

        <!-- Caregiver PIN & Security (Part 4) -->
        <div style="background:var(--bg-card); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h3 style="margin-bottom:14px;">Caregiver Security & PIN Settings 🔒</h3>
          <form onsubmit="SettingsManager.handleUpdatePin(event)" style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label>Current PIN</label>
                <input type="password" id="set-old-pin" placeholder="Default: 1234" class="form-input" required />
              </div>
              <div class="form-group">
                <label>New PIN (min 4 digits)</label>
                <input type="password" id="set-new-pin" placeholder="Enter new PIN" class="form-input" required />
              </div>
            </div>
            <button type="submit" class="btn btn-secondary" style="align-self:flex-start;">Update Security PIN</button>
          </form>
        </div>

        <!-- Patient & Caregiver Profile -->
        <div style="background:var(--bg-card); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h3 style="margin-bottom:16px;">Patient & Caregiver Profile 👤</h3>
          <form onsubmit="SettingsManager.handleSaveProfile(event)" style="display:flex; flex-direction:column; gap:14px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label>Patient Name</label>
                <input type="text" id="set-patient-name" value="${patient.name}" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Caregiver Name</label>
                <input type="text" id="set-caregiver-name" value="${caregiver.name}" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label>Cognitive Target Accuracy (%)</label>
              <input type="number" id="set-baseline" value="${caregiver.baselineAccuracy}" min="40" max="95" class="form-input" required />
            </div>

            <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Save Profile Settings</button>
          </form>
        </div>

        <!-- Voice Assistant & Grok API Preparation (Parts 12-16) -->
        <div style="background:var(--bg-card); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h3 style="margin-bottom:16px;">Voice Assistant & Grok Provider Settings 🌐</h3>
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-group">
              <label>Select Voice Provider Architecture</label>
              <select id="set-voice-provider" class="form-input" onchange="SettingsManager.handleProviderChange(this.value)">
                <option value="browser" ${VoiceService.activeProvider === 'browser' ? 'selected' : ''}>Browser Native Web Speech (Fallback / Default)</option>
                <option value="grok" ${VoiceService.activeProvider === 'grok' ? 'selected' : ''}>Grok / xAI Voice API (Secure Backend / API Route Ready)</option>
              </select>
              <small style="color:var(--text-secondary); margin-top:4px;">
                Note: Grok Voice communicates only via secure backend routes (/api/voice/speech) keeping XAI_API_KEY environment variables safe!
              </small>
            </div>

            <div class="form-group">
              <label>Speech Pacing & Speed (Elderly Accessible)</label>
              <select class="form-input" onchange="VoiceService.updateSettings({ rate: parseFloat(this.value) })">
                <option value="0.75" ${VoiceService.settings.rate === 0.75 ? 'selected' : ''}>Slower (0.75x - Extra Gentle)</option>
                <option value="0.85" ${VoiceService.settings.rate === 0.85 ? 'selected' : ''}>Calm Default (0.85x - Recommended)</option>
                <option value="1.0" ${VoiceService.settings.rate === 1.0 ? 'selected' : ''}>Normal Speed (1.0x)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Select Assistant Language</label>
              <select id="set-language" class="form-input" onchange="SettingsManager.handleLanguageChange(this.value)">
                <option value="en-US" ${VoiceService.settings.language === 'en-US' ? 'selected' : ''}>English (US)</option>
                <option value="hi-IN" ${VoiceService.settings.language === 'hi-IN' ? 'selected' : ''}>Hindi (हिन्दी)</option>
                <option value="ta-IN" ${VoiceService.settings.language === 'ta-IN' ? 'selected' : ''}>Tamil (தமிழ்)</option>
                <option value="es-ES" ${VoiceService.settings.language === 'es-ES' ? 'selected' : ''}>Spanish (Español)</option>
                <option value="fr-FR" ${VoiceService.settings.language === 'fr-FR' ? 'selected' : ''}>French (Français)</option>
              </select>
            </div>
            <button class="btn btn-secondary" onclick="VoiceService.speak('Hello! Voice guidance settings configured successfully.', 'welcome')">Test Audio Voice 🔊</button>
          </div>
        </div>
      </div>
    `;
  },

  toggleDemoMode() {
    BaselineService.setDemoMode(!BaselineService.isDemoMode);
    alert(BaselineService.isDemoMode ? '⚡ Demo Mode Enabled! You can test baseline day transitions immediately.' : 'Demo Mode Disabled.');
    this.render(document.getElementById('caregiver-tab-content'));
  },

  handleUpdatePin(event) {
    event.preventDefault();
    const oldPin = document.getElementById('set-old-pin').value;
    const newPin = document.getElementById('set-new-pin').value;

    const res = CaregiverAuthService.updatePin(oldPin, newPin);
    alert(res.message);
    if (res.success) {
      document.getElementById('set-old-pin').value = '';
      document.getElementById('set-new-pin').value = '';
    }
  },

  handleSaveProfile(event) {
    event.preventDefault();
    const pName = document.getElementById('set-patient-name').value;
    const cName = document.getElementById('set-caregiver-name').value;
    const baseline = parseInt(document.getElementById('set-baseline').value, 10);

    AdaptiveEngine.setPatientName(pName);
    AdaptiveEngine.setCaregiverName(cName);
    AdaptiveEngine.state.caregiver.baselineAccuracy = baseline;
    AdaptiveEngine.saveState();

    alert('Profile settings saved!');
  },

  handleProviderChange(val) {
    VoiceService.setProvider(val);
    alert(val === 'grok' ? 'Grok Voice Provider selected. Calls will route via /api/voice/speech with automatic browser fallback.' : 'Browser Native Speech selected.');
  },

  handleLanguageChange(lang) {
    VoiceService.updateSettings({ language: lang });
    VoiceService.speak('Language updated.');
  }
};
