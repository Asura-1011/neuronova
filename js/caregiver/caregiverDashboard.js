/**
 * Caregiver Dashboard Component (Matching User Mockup 2 & Auth Security)
 * Features metrics cards, SVG Cognitive progress graph, streak tracking,
 * baseline tracking, patient selection, and management tabs.
 * Protected by CaregiverAuthService PIN authentication.
 */

const CaregiverDashboard = {
  currentTab: 'chart',

  async render(container) {
    if (!CaregiverAuthService.isAuthenticated()) {
      App.openCaregiverLogin();
      return;
    }

    const patient = AdaptiveEngine.getPatient();
    const caregiver = AdaptiveEngine.getCaregiver();
    const metrics = AdaptiveEngine.getCaregiverMetrics();
    const activePatientObj = await PatientDataService.getActivePatient();
    const logs = activePatientObj.gameLogs || [];
    const allPatients = await PatientDataService.getAllPatients();

    container.className = 'app-container caregiver-mode';
    container.innerHTML = `
      <div class="caregiver-dashboard">
        <!-- Header (Matching Mockup 2 & Part 4 Auth) -->
        <div class="caregiver-header">
          <div class="brand-header-sm">
            <span style="font-size:1.6rem;">🧠</span>
            <span>NeuroNova</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="caregiver-badge">Caregiver Analytics 📊</span>
            <button class="back-btn" onclick="App.renderPatientManagement()">Patient Manager 👥</button>
            <button class="back-btn" onclick="CaregiverDashboard.handleLogout()" style="color:#ef4444; border-color:#ef4444;">Logout 🔒</button>
          </div>
        </div>

        <!-- Patient Selector Bar (Part 3 & 4) -->
        <div style="background:var(--bg-card); padding:14px 18px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-weight:700;">Active Patient Data:</span>
            <select id="caregiver-patient-select" class="form-input" style="padding:6px 12px; font-size:0.95rem; width:auto;" onchange="CaregiverDashboard.handlePatientChange(this.value)">
              ${allPatients.map(p => `
                <option value="${p.patientId}" ${p.patientId === patient.id ? 'selected' : ''}>
                  ${p.patientName} ${p.age ? `(${p.age} y/o)` : ''} - Level ${p.currentLevel || 1}
                </option>
              `).join('')}
            </select>
          </div>
          <button class="btn btn-secondary" style="padding:8px 14px; font-size:0.85rem;" onclick="App.showAddPatientModal()">+ New Patient</button>
        </div>

        <!-- Greeting Section (Matching Mockup 2) -->
        <div class="greeting-section">
          <h1 class="greeting-title">Good Evening, ${caregiver.name} 👋</h1>
          <p class="greeting-subtitle">Here's ${patient.name}'s performance & baseline activity.</p>
        </div>

        <!-- 3 Metrics Summary Cards Grid (Matching Mockup 2) -->
        <div class="caregiver-metrics-grid">
          <div class="metric-card">
            <div class="metric-card-header">
              <span>🎮</span>
              <span>Games</span>
            </div>
            <div class="metric-value">${metrics.gamesToday} Today</div>
            <div class="metric-sub">Daily target: 5 games</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-header">
              <span>📈</span>
              <span>Accuracy</span>
            </div>
            <div class="metric-value">${metrics.avgAccuracy}%</div>
            <div class="metric-sub">${metrics.baselineDiff} vs baseline</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-header">
              <span>🎯</span>
              <span>Baseline Phase</span>
            </div>
            <div class="metric-value" style="font-size:1.15rem;">${BaselineService.getBaselineStatusText(patient)}</div>
            <div class="metric-sub">${patient.personalBaseline && patient.personalBaseline.accuracy ? `Baseline Acc: ${patient.personalBaseline.accuracy}%` : 'Assessment in progress'}</div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tab-navigation">
          <button class="tab-btn ${this.currentTab === 'chart' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('chart')">Cognitive Activity Graph 📈</button>
          <button class="tab-btn ${this.currentTab === 'memories' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('memories')">Family Tree Manager 👨‍👩‍👧</button>
          <button class="tab-btn ${this.currentTab === 'reminders' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('reminders')">Reminders Manager 🔔</button>
          <button class="tab-btn ${this.currentTab === 'settings' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('settings')">Settings & Security ⚙️</button>
        </div>

        <!-- Tab Content Area -->
        <div id="caregiver-tab-content">
          <!-- Content rendered dynamically below -->
        </div>
      </div>
    `;

    const baselineTarget = patient.personalBaseline && patient.personalBaseline.accuracy ? patient.personalBaseline.accuracy : 65;
    this.renderTabContent(logs, baselineTarget);
  },

  handleLogout() {
    CaregiverAuthService.logout();
    App.renderLanding();
  },

  async handlePatientChange(patientId) {
    await PatientDataService.setActivePatient(patientId);
    this.render(document.getElementById('app'));
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    this.render(document.getElementById('app'));
  },

  renderTabContent(logs, baselineAcc) {
    const tabContent = document.getElementById('caregiver-tab-content');
    if (!tabContent) return;

    if (this.currentTab === 'chart') {
      tabContent.innerHTML = `
        <div class="chart-container-card">
          <div class="chart-header">
            <h3>Cognitive Activity & Performance Trend</h3>
            <span style="font-size:0.9rem; color:var(--text-secondary);">Recorded Sessions</span>
          </div>
          <div id="cognitive-chart-box"></div>
        </div>
      `;
      ChartRenderer.renderCognitiveChart('cognitive-chart-box', logs, baselineAcc);
    } else if (this.currentTab === 'memories') {
      MemoryManager.render(tabContent);
    } else if (this.currentTab === 'reminders') {
      ReminderManager.render(tabContent);
    } else if (this.currentTab === 'settings') {
      SettingsManager.render(tabContent);
    }
  }
};
