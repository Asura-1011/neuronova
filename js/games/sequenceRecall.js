/**
 * Game 2: Sequence Recall (Simon Says Style)
 * Level difficulty scaling via GameDifficultyService
 */

const SequenceRecallGame = {
  colors: ['red', 'blue', 'green', 'yellow'],
  sequence: [],
  userStep: 0,
  score: 0,
  roundsCompleted: 0,
  maxRounds: 3,
  flashSpeedMs: 900,
  isPlayingSequence: false,
  startTime: null,
  onCompleteCallback: null,

  render(container, onComplete) {
    this.onCompleteCallback = onComplete;
    this.sequence = [];
    this.userStep = 0;
    this.score = 0;
    this.roundsCompleted = 0;
    this.startTime = Date.now();

    const patient = AdaptiveEngine.getPatient();
    const diff = GameDifficultyService.getDifficultyForGame('game2', patient.level);
    this.maxRounds = diff.maxRounds || 3;
    this.flashSpeedMs = diff.flashSpeedMs || 900;

    VoiceAssistant.speak("Sequence Recall. Watch the colored pads light up, then repeat the sequence!", "game_start");

    container.innerHTML = `
      <div class="game-container">
        <div class="game-header-bar">
          <button class="back-btn" onclick="GameMenu.render(document.getElementById('app'))">← Exit</button>
          <div class="game-stat">
            <span class="game-stat-label">Round</span>
            <span class="game-stat-value" id="seq-round">1 / ${this.maxRounds}</span>
          </div>
          <div class="game-stat">
            <span class="game-stat-label">Score</span>
            <span class="game-stat-value" id="seq-score">0</span>
          </div>
        </div>

        <div class="game-instruction-banner" id="seq-banner">
          <span>Watch the sequence carefully...</span>
          <button class="speak-btn" onclick="VoiceAssistant.speak('Watch the sequence carefully, then tap the same order.')">🔊</button>
        </div>

        <div class="sequence-pad-grid">
          <div class="seq-pad seq-red" id="pad-red" onclick="SequenceRecallGame.handlePadClick('red')">🔴</div>
          <div class="seq-pad seq-blue" id="pad-blue" onclick="SequenceRecallGame.handlePadClick('blue')">🔵</div>
          <div class="seq-pad seq-green" id="pad-green" onclick="SequenceRecallGame.handlePadClick('green')">🟢</div>
          <div class="seq-pad seq-yellow" id="pad-yellow" onclick="SequenceRecallGame.handlePadClick('yellow')">🟡</div>
        </div>
      </div>
    `;

    setTimeout(() => this.startNextRound(), 1000);
  },

  startNextRound() {
    this.userStep = 0;
    const nextColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.sequence.push(nextColor);

    const banner = document.getElementById('seq-banner');
    if (banner) banner.querySelector('span').innerText = 'Watch the sequence...';

    this.playSequence();
  },

  playSequence() {
    this.isPlayingSequence = true;
    let i = 0;

    const interval = setInterval(() => {
      if (i >= this.sequence.length) {
        clearInterval(interval);
        this.isPlayingSequence = false;
        const banner = document.getElementById('seq-banner');
        if (banner) banner.querySelector('span').innerText = 'Now repeat the sequence! Tap the pads.';
        VoiceAssistant.speak("Your turn! Repeat the pattern.");
        return;
      }

      this.flashPad(this.sequence[i]);
      i++;
    }, this.flashSpeedMs);
  },

  flashPad(color) {
    const pad = document.getElementById(`pad-${color}`);
    if (pad) {
      pad.classList.add('active');
      setTimeout(() => {
        pad.classList.remove('active');
      }, Math.round(this.flashSpeedMs * 0.6));
    }
  },

  handlePadClick(color) {
    if (this.isPlayingSequence) return;

    this.flashPad(color);

    if (color === this.sequence[this.userStep]) {
      this.userStep++;

      if (this.userStep === this.sequence.length) {
        this.roundsCompleted++;
        this.score += 60;
        document.getElementById('seq-score').innerText = this.score;
        document.getElementById('seq-round').innerText = `${Math.min(this.maxRounds, this.roundsCompleted + 1)} / ${this.maxRounds}`;

        if (this.roundsCompleted >= this.maxRounds) {
          this.finishGame(100);
        } else {
          VoiceAssistant.speak("Correct! Get ready for the next round.");
          setTimeout(() => this.startNextRound(), 1200);
        }
      }
    } else {
      VoiceAssistant.speak("Oops! That was not the right color. Good try!", "mistake");
      this.finishGame(70);
    }
  },

  finishGame(accuracy) {
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
    VoiceAssistant.speak("Great job on Sequence Recall!", "success");

    setTimeout(() => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback('game2', this.score, accuracy, timeTaken);
      }
    }, 800);
  }
};
