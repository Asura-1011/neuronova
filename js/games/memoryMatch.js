/**
 * Game 1: Memory Match
 * Dementia Patient Cognitive Training
 * Level difficulty scaling via GameDifficultyService
 */

const MemoryMatchGame = {
  icons: ['🌸', '🍎', '🐱', '⭐', '🎈', '🌻', '🎁', '🍓', '🐶', '🚗', '👑', '🌈'],
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  targetPairs: 4,
  score: 0,
  moves: 0,
  startTime: null,
  onCompleteCallback: null,

  render(container, onComplete) {
    this.onCompleteCallback = onComplete;
    this.matchedPairs = 0;
    this.score = 0;
    this.moves = 0;
    this.flippedCards = [];
    this.startTime = Date.now();

    const patient = AdaptiveEngine.getPatient();
    const difficulty = GameDifficultyService.getDifficultyForGame('game1', patient.level);
    this.targetPairs = difficulty.pairsCount || 4;

    const activeIcons = this.icons.slice(0, this.targetPairs);
    const deck = [...activeIcons, ...activeIcons];
    deck.sort(() => Math.random() - 0.5);

    this.cards = deck.map((icon, idx) => ({
      id: idx,
      icon,
      flipped: false,
      matched: false
    }));

    VoiceAssistant.speak("Memory Match. Tap two cards to find matching pairs!", "game_start");

    container.innerHTML = `
      <div class="game-container">
        <div class="game-header-bar">
          <button class="back-btn" onclick="GameMenu.render(document.getElementById('app'))">← Exit</button>
          <div class="game-stat">
            <span class="game-stat-label">Level ${patient.level}</span>
            <span class="game-stat-value" id="mm-pairs">0 / ${this.targetPairs}</span>
          </div>
          <div class="game-stat">
            <span class="game-stat-label">Score</span>
            <span class="game-stat-value" id="mm-score">0</span>
          </div>
        </div>

        <div class="game-instruction-banner">
          <span>Find all ${this.targetPairs} matching pairs of items!</span>
          <button class="speak-btn" onclick="VoiceAssistant.speak('Find all matching pairs of items.')">🔊</button>
        </div>

        <div class="memory-grid" id="mm-grid" style="grid-template-columns: repeat(${this.targetPairs > 4 ? 4 : 4}, 1fr);">
          ${this.cards.map(c => `
            <div class="memory-card" id="card-${c.id}" onclick="MemoryMatchGame.handleCardClick(${c.id})">
              ❓
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  handleCardClick(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched || this.flippedCards.length >= 2) return;

    card.flipped = true;
    this.flippedCards.push(card);
    
    const cardEl = document.getElementById(`card-${card.id}`);
    if (cardEl) {
      cardEl.classList.add('flipped');
      cardEl.innerHTML = card.icon;
    }

    if (this.flippedCards.length === 2) {
      this.moves += 1;
      this.checkMatch();
    }
  },

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    
    if (card1.icon === card2.icon) {
      card1.matched = true;
      card2.matched = true;
      this.matchedPairs += 1;
      this.score += 50;

      VoiceAssistant.speak("Great match!", "general");

      const el1 = document.getElementById(`card-${card1.id}`);
      const el2 = document.getElementById(`card-${card2.id}`);
      if (el1) el1.classList.add('matched');
      if (el2) el2.classList.add('matched');

      document.getElementById('mm-pairs').innerText = `${this.matchedPairs} / ${this.targetPairs}`;
      document.getElementById('mm-score').innerText = this.score;

      this.flippedCards = [];

      if (this.matchedPairs === this.targetPairs) {
        this.finishGame();
      }
    } else {
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;

        const el1 = document.getElementById(`card-${card1.id}`);
        const el2 = document.getElementById(`card-${card2.id}`);
        if (el1) {
          el1.classList.remove('flipped');
          el1.innerHTML = '❓';
        }
        if (el2) {
          el2.classList.remove('flipped');
          el2.innerHTML = '❓';
        }

        this.flippedCards = [];
      }, 900);
    }
  },

  finishGame() {
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
    const accuracy = Math.max(50, Math.min(100, Math.round((this.targetPairs / this.moves) * 100)));

    VoiceAssistant.speak("Wonderful job! You completed Memory Match!", "success");

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback('game1', this.score, accuracy, timeTaken);
      }
    }, 600);
  }
};
