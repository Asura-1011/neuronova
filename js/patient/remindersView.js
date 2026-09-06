/**
 * Patient Reminders View Component
 * Clear list of daily reminders with audio playback buttons
 */

const RemindersView = {
  render(container) {
    const reminders = AdaptiveEngine.getReminders();

    VoiceAssistant.speak("Daily Reminders. Tap the speaker next to any reminder to hear it aloud.");

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <div class="view-header">
          <button class="back-btn" onclick="PatientDashboard.render(document.getElementById('app'))">← Dashboard</button>
          <h2>Daily Reminders 🔔</h2>
        </div>

        <div class="reminders-list">
          ${reminders.map(rem => `
            <div class="reminder-card">
              <div class="reminder-time-badge">${rem.time}</div>
              <div class="reminder-text">${rem.text}</div>
              <button class="speak-btn" onclick="VoiceAssistant.speak('${rem.time}. ${rem.text}')">🔊</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};
