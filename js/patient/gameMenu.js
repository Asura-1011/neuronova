/**
 * Daily Sequential Game Menu Component
 * Ensures games unlock sequentially (Game 1 -> Game 2 -> Game 3 -> Game 4 -> Game 5)
 */

const GameMenu = {
  render(container) {
    const gamesState = AdaptiveEngine.getGamesState();
    const patient = AdaptiveEngine.getPatient();

    VoiceAssistant.speak("Daily Games Menu. Select your unlocked game to begin training!");

    const gamesList = Object.values(gamesState);

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <div class="view-header">
          <button class="back-btn" onclick="PatientDashboard.render(document.getElementById('app'))">← Dashboard</button>
          <h2>Daily Memory Training 🎮</h2>
        </div>

        <div style="background:var(--bg-card); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:1.1rem;">Current Level: Level ${patient.level} 🌟</div>
            <div style="font-size:0.9rem; color:var(--text-secondary);">Complete games sequentially to level up!</div>
          </div>
          <button class="btn btn-secondary" style="padding:8px 14px; font-size:0.85rem;" onclick="GameMenu.resetDaily()">Reset Day 🔄</button>
        </div>

        <div class="game-list">
          ${gamesList.map(g => {
            let statusClass = 'locked';
            let statusText = '🔒 Locked';
            let clickAction = '';

            if (g.completed) {
              statusClass = 'completed';
              statusText = '✅ Completed';
            } else if (g.unlocked) {
              statusClass = 'unlocked';
              statusText = '▶️ Play Now';
              clickAction = `onclick="GameMenu.launchGame('${g.id}')"`;
            }

            return `
              <div class="game-item-card ${statusClass}" ${clickAction}>
                <div class="game-item-info">
                  <div class="game-item-icon">${g.icon}</div>
                  <div class="game-item-details">
                    <h3>${g.title}</h3>
                    <p>${g.completed ? 'Session completed for today!' : (g.unlocked ? 'Unlocked & ready to play!' : 'Complete previous game to unlock.')}</p>
                  </div>
                </div>
                <div class="status-badge ${statusClass}">${statusText}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  launchGame(gameId) {
    const container = document.getElementById('app');
    const onComplete = (gId, score, accuracy, timeTaken) => {
      const result = AdaptiveEngine.recordGameCompletion(gId, score, accuracy, timeTaken);

      if (result.promoted) {
        GameMenu.showLevelUpModal(result.newLevel, score, accuracy);
      } else {
        GameMenu.render(container);
      }
    };

    switch (gameId) {
      case 'game1':
        MemoryMatchGame.render(container, onComplete);
        break;
      case 'game2':
        SequenceRecallGame.render(container, onComplete);
        break;
      case 'game3':
        PictureRecallGame.render(container, onComplete);
        break;
      case 'game4':
        PatternMemoryGame.render(container, onComplete);
        break;
      case 'game5':
        WhatChangedGame.render(container, onComplete);
        break;
      default:
        console.error('Unknown game ID:', gameId);
    }
  },

  showLevelUpModal(newLevel, score, accuracy) {
    const modal = document.getElementById('level-up-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const stats = document.getElementById('modal-stats-container');
    const closeBtn = document.getElementById('modal-close-btn');

    if (title) title.innerText = `🎉 Congratulations! Level ${newLevel} Unlocked! 🎉`;
    if (desc) desc.innerText = `Outstanding performance! You scored ${score} points with ${accuracy}% accuracy!`;
    if (stats) {
      stats.innerHTML = `
        <div class="modal-stat-pill">Accuracy: ${accuracy}%</div>
        <div class="modal-stat-pill">Level: ${newLevel}</div>
      `;
    }

    VoiceAssistant.speak(`Congratulations! You have reached Level ${newLevel}!`);

    if (modal) modal.classList.remove('hidden');

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
        GameMenu.render(document.getElementById('app'));
      };
    }
  },

  resetDaily() {
    AdaptiveEngine.resetDailyProgress();
    this.render(document.getElementById('app'));
  }
};
