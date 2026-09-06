/**
 * Game 5: What Changed?
 * Dementia Patient Cognitive Training
 */

const WhatChangedGame = {
  itemsPool: ['🐶', '🐱', '🌺', '🚗', '🍎', '⚽', '👑', '🎸', '🎈', '⭐'],
  originalGrid: [],
  changedIndex: -1,
  newItem: '',
  oldItem: '',
  score: 0,
  roundsCompleted: 0,
  maxRounds: 3,
  startTime: null,
  isPhase1: true,
  onCompleteCallback: null,

  render(container, onComplete) {
    this.onCompleteCallback = onComplete;
    this.score = 0;
    this.roundsCompleted = 0;
    this.startTime = Date.now();

    VoiceAssistant.speak("What Changed? Look at the grid of items, then spot which item changes!");

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
          <span>Observe this scene carefully (4 seconds)...</span>
          <button class="speak-btn" onclick="VoiceAssistant.speak('Observe this grid carefully.')">🔊</button>
        </div>

        <div class="scene-container" id="wc-scene">
          <!-- Grid items -->
        </div>
      </div>
    `;

    this.startRound();
  },

  startRound() {
    this.isPhase1 = true;
    // Select 9 items for original grid
    const shuffled = [...this.itemsPool].sort(() => Math.random() - 0.5);
    this.originalGrid = shuffled.slice(0, 9);

    const scene = document.getElementById('wc-scene');
    const banner = document.getElementById('wc-banner');

    if (banner) banner.querySelector('span').innerText = 'Observe this grid carefully! (4 seconds)';

    if (scene) {
      scene.innerHTML = this.originalGrid.map((item, idx) => `
        <div class="scene-item">${item}</div>
      `).join('');
    }

    VoiceAssistant.speak("Study where each item is placed.");

    // After 4 seconds, introduce 1 change
    setTimeout(() => {
      this.isPhase1 = false;
      this.changedIndex = Math.floor(Math.random() * 9);
      this.oldItem = this.originalGrid[this.changedIndex];

      // Select a new item not currently in grid
      const remaining = this.itemsPool.filter(i => !this.originalGrid.includes(i));
      this.newItem = remaining[Math.floor(Math.random() * remaining.length)];

      // Apply change to grid
      const modifiedGrid = [...this.originalGrid];
      modifiedGrid[this.changedIndex] = this.newItem;

      if (banner) banner.querySelector('span').innerText = 'One item has changed! Tap the item that changed.';

      if (scene) {
        scene.innerHTML = modifiedGrid.map((item, idx) => `
          <div class="scene-item" onclick="WhatChangedGame.handleItemClick(${idx})">${item}</div>
        `).join('');
      }

      VoiceAssistant.speak("One item changed! Tap on the new item.");
    }, 4000);
  },

  handleItemClick(idx) {
    if (this.isPhase1) return;

    if (idx === this.changedIndex) {
      this.score += 60;
      this.roundsCompleted++;
      document.getElementById('wc-score').innerText = this.score;
      document.getElementById('wc-round').innerText = `${Math.min(3, this.roundsCompleted + 1)} / 3`;

      VoiceAssistant.speak("Sharp eye! You found what changed!");

      if (this.roundsCompleted >= this.maxRounds) {
        this.finishGame(100);
      } else {
        setTimeout(() => this.startRound(), 1200);
      }
    } else {
      VoiceAssistant.speak("Nice try! Keep practicing.");
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
    VoiceAssistant.speak("Congratulations! You completed all games for today!");

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback('game5', this.score, accuracy, timeTaken);
      }
    }, 800);
  }
};
