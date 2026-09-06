/**
 * NeuroNova Adaptive Difficulty & Data Engine
 * Manages metrics, baseline evaluation, game unlocks, and LocalStorage
 */

const STORAGE_KEY = 'neuro_nova_data_v1';

const DEFAULT_STATE = {
  patient: {
    name: 'Ravi',
    level: 1,
    streak: 5,
    todayGamesCompleted: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    gamesState: {
      game1: { id: 'game1', title: 'Memory Match', icon: '🃏', unlocked: true, completed: false },
      game2: { id: 'game2', title: 'Sequence Recall', icon: '🎨', unlocked: false, completed: false },
      game3: { id: 'game3', title: 'Picture Recall', icon: '🖼️', unlocked: false, completed: false },
      game4: { id: 'game4', title: 'Pattern Memory', icon: '🧩', unlocked: false, completed: false },
      game5: { id: 'game5', title: 'What Changed?', icon: '🔍', unlocked: false, completed: false }
    }
  },
  caregiver: {
    name: 'Sarah',
    baselineAccuracy: 65,
    baselineResponseTime: 4.5, // seconds
    language: 'en-US'
  },
  gameLogs: [
    { date: '2026-09-01', gameId: 'game1', gameName: 'Memory Match', score: 100, accuracy: 70, timeSeconds: 32, level: 1 },
    { date: '2026-09-02', gameId: 'game2', gameName: 'Sequence Recall', score: 120, accuracy: 75, timeSeconds: 28, level: 1 },
    { date: '2026-09-03', gameId: 'game1', gameName: 'Memory Match', score: 140, accuracy: 80, timeSeconds: 25, level: 1 },
    { date: '2026-09-04', gameId: 'game3', gameName: 'Picture Recall', score: 150, accuracy: 82, timeSeconds: 22, level: 1 },
    { date: '2026-09-05', gameId: 'game4', gameName: 'Pattern Memory', score: 160, accuracy: 88, timeSeconds: 20, level: 1 }
  ],
  reminders: [
    { id: 1, text: 'Take Morning Blood Pressure Medication 💊', time: '08:00 AM', active: true },
    { id: 2, text: 'Morning Walk with Daughter Fathima 🚶‍♀️', time: '10:30 AM', active: true },
    { id: 3, text: 'Afternoon Memory Game Session 🧠', time: '03:00 PM', active: true },
    { id: 4, text: 'Evening Tea & Family Call ☕', time: '06:00 PM', active: true }
  ],
  familyMemories: [
    { id: 1, name: 'Fathima', relation: 'Daughter', image: '👩‍⚕️', description: 'Your eldest daughter who visits every weekend.' },
    { id: 2, name: 'Arun', relation: 'Son', image: '👨‍💼', description: 'Your loving son who works as a software engineer.' },
    { id: 3, name: 'Amina', relation: 'Granddaughter', image: '👧', description: 'Your granddaughter who loves drawing flowers with you.' },
    { id: 4, name: 'Sunita', relation: 'Spouse', image: '👵', description: 'Your caring wife of 45 wonderful years.' }
  ]
};

