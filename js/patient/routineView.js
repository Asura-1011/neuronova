/**
 * Patient Daily Routine View Component
 * Accessible schedule & guided activities
 */

const RoutineView = {
  routineItems: [
    { title: 'Morning Glass of Water 💧', time: '07:30 AM', done: true },
    { title: 'Morning Stretch & Light Exercise 🧘‍♂️', time: '08:30 AM', done: true },
    { title: 'NeuroNova Cognitive Games 🎮', time: '10:00 AM', done: false },
    { title: 'Lunch & Family Conversation 🥗', time: '01:00 PM', done: false },
    { title: 'Afternoon Relaxation & Music 🎵', time: '04:00 PM', done: false }
  ],

  render(container) {
    VoiceAssistant.speak("My Daily Routine. Here is your daily activity checklist.");

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <div class="view-header">
          <button class="back-btn" onclick="PatientDashboard.render(document.getElementById('app'))">← Dashboard</button>
          <h2>My Daily Routine 📅</h2>
        </div>

        <div class="reminders-list">
          ${this.routineItems.map((item, idx) => `
            <div class="reminder-card" style="border-left: 4px solid ${item.done ? 'var(--accent-green)' : 'var(--accent-purple)'};">
              <div class="reminder-time-badge" style="background:var(--bg-primary);">${item.time}</div>
              <div class="reminder-text" style="${item.done ? 'text-decoration:line-through; opacity:0.7;' : ''}">${item.title}</div>
              <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.85rem;" onclick="RoutineView.toggleDone(${idx})">
                ${item.done ? '✅ Done' : 'Mark Done'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  toggleDone(idx) {
    this.routineItems[idx].done = !this.routineItems[idx].done;
    if (this.routineItems[idx].done) {
      VoiceAssistant.speak(`Great job completing ${this.routineItems[idx].title}`);
    }
    this.render(document.getElementById('app'));
  }
};
