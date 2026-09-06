/**
 * STEP 6 — PATIENT MODE (PatientDashboard Component)
 * Accessible, elderly-friendly dashboard focusing purely on cognitive activities.
 * Handles Case 1 (Tasks Not Completed) vs Case 2 (Daily Completion Guard).
 */

const PatientDashboard = {
  render(container) {
    const patient = AdaptiveEngine.getPatient();
    
    // CASE 2 — DAILY TASK ALREADY COMPLETED GUARD
    if (patient && (patient.todayGamesCompleted || 0) >= 5) {
      this.renderDailyCompletion(container, patient);
      return;
    }

    const baselineStatusText = BaselineService.getBaselineStatusText(patient);
    
    // CASE 1 — DAILY TASK NOT COMPLETED
    VoiceAssistant.speak(`Hello ${patient.name}. What would you like to do today?`, "welcome");

    const starsHtml = Array(patient.todayGamesCompleted || 0)
      .fill('⭐')
      .concat(Array(5 - (patient.todayGamesCompleted || 0)).fill('☆'))
      .join(' ');

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <!-- Top Bar with Audio, Contrast, and Discreet Caregiver Lock -->
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

        <!-- Greeting & Baseline Badge Section -->
        <div class="greeting-section">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h1 class="greeting-title">Hello, ${patient.name} 👋</h1>
            <span class="status-badge unlocked" style="font-size:0.75rem;">${baselineStatusText}</span>
          </div>
          <p class="greeting-subtitle">What would you like to do today?</p>
        </div>

        <!-- 4 Main Accessible Action Grid Cards -->
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

        <!-- Today's Progress Card -->
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

  /**
   * CASE 2 — DAILY TASK ALREADY COMPLETED SCREEN & VOICE
   * Displays clear UI completion message and speaks ONLY the specified completion audio once.
   */
  renderDailyCompletion(container, patient) {
    // 1. Stop any ongoing voice or interactive commands
    VoiceAssistant.stop();

    const patientName = patient.patientName || patient.name || 'Valued Patient';

    // 2. Speak ONLY the exact completion message once
    const completionVoiceText = `Sorry, ${patientName}. You have already completed today's cognitive activities. Your progress has been saved successfully. Please come back tomorrow for your next session. Take care and have a wonderful day.`;
    
    // Use general context so it does NOT prepend "Welcome"
    VoiceAssistant.speak(completionVoiceText, "general");

    // 3. Render Completion UI
    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <!-- Top Bar Header with Caregiver Lock -->
        <div class="top-bar">
          <div class="brand-header-sm">
            <span style="font-size:1.6rem;">🧠</span>
            <span>NeuroNova</span>
          </div>
          <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.85rem;" title="Caregiver Access" onclick="App.openCaregiverLoginModal()">🔒 Caregiver Access</button>
        </div>

        <!-- Completion Card -->
        <div style="background:var(--bg-glass); border:2px solid var(--accent-green); border-radius:var(--radius-lg); padding:32px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; margin:auto 0; box-shadow:var(--shadow-glow);">
          <div style="font-size:3.5rem;">🎉 🌟 💙</div>
          <h2 style="font-size:1.8rem; color:var(--accent-green);">Daily Activities Completed!</h2>
          
          <p style="font-size:1.25rem; font-weight:800; color:var(--text-primary);">
            Excellent work, ${patientName}!
          </p>

          <p style="font-size:1.05rem; color:var(--text-secondary); line-height:1.6; max-width:420px;">
            You have already completed all of today's cognitive activities.<br><br>
            Your progress has been saved successfully.<br><br>
            Please take some rest and come back tomorrow for your next session.<br><br>
            💙 Take care!
          </p>

          <div class="status-badge completed" style="font-size:1rem; padding:10px 20px; margin-top:8px;">
            5 / 5 Daily Games Finished ✅
          </div>

          <button class="btn btn-primary btn-large" style="margin-top:16px; max-width:320px;" onclick="App.openCaregiverLoginModal()">
            🔒 Caregiver Portal
          </button>
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
