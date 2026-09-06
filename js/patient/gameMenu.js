/**
 * Daily Sequential Game Menu Component
 * Ensures games unlock sequentially (Game 1 -> Game 2 -> Game 3 -> Game 4 -> Game 5)
 * Displays Baseline Assessment status & end-of-session Level evaluation modals
 */

const GameMenu = {
  async render(container) {
    const gamesState = AdaptiveEngine.getGamesState();
    const patient = AdaptiveEngine.getPatient();
    const baselineStatusText = BaselineService.getBaselineStatusText(patient);

    VoiceAssistant.speak("Daily Games Menu. Select your unlocked game to begin training!");

    const gamesList = Object.values(gamesState);

    container.className = 'app-container';
    container.innerHTML = `
      <div class="patient-dashboard">
        <div class="view-header">
          <button class="back-btn" onclick="PatientDashboard.render(document.getElementById('app'))">← Dashboard</button>
          <h2>Daily Memory Training 🎮</h2>
        </div>

        <div style="background:var(--bg-card); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-glow); display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:1.15rem; color:var(--text-primary);">Current Level: Level ${patient.level} 🌟</div>
            <span class="status-badge unlocked" style="font-size:0.75rem;">${baselineStatusText}</span>
          </div>
          <div style="font-size:0.9rem; color:var(--text-secondary);">
            ${patient.baselineStatus && patient.baselineStatus.isCompleted 
              ? 'Complete daily games to improve beyond your personal baseline!' 
              : 'Complete Days 1 to 3 to establish your personal performance baseline.'}
          </div>
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

  async launchGame(gameId) {
    const container = document.getElementById('app');
    const onComplete = async (gId, score, accuracy, timeTaken) => {
      const result = await AdaptiveEngine.recordGameCompletion(gId, score, accuracy, timeTaken);

      // 1. Check if Baseline completed message should be shown
      if (result.baselineResult && result.baselineResult.baselineJustFinished) {
        alert('🎉 Baseline Complete!\n\nYour 3-day personal baseline assessment has been successfully established!');
      }

      // 2. Check if Level Evaluation occurred
      if (result.levelResult) {
        GameMenu.showSessionEvaluationModal(result.levelResult);
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

  showSessionEvaluationModal(evalResult) {
    const modal = document.getElementById('level-up-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const stats = document.getElementById('modal-stats-container');
    const closeBtn = document.getElementById('modal-close-btn');

    if (title) title.innerText = evalResult.title || (evalResult.promoted ? '🎉 Level Up!' : '🌟 Great Practice!');
    if (desc) desc.innerText = evalResult.message;
    
    if (stats) {
      stats.innerHTML = `
        <div class="modal-stat-pill">Accuracy: ${evalResult.dailyAccuracy || 80}%</div>
        <div class="modal-stat-pill">Level: ${evalResult.newLevel || evalResult.currentLevel || 1}</div>
      `;
    }

    VoiceAssistant.speak(evalResult.message, evalResult.promoted ? 'success' : 'general');

    if (modal) modal.classList.remove('hidden');

    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
        GameMenu.render(document.getElementById('app'));
      };
    }
  }
};
