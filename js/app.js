/**
 * NeuroNova Main Router & Navigation System
 * Flow: Step 1 (Welcome) -> Step 2 (Caregiver PIN) -> Step 3 (Patient Manager) -> Step 5 (Patient Mode)
 * Features Patient Cards with visible "🗑️ Delete Patient" buttons & safe deletion modals.
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
   * Large, mobile-friendly patient cards displaying:
   * 1. Patient Name & Age
   * 2. Level & Baseline Status
   * 3. Select & Start Session 🎮 button
   * 4. 🗑️ Delete Patient button (Destructive red style)
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
          <p class="greeting-subtitle">Manage your patient profiles or launch a daily cognitive session below.</p>
        </div>

        <!-- Section Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin:4px 0;">
          <h2 style="font-size:1.35rem;">Patients List (${allPatients.length})</h2>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" style="padding:8px 14px; font-size:0.9rem;" onclick="App.showAddPatientModal()">+ Add New Patient</button>
            ${allPatients.length > 0 ? `
              <button class="btn btn-primary" style="padding:8px 14px; font-size:0.9rem;" onclick="CaregiverDashboard.render(document.getElementById('app'))">Analytics Dashboard 📊</button>
            ` : ''}
          </div>
        </div>

        <!-- Empty State Handling (Last Patient Safety) -->
        ${allPatients.length === 0 ? `
          <div style="background:var(--bg-card); border:2px dashed var(--border-color); border-radius:var(--radius-lg); padding:40px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; margin:20px 0;">
            <div style="font-size:3rem;">👤❓</div>
            <h3 style="font-size:1.5rem;">No patient profiles available.</h3>
            <p style="color:var(--text-secondary); max-width:400px;">There are currently no patient profiles in the system. Click below to create a new profile.</p>
            <button class="btn btn-primary btn-large" style="max-width:320px;" onclick="App.showAddPatientModal()">
              ➕ Create New Patient
            </button>
          </div>
        ` : `
          <!-- VISIBLE PATIENT CARDS WITH DELETE BUTTON -->
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
            ${allPatients.map(p => `
              <div class="action-card" style="align-items:flex-start; text-align:left; padding:20px; gap:12px; cursor:default; min-height:auto; width:100%;">
                
                <!-- Patient Name & Details -->
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:2rem;">👤</span>
                    <div>
                      <h3 style="font-size:1.4rem; font-weight:800;">${p.patientName}</h3>
                      <div style="font-size:0.9rem; color:var(--text-secondary);">Age: ${p.age ? `${p.age} years` : 'Not set'} • Level ${p.currentLevel || 1}</div>
                    </div>
                  </div>
                  <span class="status-badge unlocked" style="font-size:0.75rem;">Level ${p.currentLevel || 1}</span>
                </div>

                <!-- Baseline Status -->
                <div style="background:var(--bg-primary); padding:10px 14px; border-radius:var(--radius-sm); width:100%; font-size:0.9rem; border:1px solid var(--border-color);">
                  <div style="font-weight:700; color:var(--accent-amber);">${BaselineService.getBaselineStatusText(p)}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">ID: ${p.patientId}</div>
                </div>

                <!-- Primary Action: Select & Start Session -->
                <button class="btn btn-primary btn-large" style="width:100%; margin-top:6px;" onclick="App.selectPatientAndLaunch('${p.patientId}')">
                  Select & Start Session 🎮
                </button>

                <!-- Destructive Action: 🗑️ Delete Patient (Caregiver Only) -->
                <button class="btn btn-danger btn-large" style="width:100%; margin-top:6px; background-color:#dc2626; color:#ffffff; border:2px solid #ef4444; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="App.showDeleteConfirmationModal('${p.patientId}', '${p.patientName.replace(/'/g, "\\'")}')">
                  🗑️ Delete Patient
                </button>

              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="delete-patient-modal" class="modal-overlay hidden">
        <div class="modal-card" style="border-color:#ef4444;">
          <div class="confetti-icon" style="font-size:2.8rem;">⚠️</div>
          <h2 style="color:#ef4444;">Delete Patient Profile?</h2>
          <p id="delete-modal-msg" style="color:var(--text-primary); font-size:1.05rem; line-height:1.5;">
            Are you sure you want to permanently delete this patient? This will delete all progress, scores, game history, baseline records, reminders, memories and patient data.
          </p>
          <div style="display:flex; flex-direction:column; gap:10px; width:100%; margin-top:12px;">
            <button id="confirm-delete-btn" class="btn btn-danger btn-large" style="background-color:#dc2626; color:#fff; font-weight:800;">Delete Permanently 🗑️</button>
            <button onclick="App.hideDeleteConfirmationModal()" class="btn btn-secondary btn-large">Cancel</button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Shows confirmation dialog for patient deletion
   */
  showDeleteConfirmationModal(patientId, patientName) {
    const modal = document.getElementById('delete-patient-modal');
    const msg = document.getElementById('delete-modal-msg');
    const confirmBtn = document.getElementById('confirm-delete-btn');

    if (msg) {
      msg.innerHTML = `Are you sure you want to permanently delete <strong>${patientName}</strong>?<br><br>This will delete all progress, scores, game history, baseline records, reminders, memories and patient data.`;
    }

    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        App.hideDeleteConfirmationModal();
        await App.performDeletePatient(patientId);
      };
    }

    if (modal) modal.classList.remove('hidden');
  },

  hideDeleteConfirmationModal() {
    const modal = document.getElementById('delete-patient-modal');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Executes deletion using unique patientId
   */
  async performDeletePatient(patientId) {
    const res = await PatientDataService.deletePatient(patientId);
    if (res.success) {
      // Re-render Patient Management screen immediately
      this.renderPatientManagement();
    } else {
      alert(`Failed to delete patient: ${res.message}`);
    }
  },

  /**
   * STEP 5 — START PATIENT SESSION
   */
  async selectPatientAndLaunch(patientId) {
    await PatientDataService.setActivePatient(patientId);
    CaregiverAuthService.logout();
    PatientDashboard.render(document.getElementById('app'));
  },

  /**
   * STEP 4 — ADD NEW PATIENT
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

  openCaregiverLoginModal() {
    this.openCaregiverLogin();
  }
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
