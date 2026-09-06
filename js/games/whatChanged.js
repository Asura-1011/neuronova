/**
 * Game 5: What Changed?
 * Level difficulty scaling via GameDifficultyService
 */

const WhatChangedGame = {
  itemsPool: ['🐶', '🐱', '🌺', '🚗', '🍎', '⚽', '👑', '🎸', '🎈', '⭐', '🚲', '🍕'],
  originalGrid: [],
  changedIndex: -1,
  newItem: '',
  oldItem: '',
  score: 0,
  roundsCompleted: 0,
  maxRounds: 3,
  gridSize: 9,
  previewTimeMs: 4000,
  startTime: null,
  isPhase1: true,
  onCompleteCallback: null,

  render(container, onComplete) {
    this.onCompleteCallback = onComplete;
    this.score = 0;
    this.roundsCompleted = 0;
    this.startTime = Date.now();

    const patient = AdaptiveEngine.getPatient();
    const diff = GameDifficultyService.getDifficultyForGame('game5', patient.level);
    this.gridSize = diff.gridSize || 9;
    this.previewTimeMs = diff.previewTimeMs || 4000;

    VoiceAssistant.speak("What Changed? Look at the grid of items, then spot which item changes!", "game_start");

    container.innerHTML = `
      <div class="game-container">
        <div class="game-header-bar">
          <button class="back-btn" onclick="GameMenu.render(document.getElementById('app'))">← Exit</button>
          <div class="game-stat">
            <span class="game-stat-label">Round</span>
            <span class="game-stat-value" id="wc-round">1 / 3</span>
          </div>
          <div class="game-stat">
            <span class="game-stat-label">Score</span>
            <span class="game-stat-value" id="wc-score">0</span>
          </div>
        </div>

        <div class="game-instruction-banner" id="wc-banner">
          <span>Observe this scene carefully (${Math.round(this.previewTimeMs/1000)} seconds)...</span>
          <button class="speak-btn" onclick="VoiceAssistant.speak('Observe this grid carefully.')">🔊</button>
        </div>

        <div class="scene-container" id="wc-scene" style="grid-template-columns: repeat(${this.gridSize > 9 ? 4 : 3}, 1fr);">
          <!-- Grid items -->
        </div>
      </div>
    `;

    this.startRound();
  },

  startRound() {
    this.isPhase1 = true;
    const shuffled = [...this.itemsPool].sort(() => Math.random() - 0.5);
    this.originalGrid = shuffled.slice(0, this.gridSize);

    const scene = document.getElementById('wc-scene');
    const banner = document.getElementById('wc-banner');

    if (banner) banner.querySelector('span').innerText = `Observe this grid carefully! (${Math.round(this.previewTimeMs/1000)} seconds)`;

    if (scene) {
      scene.innerHTML = this.originalGrid.map((item, idx) => `
        <div class="scene-item">${item}</div>
      `).join('');
    }

    VoiceAssistant.speak("Study where each item is placed.");

    setTimeout(() => {
      this.isPhase1 = false;
      this.changedIndex = Math.floor(Math.random() * this.gridSize);
      this.oldItem = this.originalGrid[this.changedIndex];

      const remaining = this.itemsPool.filter(i => !this.originalGrid.includes(i));
      this.newItem = remaining[Math.floor(Math.random() * remaining.length)];

      const modifiedGrid = [...this.originalGrid];
      modifiedGrid[this.changedIndex] = this.newItem;

      if (banner) banner.querySelector('span').innerText = 'One item has changed! Tap the item that changed.';

      if (scene) {
        scene.innerHTML = modifiedGrid.map((item, idx) => `
          <div class="scene-item" onclick="WhatChangedGame.handleItemClick(${idx})">${item}</div>
        `).join('');
      }

      VoiceAssistant.speak("One item changed! Tap on the new item.");
    }, this.previewTimeMs);
  },

  handleItemClick(idx) {
    if (this.isPhase1) return;

    if (idx === this.changedIndex) {
      this.score += 60;
      this.roundsCompleted++;
      document.getElementById('wc-score').innerText = this.score;
      document.getElementById('wc-round').innerText = `${Math.min(3, this.roundsCompleted + 1)} / 3`;

      VoiceAssistant.speak("Sharp eye! You found what changed!", "success");

      if (this.roundsCompleted >= this.maxRounds) {
        this.finishGame(100);
      } else {
        setTimeout(() => this.startRound(), 1200);
      }
    } else {
      VoiceAssistant.speak("Nice try! Keep practicing.", "mistake");
      this.roundsCompleted++;
      if (this.roundsCompleted >= this.maxRounds) {
        this.finishGame(75);
      } else {
        setTimeout(() => this.startRound(), 1200);
      }
    }
  },

  finishGame(accuracy) {
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
    VoiceAssistant.speak("Congratulations! You completed all games for today!", "success");

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback('game5', this.score, accuracy, timeTaken);
      }
    }, 800);
  }
};
