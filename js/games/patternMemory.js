/**
 * Game 4: Pattern Memory
 * Dementia Patient Cognitive Training
 */

const PatternMemoryGame = {
  patternTiles: [],
  userSelected: [],
  score: 0,
  roundsCompleted: 0,
  maxRounds: 3,
  startTime: null,
  isShowingPattern: false,
  onCompleteCallback: null,

  render(container, onComplete) {
    this.onCompleteCallback = onComplete;
    this.score = 0;
    this.roundsCompleted = 0;
    this.startTime = Date.now();

    VoiceAssistant.speak("Pattern Memory. Memorize which tiles light up on the grid, then select them!");

    container.innerHTML = `
      <div class="game-container">
        <div class="game-header-bar">
          <button class="back-btn" onclick="GameMenu.render(document.getElementById('app'))">← Exit</button>
          <div class="game-stat">
            <span class="game-stat-label">Round</span>
            <span class="game-stat-value" id="pat-round">1 / 3</span>
          </div>
          <div class="game-stat">
            <span class="game-stat-label">Score</span>
            <span class="game-stat-value" id="pat-score">0</span>
          </div>
        </div>

        <div class="game-instruction-banner" id="pat-banner">
          <span>Memorize the highlighted grid pattern...</span>
          <button class="speak-btn" onclick="VoiceAssistant.speak('Memorize which grid squares light up.')">🔊</button>
        </div>

        <div class="pattern-grid">
          ${[0,1,2,3,4,5,6,7,8].map(i => `
            <div class="pattern-tile" id="tile-${i}" onclick="PatternMemoryGame.handleTileClick(${i})"></div>
          `).join('')}
        </div>
      </div>
    `;

    this.startRound();
  },

  startRound() {
    this.userSelected = [];
    this.isShowingPattern = true;

    // Clear grid UI
    for (let i = 0; i < 9; i++) {
      const tile = document.getElementById(`tile-${i}`);
      if (tile) tile.className = 'pattern-tile';
    }

    // Select 3 random tiles out of 9
    const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    this.patternTiles = tiles.slice(0, 3);

    const banner = document.getElementById('pat-banner');
    if (banner) banner.querySelector('span').innerText = 'Watch carefully! Memorize the glowing tiles.';

    // Highlight tiles for 3 seconds
    this.patternTiles.forEach(idx => {
      const tile = document.getElementById(`tile-${idx}`);
      if (tile) tile.classList.add('highlighted');
    });

    VoiceAssistant.speak("Remember the location of these glowing tiles.");

    setTimeout(() => {
      // Hide highlight
      this.patternTiles.forEach(idx => {
        const tile = document.getElementById(`tile-${idx}`);
        if (tile) tile.classList.remove('highlighted');
      });

      this.isShowingPattern = false;
      if (banner) banner.querySelector('span').innerText = 'Now tap the 3 tiles that were glowing!';
      VoiceAssistant.speak("Now tap the 3 tiles that were highlighted.");
    }, 3000);
  },

  handleTileClick(idx) {
    if (this.isShowingPattern || this.userSelected.includes(idx)) return;

    this.userSelected.push(idx);
    const tile = document.getElementById(`tile-${idx}`);
    if (tile) tile.classList.add('selected');

    if (this.userSelected.length === 3) {
      // Check pattern match
      const isCorrect = this.patternTiles.every(t => this.userSelected.includes(t));

      if (isCorrect) {
        this.score += 60;
        this.roundsCompleted++;
        document.getElementById('pat-score').innerText = this.score;
        document.getElementById('pat-round').innerText = `${Math.min(3, this.roundsCompleted + 1)} / 3`;

        VoiceAssistant.speak("Perfect memory! Pattern matched!");

        if (this.roundsCompleted >= this.maxRounds) {
          this.finishGame(100);
        } else {
          setTimeout(() => this.startRound(), 1200);
        }
      } else {
        VoiceAssistant.speak("Good effort! Let's try the next pattern.");
        this.roundsCompleted++;
        if (this.roundsCompleted >= this.maxRounds) {
          this.finishGame(70);
        } else {
          setTimeout(() => this.startRound(), 1200);
        }
      }
    }
  },

  finishGame(accuracy) {
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
    VoiceAssistant.speak("Pattern Memory game complete!");

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback('game4', this.score, accuracy, timeTaken);
      }
    }, 800);
  }
};
