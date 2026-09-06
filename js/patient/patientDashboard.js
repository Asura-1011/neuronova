/**
 * Patient Dashboard Component (Matching User Mockup 1)
 * Features large accessible buttons, voice toggle, high-contrast toggle,
 * greeting, 4 main action cards, and Today's Progress footer.
 */

const PatientDashboard = {
  render(container) {
    const patient = AdaptiveEngine.getPatient();
    
    // Voice prompt greeting
    VoiceAssistant.speak(`Hello ${patient.name}. What would you like to do today?`);

    const starsHtml = Array(patient.todayGamesCompleted)
      .fill('⭐')
      .concat(Array(5 - patient.todayGamesCompleted).fill('☆'))
      .join(' ');

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <!-- Top Bar (Matching Mockup 1) -->
        <div class="top-bar">
          <div class="brand-header-sm">
            <span style="font-size:1.6rem;">🧠</span>
            <span>NeuroNova</span>
          </div>
          <div class="top-actions">
            <button class="icon-btn" title="Toggle Audio" onclick="PatientDashboard.toggleAudio()">🔊</button>
            <button class="icon-btn" title="Toggle High Contrast" onclick="PatientDashboard.toggleContrast()">☀️</button>
            <button class="icon-btn" title="Switch Portal" onclick="App.renderLanding()">👤</button>
          </div>
        </div>

        <!-- Greeting Section (Matching Mockup 1) -->
        <div class="greeting-section">
          <h1 class="greeting-title">Hello, ${patient.name} 👋</h1>
          <p class="greeting-subtitle">What would you like to do today?</p>
        </div>

        <!-- 4 Main Accessible Action Grid Cards (Matching Mockup 1) -->
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

        <!-- Today's Progress Card (Bottom Mockup 1) -->
        <div class="today-progress-card">
          <div class="progress-info">
            <span class="star-badge">🌟</span>
            <span>Today's Progress</span>
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
