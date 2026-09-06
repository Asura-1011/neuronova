/**
 * ReminderManager Component (Caregiver side)
 * Allows creating and updating daily patient reminders
 */

const ReminderManager = {
  render(container) {
    const reminders = AdaptiveEngine.getReminders();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div style="background:var(--bg-card); padding:20px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h3 style="margin-bottom:12px;">Add Daily Reminder 🔔</h3>
          <form onsubmit="ReminderManager.handleAdd(event)" style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:grid; grid-template-columns:1fr 2fr; gap:12px;">
              <input type="text" id="rem-time" placeholder="Time (e.g. 09:00 AM)" class="form-input" required />
              <input type="text" id="rem-text" placeholder="Reminder Message (e.g. Drink Water 💧)" class="form-input" required />
            </div>
            <button type="submit" class="btn btn-primary" style="align-self:flex-start;">+ Add Reminder</button>
          </form>
        </div>

        <h3 style="margin-top:8px;">Active Patient Reminders</h3>
        <div class="reminders-list">
          ${reminders.map(r => `
            <div class="reminder-card">
              <div class="reminder-time-badge">${r.time}</div>
              <div class="reminder-text">${r.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  handleAdd(event) {
    event.preventDefault();
    const time = document.getElementById('rem-time').value;
    const text = document.getElementById('rem-text').value;

    AdaptiveEngine.addReminder(text, time);
    alert('Reminder created successfully!');
    this.render(document.getElementById('caregiver-tab-content'));
  }
};
