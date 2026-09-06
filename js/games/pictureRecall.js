/**
 * Game 3: Picture Recall
 * Dementia Patient Cognitive Training
 */

const PictureRecallGame = {
  allPictures: ['🍎', '🐶', '🚗', '🌻', '🏠', '📱', '✈️', '🎸', '👑', '🌈'],
  targetPictures: [],
  options: [],
  score: 0,
  roundsCompleted: 0,
  maxRounds: 3,
  startTime: null,
  onCompleteCallback: null,

  render(container, onComplete) {
    this.onCompleteCallback = onComplete;
    this.score = 0;
    this.roundsCompleted = 0;
    this.startTime = Date.now();

    VoiceAssistant.speak("Picture Recall. Memorize the pictures shown on screen, then identify which picture you saw!");

    container.innerHTML = `
      <div class="game-container">
        <div class="game-header-bar">
          <button class="back-btn" onclick="GameMenu.render(document.getElementById('app'))">← Exit</button>
          <div class="game-stat">
            <span class="game-stat-label">Round</span>
            <span class="game-stat-value" id="pic-round">1 / 3</span>
          </div>
          <div class="game-stat">
            <span class="game-stat-label">Score</span>
            <span class="game-stat-value" id="pic-score">0</span>
          </div>
        </div>

        <div class="game-instruction-banner" id="pic-banner">
          <span>Memorize these pictures! (5 seconds)</span>
          <button class="speak-btn" onclick="VoiceAssistant.speak('Memorize these pictures quickly.')">🔊</button>
        </div>

        <div class="picture-display-area" id="pic-display">
          <!-- Pictures shown here -->
        </div>

        <div class="picture-choice-grid hidden" id="pic-choices">
          <!-- Choice options rendered here -->
        </div>
      </div>
    `;

    this.startRound();
  },

  startRound() {
    // Pick 3 random target pictures
    const shuffled = [...this.allPictures].sort(() => Math.random() - 0.5);
    this.targetPictures = shuffled.slice(0, 3);

    const displayArea = document.getElementById('pic-display');
    const choiceGrid = document.getElementById('pic-choices');
    const banner = document.getElementById('pic-banner');

    if (choiceGrid) choiceGrid.classList.add('hidden');
    if (banner) banner.querySelector('span').innerText = 'Memorize these 3 pictures! (5 seconds)';

    if (displayArea) {
      displayArea.innerHTML = this.targetPictures.map(pic => `
        <div class="picture-card-item">${pic}</div>
      `).join('');
    }

    VoiceAssistant.speak("Look closely and memorize these items.");

    // Hide pictures after 5 seconds
    setTimeout(() => {
      if (displayArea) displayArea.innerHTML = '<div style="font-size:3rem; padding:20px;">❓ ❓ ❓</div>';
      if (banner) banner.querySelector('span').innerText = 'Which of these pictures was shown above?';
      
      this.showChoices();
    }, 5000);
  },

  showChoices() {
    const choiceGrid = document.getElementById('pic-choices');
    if (!choiceGrid) return;

    // Pick 1 correct picture from targets and 2 distractor pictures
    const correctPic = this.targetPictures[Math.floor(Math.random() * this.targetPictures.length)];
    const distractors = this.allPictures.filter(p => !this.targetPictures.includes(p)).sort(() => Math.random() - 0.5).slice(0, 2);
    
    this.options = [correctPic, ...distractors].sort(() => Math.random() - 0.5);

    choiceGrid.classList.remove('hidden');
    choiceGrid.innerHTML = this.options.map(opt => `
      <button class="choice-btn" onclick="PictureRecallGame.handleChoice('${opt}', '${correctPic}')">${opt}</button>
    `).join('');

    VoiceAssistant.speak("Tap the picture that you saw earlier.");
  },

  handleChoice(selected, correct) {
    if (selected === correct) {
      this.score += 50;
      this.roundsCompleted++;
      document.getElementById('pic-score').innerText = this.score;
      document.getElementById('pic-round').innerText = `${Math.min(3, this.roundsCompleted + 1)} / 3`;

      VoiceAssistant.speak("Correct! Outstanding memory!");

      if (this.roundsCompleted >= this.maxRounds) {
        this.finishGame(100);
      } else {
        setTimeout(() => this.startRound(), 1200);
      }
    } else {
      VoiceAssistant.speak("Not quite! Good try.");
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
    VoiceAssistant.speak("Picture Recall session finished!");

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback('game3', this.score, accuracy, timeTaken);
      }
    }, 800);
  }
};
