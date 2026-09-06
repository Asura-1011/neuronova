/**
 * Family Photo Memory Tree Component
 * Displays family members with pictures, names, and relations.
 * Clicking a photo card triggers Text-to-Speech: "This is your daughter, Fathima".
 */

const MemoriesView = {
  render(container) {
    const family = AdaptiveEngine.getFamilyMemories();

    VoiceAssistant.speak("My Family Memories. Tap on any family member to hear their name and relationship!");

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <div class="view-header">
          <button class="back-btn" onclick="PatientDashboard.render(document.getElementById('app'))">← Dashboard</button>
          <h2>My Family Memories 🧠</h2>
        </div>

        <p style="color:var(--text-secondary); font-size:1.05rem;">
          Tap any family picture to listen to your AI Assistant introduce them:
        </p>

        <div class="family-tree-grid">
          ${family.map(member => `
            <div class="family-card" onclick="MemoriesView.speakMember('${member.name}', '${member.relation}')">
              <div class="family-avatar">
                ${member.image.startsWith('http') || member.image.startsWith('data:') 
                  ? `<img src="${member.image}" alt="${member.name}" />`
                  : `<span>${member.image}</span>`}
              </div>
              <div class="family-info">
                <div class="family-name">${member.name}</div>
                <div class="family-relation">${member.relation}</div>
                <div class="audio-hint-badge">🔊 Tap to Listen</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  speakMember(name, relation) {
    const text = `This is your ${relation}, ${name}.`;
    VoiceAssistant.speak(text);
  }
};

