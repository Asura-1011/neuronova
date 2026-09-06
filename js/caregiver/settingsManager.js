/**
 * SettingsManager Component (Caregiver side)
 * Baseline target adjustment, Multilingual voice setup, profile configuration
 */

const SettingsManager = {
  render(container) {
    const patient = AdaptiveEngine.getPatient();
    const caregiver = AdaptiveEngine.getCaregiver();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
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
              <label>Cognitive Baseline Accuracy Target (%)</label>
              <input type="number" id="set-baseline" value="${caregiver.baselineAccuracy}" min="40" max="95" class="form-input" required />
            </div>

            <button type="submit" class="btn btn-primary" style="align-self:flex-start;">Save Profile Settings</button>
          </form>
        </div>

        <div style="background:var(--bg-card); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h3 style="margin-bottom:16px;">Multilingual Text-to-Speech Settings 🌐</h3>
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-group">
              <label>Select Assistant Language</label>
              <select id="set-language" class="form-input" onchange="SettingsManager.handleLanguageChange(this.value)">
                <option value="en-US" ${VoiceAssistant.currentLanguage === 'en-US' ? 'selected' : ''}>English (US)</option>
                <option value="hi-IN" ${VoiceAssistant.currentLanguage === 'hi-IN' ? 'selected' : ''}>Hindi (हिन्दी)</option>
                <option value="ta-IN" ${VoiceAssistant.currentLanguage === 'ta-IN' ? 'selected' : ''}>Tamil (தமிழ்)</option>
                <option value="es-ES" ${VoiceAssistant.currentLanguage === 'es-ES' ? 'selected' : ''}>Spanish (Español)</option>
                <option value="fr-FR" ${VoiceAssistant.currentLanguage === 'fr-FR' ? 'selected' : ''}>French (Français)</option>
              </select>
            </div>
            <button class="btn btn-secondary" onclick="VoiceAssistant.speak('Hello! Voice guidance language set successfully.')">Test Voice Audio 🔊</button>
          </div>
        </div>
      </div>
    `;
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

    alert('Settings updated successfully!');
  },

  handleLanguageChange(lang) {
    VoiceAssistant.currentLanguage = lang;
    AdaptiveEngine.state.caregiver.language = lang;
    AdaptiveEngine.saveState();
    VoiceAssistant.speak('Language updated.');
  }
};