const AdaptiveEngine = {
  state: null,

  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state, using default.', e);
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    } else {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.saveState();
    }

    this.checkDailyReset();
  },

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.patient.lastActiveDate !== today) {
      this.state.patient.lastActiveDate = today;
      this.state.patient.todayGamesCompleted = 0;
      
      // Reset sequential games for the new day
      const g = this.state.patient.gamesState;
      g.game1.unlocked = true;  g.game1.completed = false;
      g.game2.unlocked = false; g.game2.completed = false;
      g.game3.unlocked = false; g.game3.completed = false;
      g.game4.unlocked = false; g.game4.completed = false;
      g.game5.unlocked = false; g.game5.completed = false;
      
      this.saveState();
    }
  },

  getPatient() {
    return this.state.patient;
  },

  setPatientName(name) {
    if (name && name.trim()) {
      this.state.patient.name = name.trim();
      this.saveState();
    }
  },

  getCaregiver() {
    return this.state.caregiver;
  },

  setCaregiverName(name) {
    if (name && name.trim()) {
      this.state.caregiver.name = name.trim();
      this.saveState();
    }
  },

  getGamesState() {
    return this.state.patient.gamesState;
  },

  /**
   * Called when a game session completes.
   * Evaluates metrics, records logs, unlocks the next game sequentially,
   * and checks for adaptive difficulty level increase.
   */
  recordGameCompletion(gameId, score, accuracy, timeSeconds) {
    const today = new Date().toISOString().split('T')[0];
    const gameOrder = ['game1', 'game2', 'game3', 'game4', 'game5'];
    const currentIdx = gameOrder.indexOf(gameId);
    
    // Mark current game completed and locked
    const games = this.state.patient.gamesState;
    if (games[gameId]) {
      games[gameId].completed = true;
      games[gameId].unlocked = false;
    }

    // Unlock next game in sequence
    if (currentIdx !== -1 && currentIdx + 1 < gameOrder.length) {
      const nextGameId = gameOrder[currentIdx + 1];
      if (games[nextGameId]) {
        games[nextGameId].unlocked = true;
      }
    }

    this.state.patient.todayGamesCompleted += 1;

    // Save game log metric
    const gameName = games[gameId] ? games[gameId].title : gameId;
    const logEntry = {
      date: today,
      gameId,
      gameName,
      score,
      accuracy,
      timeSeconds,
      level: this.state.patient.level
    };

    this.state.gameLogs.push(logEntry);

    // Evaluate Adaptive Level Promotion (Accuracy > 80%)
    let promoted = false;
    if (accuracy >= 80 && this.state.patient.todayGamesCompleted >= 2) {
      if (this.state.patient.level < 5) {
        this.state.patient.level += 1;
        promoted = true;
      }
    }

    this.saveState();

    return {
      promoted,
      newLevel: this.state.patient.level,
      score,
      accuracy,
      timeSeconds
    };
  },

  // Calculate overall metrics for Caregiver Dashboard
  getCaregiverMetrics() {
    const logs = this.state.gameLogs;
    const gamesToday = this.state.patient.todayGamesCompleted;
    
    if (logs.length === 0) {
      return { gamesToday: 0, avgAccuracy: 0, streak: this.state.patient.streak, baselineDiff: 0 };
    }

    const totalAcc = logs.reduce((acc, item) => acc + item.accuracy, 0);
    const avgAccuracy = Math.round(totalAcc / logs.length);
    const baselineDiff = avgAccuracy - this.state.caregiver.baselineAccuracy;

    return {
      gamesToday,
      avgAccuracy,
      streak: this.state.patient.streak,
      baselineDiff: baselineDiff > 0 ? `+${baselineDiff}%` : `${baselineDiff}%`
    };
  },

  getReminders() {
    return this.state.reminders;
  },

  addReminder(text, time) {
    const newId = Date.now();
    this.state.reminders.push({ id: newId, text, time, active: true });
    this.saveState();
  },

  getFamilyMemories() {
    return this.state.familyMemories;
  },

  addFamilyMemory(name, relation, image, description) {
    const newId = Date.now();
    this.state.familyMemories.push({
      id: newId,
      name,
      relation,
      image: image || '👤',
      description: description || `Your loving ${relation}`
    });
    this.saveState();
  },

  resetDailyProgress() {
    this.state.patient.todayGamesCompleted = 0;
    const g = this.state.patient.gamesState;
    g.game1.unlocked = true;  g.game1.completed = false;
    g.game2.unlocked = false; g.game2.completed = false;
    g.game3.unlocked = false; g.game3.completed = false;
    g.game4.unlocked = false; g.game4.completed = false;
    g.game5.unlocked = false; g.game5.completed = false;
    this.saveState();
  }
};

AdaptiveEngine.init();
