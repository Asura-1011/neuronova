/**
 * NeuroNova Main Router & Enforced Navigation System
 * Flow: Step 1 (Initial Welcome) -> Step 2 (Caregiver PIN) -> Step 3 (Patient Manager) -> Step 5 (Patient Mode)
 */

const App = {
  async init() {
    console.log('NeuroNova Initialized.');

    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('./sw.js');
        console.log('[PWA] Service Worker registered:', reg.scope);
      } catch (err) {
        console.warn('[PWA] Service Worker registration failed:', err);
      }
    }

    this.renderLanding();
  },

  /**
   * STEP 1 — INITIAL APP SCREEN
   * Shows ONLY brand header & Caregiver Login button.
   * NO patient profiles or launch buttons shown on entry!
   */
  renderLanding() {
    const container = document.getElementById('app');
    container.className = 'app-container';
    container.innerHTML = `
      <div class="portal-selector-card">
        <div class="brand-header">
          <span class="brand-icon">🧠</span>
          <span>NeuroNova</span>
        </div>
        <p class="portal-tagline">
          Accessible Cognitive Training & Daily Memory Care
        </p>

        <!-- Primary Entrance: Caregiver Authentication (Step 1) -->
        <button class="btn btn-huge patient-launch-btn" style="background:linear-gradient(135deg, #8b5cf6, #3b82f6); margin-top:16px;" onclick="App.openCaregiverLogin()">
          <span class="icon-badge">🔐</span>
          <span class="btn-text-main">Caregiver Login</span>
          <span class="btn-sub">Authenticate to Manage Patients & Analytics</span>
        </button>
      </div>
    `;
  },

  /**
   * STEP 2 — CAREGIVER AUTHENTICATION
   * Requires PIN authentication before exposing patient management or profiles.
   */
  openCaregiverLogin() {
    const container = document.getElementById('app');
    container.className = 'app-container';
    container.innerHTML = `
      <div class="portal-selector-card">
        <div class="brand-header">
          <span class="brand-icon">🔐</span>
          <span>Caregiver Access</span>
        </div>
        <p class="portal-tagline">
          Enter Caregiver PIN to access patient profiles and management controls.
        </p>

        <form onsubmit="App.handleCaregiverLoginSubmit(event)" class="setup-form" style="max-width:340px;">
          <div class="form-group">
            <label for="app-caregiver-pin">Enter Caregiver PIN</label>
            <input type="password" id="app-caregiver-pin" class="form-input" placeholder="Default PIN: 1234" required autofocus />
          </div>
          <div id="app-login-error" style="color:#ef4444; font-size:0.9rem; font-weight:700; display:none;"></div>
          <button type="submit" class="btn btn-primary btn-large">Login 🔑</button>
        </form>

        <button class="btn btn-secondary" onclick="App.renderLanding()" style="margin-top:8px;">← Back to Welcome</button>
      </div>
    `;
  },

  async handleCaregiverLoginSubmit(event) {
    event.preventDefault();
    const pin = document.getElementById('app-caregiver-pin').value;
    const res = await CaregiverAuthService.login(pin);

    if (res.success) {
      this.renderPatientManagement();
    } else {
      const errEl = document.getElementById('app-login-error');
      if (errEl) {
        errEl.innerText = res.message;
        errEl.style.display = 'block';
      }
    }
  },

  /**
   * STEP 3 — PATIENT MANAGEMENT SCREEN
   * Large, mobile-friendly patient cards (No dropdowns).
   * Accessible ONLY after caregiver login.
   */
  async renderPatientManagement() {
    if (!CaregiverAuthService.isAuthenticated()) {
      this.openCaregiverLogin();
      return;
    }

    const container = document.getElementById('app');
    const allPatients = await PatientDataService.getAllPatients();
    const caregiverName = CaregiverAuthService.getCaregiverName();

    container.className = 'app-container caregiver-mode';
    container.innerHTML = `
      <div class="caregiver-dashboard">
        <!-- Top Bar Header -->
        <div class="caregiver-header">
          <div class="brand-header-sm">
            <span style="font-size:1.6rem;">🧠</span>
            <span>NeuroNova</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="caregiver-badge">Caregiver Portal 👤</span>
            <button class="back-btn" onclick="App.handleCaregiverLogout()" style="color:#ef4444; border-color:#ef4444;">Logout 🔒</button>
          </div>
        </div>

        <div class="greeting-section">
          <h1 class="greeting-title">Welcome, ${caregiverName} 👋</h1>
          <p class="greeting-subtitle">Select a patient below to launch their cognitive session, or create a new profile.</p>
        </div>

        <!-- Section Action Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin:4px 0;">
          <h2 style="font-size:1.35rem;">Patients List</h2>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" style="padding:8px 14px; font-size:0.9rem;" onclick="App.showAddPatientModal()">+ Add New Patient</button>
            <button class="btn btn-primary" style="padding:8px 14px; font-size:0.9rem;" onclick="CaregiverDashboard.render(document.getElementById('app'))">Analytics Dashboard 📊</button>
          </div>
        </div>

        <!-- STEP 3 & STEP 8: Large Mobile-Friendly Patient Cards (Deduplicated) -->
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
          ${allPatients.map(p => `
            <div class="action-card" style="align-items:flex-start; text-align:left; padding:20px; gap:12px; cursor:default; min-height:auto;">
              <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:2rem;">👤</span>
                  <div>
                    <h3 style="font-size:1.4rem; font-weight:800;">${p.patientName}</h3>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">Age: ${p.age ? `${p.age} years` : 'Not set'}</div>
                  </div>
                </div>
                <span class="status-badge unlocked" style="font-size:0.75rem;">Level ${p.currentLevel || 1}</span>
              </div>

              <div style="background:var(--bg-primary); padding:10px 14px; border-radius:var(--radius-sm); width:100%; font-size:0.9rem; border:1px solid var(--border-color);">
                <div style="font-weight:700; color:var(--accent-amber);">${BaselineService.getBaselineStatusText(p)}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">ID: ${p.patientId}</div>
              </div>

              <!-- STEP 5: Select & Start Session -->
              <button class="btn btn-primary btn-large" style="width:100%; margin-top:4px;" onclick="App.selectPatientAndLaunch('${p.patientId}')">
                Select & Start Session 🎮
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * STEP 5 — START PATIENT SESSION
   * 1. Calls setActivePatient(patientId)
   * 2. Loads isolated patient data
   * 3. Locks caregiver session
   * 4. Enters simplified Patient Mode
   */
  async selectPatientAndLaunch(patientId) {
    // 1 & 2. Set active patient and load isolated data
    await PatientDataService.setActivePatient(patientId);

    // 3 & 4. Lock caregiver session before handing phone to elderly user
    CaregiverAuthService.logout();

    // 5. Render Patient Mode (Step 6)
    PatientDashboard.render(document.getElementById('app'));
  },

  /**
   * STEP 4 — ADD NEW PATIENT
   * Collects Name, Age, Profile Info; generates UNIQUE patient ID.
   */
  async showAddPatientModal() {
    const name = prompt('Enter Patient Name (e.g. Ravi or Shaik):');
    if (!name || !name.trim()) return;
    const age = prompt('Enter Patient Age (Optional e.g. 75):');
    const info = prompt('Enter Patient Profile Notes (Optional):');

    const newPatient = await PatientDataService.createPatient(name, age, info);
    alert(`Created new profile for ${newPatient.patientName} (ID: ${newPatient.patientId})!`);
    this.renderPatientManagement();
  },

  handleCaregiverLogout() {
    CaregiverAuthService.logout();
    this.renderLanding();
  },

  /**
   * STEP 7 — RETURN TO CAREGIVER MODE
   * Triggered when elderly patient or caregiver taps 🔒 Caregiver Access
   */
  openCaregiverLoginModal() {
    this.openCaregiverLogin();
  }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
