/**
 * STEP 6 — PATIENT MODE (PatientDashboard Component)
 * Accessible, elderly-friendly dashboard focusing purely on cognitive activities.
 * Hides administrative settings, patient switching, and analytics.
 */

const PatientDashboard = {
  render(container) {
    const patient = AdaptiveEngine.getPatient();
    const baselineStatusText = BaselineService.getBaselineStatusText(patient);
    
    VoiceAssistant.speak(`Hello ${patient.name}. What would you like to do today?`, "welcome");

    const starsHtml = Array(patient.todayGamesCompleted)
      .fill('⭐')
      .concat(Array(5 - patient.todayGamesCompleted).fill('☆'))
      .join(' ');

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <!-- Top Bar with Audio, Contrast, and Discreet Caregiver Lock (Step 6 & 7) -->
        <div class="top-bar">
          <div class="brand-header-sm">
            <span style="font-size:1.6rem;">🧠</span>
            <span>NeuroNova</span>
          </div>
          <div class="top-actions">
            <button class="icon-btn" title="Toggle Audio" onclick="PatientDashboard.toggleAudio()">🔊</button>
            <button class="icon-btn" title="Toggle High Contrast" onclick="PatientDashboard.toggleContrast()">☀️</button>
            <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.85rem;" title="Caregiver Access" onclick="App.openCaregiverLoginModal()">🔒 Caregiver Access</button>
          </div>
        </div>

        <!-- Greeting & Baseline Badge Section (Step 6) -->
        <div class="greeting-section">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h1 class="greeting-title">Hello, ${patient.name} 👋</h1>
            <span class="status-badge unlocked" style="font-size:0.75rem;">${baselineStatusText}</span>
          </div>
          <p class="greeting-subtitle">What would you like to do today?</p>
        </div>

        <!-- 4 Main Accessible Action Grid Cards (Step 6) -->
        <div class="patient-action-grid">
          <div class="action-card" onclick="GameMenu.render(document.getElementById('app'))">
            <div class="action-card-icon">🎮</div>
            <div class="action-card-title">Play Games</div>
          </div>

          <div class="action-card" onclick="MemoriesView.render(document.getElementById('app'))">
            <div class="action-card-icon">🧠</div>
            <div class="action-card-title">My Memories</div>
          </div>

          <div class="action-card" onclick="RemindersView.render(document.getElementById('app'))">
            <div class="action-card-icon">🔔</div>
            <div class="action-card-title">Reminders</div>
          </div>

          <div class="action-card" onclick="RoutineView.render(document.getElementById('app'))">
            <div class="action-card-icon">📅</div>
            <div class="action-card-title">My Routine</div>
          </div>
        </div>

        <!-- Today's Progress Card (Step 6) -->
        <div class="today-progress-card">
          <div class="progress-info">
            <span class="star-badge">🌟</span>
            <div>
              <div style="font-weight:800;">Today's Progress</div>
              <div style="font-size:0.8rem; opacity:0.9;">Level ${patient.level}</div>
            </div>
          </div>
          <div class="progress-stars" title="${patient.todayGamesCompleted} of 5 games completed">
            ${starsHtml}
          </div>
        </div>
      </div>
    `;
  },

  toggleAudio() {
    const isEnabled = VoiceAssistant.toggleVoice();
    alert(isEnabled ? 'Voice Assistant Enabled 🔊' : 'Voice Assistant Muted 🔇');
  },

  toggleContrast() {
    document.body.classList.toggle('high-contrast');
  }
};
