/**
 * Caregiver Dashboard Component (Matching User Mockup 2)
 * Features metrics cards, SVG Cognitive progress graph, streak tracking,
 * and management tabs for family tree, reminders, and voice settings.
 */

const CaregiverDashboard = {
  currentTab: 'chart',

  render(container) {
    const patient = AdaptiveEngine.getPatient();
    const caregiver = AdaptiveEngine.getCaregiver();
    const metrics = AdaptiveEngine.getCaregiverMetrics();
    const logs = AdaptiveEngine.state.gameLogs;

    container.className = 'app-container caregiver-mode';
    container.innerHTML = `
      <div class="caregiver-dashboard">
        <!-- Header (Matching Mockup 2) -->
        <div class="caregiver-header">
          <div class="brand-header-sm">
            <span style="font-size:1.6rem;">🧠</span>
            <span>NeuroNova</span>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="caregiver-badge">Caregiver Dashboard 👤</span>
            <button class="back-btn" onclick="App.renderLanding()">Exit</button>
          </div>
        </div>

        <!-- Greeting Section (Matching Mockup 2) -->
        <div class="greeting-section">
          <h1 class="greeting-title">Good Evening, ${caregiver.name} 👋</h1>
          <p class="greeting-subtitle">Here's ${patient.name}'s activity today.</p>
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
            <div class="metric-sub">${metrics.baselineDiff} vs 65% baseline</div>
          </div>

          <div class="metric-card">
            <div class="metric-card-header">
              <span>🔥</span>
              <span>Streak</span>
            </div>
            <div class="metric-value">${metrics.streak} Days</div>
            <div class="metric-sub">Consistent cognitive practice</div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tab-navigation">
          <button class="tab-btn ${this.currentTab === 'chart' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('chart')">Cognitive Activity Graph 📈</button>
          <button class="tab-btn ${this.currentTab === 'memories' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('memories')">Family Tree Manager 👨‍👩‍👧</button>
          <button class="tab-btn ${this.currentTab === 'reminders' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('reminders')">Reminders Manager 🔔</button>
          <button class="tab-btn ${this.currentTab === 'settings' ? 'active' : ''}" onclick="CaregiverDashboard.switchTab('settings')">Settings & Baseline ⚙️</button>
        </div>

        <!-- Tab Content Area -->
        <div id="caregiver-tab-content">
          <!-- Content rendered dynamically below -->
        </div>
      </div>
    `;

    this.renderTabContent(logs, caregiver.baselineAccuracy);
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
            <span style="font-size:0.9rem; color:var(--text-secondary);">Last 7 Sessions</span>
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
