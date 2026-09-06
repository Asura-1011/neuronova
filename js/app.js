/**
 * NeuroNova Main Application Router & Entry Point
 */

const App = {
  init() {
    console.log('NeuroNova Initialized.');
    this.renderLanding();
  },

  renderLanding() {
    const container = document.getElementById('app');
    const patient = AdaptiveEngine.getPatient();
    const caregiver = AdaptiveEngine.getCaregiver();

    container.className = 'app-container';
    container.innerHTML = `
      <div class="portal-selector-card">
        <div class="brand-header">
          <span class="brand-icon">🧠</span>
          <span>NeuroNova</span>
        </div>
        <p class="portal-tagline">
          Empowering dementia memory care through daily cognitive games, adaptive leveling, and family support.
        </p>

        <!-- Initial Setup Form -->
        <div class="setup-form">
          <div class="form-group">
            <label for="input-patient-name">Patient Name</label>
            <input type="text" id="input-patient-name" class="form-input" value="${patient.name}" placeholder="e.g. Ravi" onchange="AdaptiveEngine.setPatientName(this.value)" />
          </div>
          <div class="form-group">
            <label for="input-caregiver-name">Caregiver Name</label>
            <input type="text" id="input-caregiver-name" class="form-input" value="${caregiver.name}" placeholder="e.g. Sarah" onchange="AdaptiveEngine.setCaregiverName(this.value)" />
          </div>
        </div>

        <!-- Elderly Patient Portal Launch Button (Top Large Colorful Button) -->
        <button class="btn btn-huge patient-launch-btn" onclick="App.launchPatientPortal()">
          <span class="icon-badge">🎮</span>
          <span class="btn-text-main">Elderly Patient Portal</span>
          <span class="btn-sub">Play Games & View Memories</span>
        </button>

        <!-- Caregiver Dashboard Button (Below Patient Button) -->
        <button class="btn caregiver-launch-btn" onclick="App.launchCaregiverPortal()">
          <span>📊</span>
          <span>Caregiver Dashboard & Progress Analytics</span>
        </button>
      </div>
    `;
  },

  launchPatientPortal() {
    // Read names from inputs if changed
    const pInput = document.getElementById('input-patient-name');
    if (pInput && pInput.value) AdaptiveEngine.setPatientName(pInput.value);

    PatientDashboard.render(document.getElementById('app'));
  },

  launchCaregiverPortal() {
    const cInput = document.getElementById('input-caregiver-name');
    if (cInput && cInput.value) AdaptiveEngine.setCaregiverName(cInput.value);

    CaregiverDashboard.render(document.getElementById('app'));
  }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
