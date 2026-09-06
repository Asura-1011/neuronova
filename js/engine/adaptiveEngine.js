/**
 * NeuroNova Adaptive Difficulty & Data Engine
 * Integrates PatientDataService, BaselineService, LevelService, and GameDifficultyService.
 * Enforces strict data isolation by operating exclusively on the active patient object.
 */

const AdaptiveEngine = {
  async init() {
    this.checkDailyReset();
  },

  async checkDailyReset() {
    const activePatient = await PatientDataService.getActivePatient();
    if (!activePatient) return;
    return this.checkDailyResetForPatient(activePatient.patientId);
  },

  /**
   * Per-patient daily calendar date reset check
   */
  async checkDailyResetForPatient(patientId) {
    const patient = PatientDataService.patients[patientId];
    if (!patient) return null;

    const today = new Date().toISOString().split('T')[0];
    if (patient.lastSessionDate !== today) {
      patient.lastSessionDate = today;
      patient.todayGamesCompleted = 0;

      const g = patient.gamesState;
      if (g) {
        g.game1.unlocked = true;  g.game1.completed = false;
        g.game2.unlocked = false; g.game2.completed = false;
        g.game3.unlocked = false; g.game3.completed = false;
        g.game4.unlocked = false; g.game4.completed = false;
        g.game5.unlocked = false; g.game5.completed = false;
      }

      PatientDataService.save();
    }
    return patient;
  },

  getPatient() {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    if (!p) return { name: 'Patient', level: 1, todayGamesCompleted: 0 };
    return {
      id: p.patientId,
      name: p.patientName,
      age: p.age,
      level: p.currentLevel || 1,
      todayGamesCompleted: p.todayGamesCompleted || 0,
      baselineStatus: p.baselineStatus,
      personalBaseline: p.personalBaseline,
      gamesState: p.gamesState
    };
  },

  async setPatientName(name) {
    if (name && name.trim()) {
      await PatientDataService.updateActivePatient({ patientName: name.trim() });
    }
  },

  getCaregiver() {
    return {
      name: CaregiverAuthService.getCaregiverName(),
      baselineAccuracy: 65,
      language: VoiceService.settings.language
    };
  },

  getGamesState() {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    return p ? p.gamesState : {};
  },

  /**
   * Records completed game session exclusively into the active patient's dataset.
   */
  async recordGameCompletion(gameId, score, accuracy, timeSeconds) {
    const activePatient = await PatientDataService.getActivePatient();
    const today = new Date().toISOString().split('T')[0];
    const gameOrder = ['game1', 'game2', 'game3', 'game4', 'game5'];
    const currentIdx = gameOrder.indexOf(gameId);
    
    const games = activePatient.gamesState;
    if (games[gameId]) {
      games[gameId].completed = true;
      games[gameId].unlocked = false;
    }

    if (currentIdx !== -1 && currentIdx + 1 < gameOrder.length) {
      const nextGameId = gameOrder[currentIdx + 1];
      if (games[nextGameId]) {
        games[nextGameId].unlocked = true;
      }
    }

    activePatient.todayGamesCompleted = (activePatient.todayGamesCompleted || 0) + 1;

    const gameName = games[gameId] ? games[gameId].title : gameId;
    const logEntry = {
      date: today,
      gameId,
      gameName,
      score,
      accuracy,
      timeSeconds,
      level: activePatient.currentLevel || 1
    };

    if (!activePatient.gameLogs) activePatient.gameLogs = [];
    activePatient.gameLogs.push(logEntry);

    await PatientDataService.updateActivePatient({
      todayGamesCompleted: activePatient.todayGamesCompleted,
      gamesState: games,
      gameLogs: activePatient.gameLogs
    });

    let baselineResult = null;
    let levelResult = null;

    // Check if entire daily session (or 3+ games) completed
    if (activePatient.todayGamesCompleted >= 3 || gameId === 'game5') {
      const sessionSummary = {
        date: today,
        score,
        accuracy,
        timeSeconds,
        gamesCompleted: activePatient.todayGamesCompleted
      };

      // 1. Process 3-Day Personal Baseline Assessment for active patient
      baselineResult = await BaselineService.processSessionForBaseline(activePatient, sessionSummary);

      // 2. Evaluate End-of-Day Leveling against active patient's Personal Baseline
      if (activePatient.baselineStatus && activePatient.baselineStatus.isCompleted) {
        levelResult = await LevelService.evaluateDailySession(activePatient, sessionSummary);
      }
    }

    return {
      gameCompleted: true,
      baselineResult,
      levelResult,
      currentLevel: activePatient.currentLevel || 1,
      score,
      accuracy,
      timeSeconds
    };
  },

  getCaregiverMetrics() {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    if (!p) return { gamesToday: 0, avgAccuracy: 0, streak: 1, baselineDiff: '0%' };

    const logs = p.gameLogs || [];
    const gamesToday = p.todayGamesCompleted || 0;
    
    if (logs.length === 0) {
      return { gamesToday, avgAccuracy: 0, streak: p.streak || 1, baselineDiff: '0%' };
    }

    const totalAcc = logs.reduce((acc, item) => acc + item.accuracy, 0);
    const avgAccuracy = Math.round(totalAcc / logs.length);
    const targetBaseline = p.personalBaseline && p.personalBaseline.accuracy ? p.personalBaseline.accuracy : 65;
    const baselineDiff = avgAccuracy - targetBaseline;

    return {
      gamesToday,
      avgAccuracy,
      streak: p.streak || 1,
      baselineDiff: baselineDiff >= 0 ? `+${baselineDiff}%` : `${baselineDiff}%`
    };
  },

  getReminders() {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    return p ? (p.reminders || []) : [];
  },

  async addReminder(text, time) {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    if (!p) return;
    if (!p.reminders) p.reminders = [];

    const newId = Date.now();
    p.reminders.push({ id: newId, text, time, active: true });
    await PatientDataService.updateActivePatient({ reminders: p.reminders });
  },

  getFamilyMemories() {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    return p ? (p.familyMemories || []) : [];
  },

  async addFamilyMemory(name, relation, image, description) {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    if (!p) return;
    if (!p.familyMemories) p.familyMemories = [];

    const newId = Date.now();
    p.familyMemories.push({
      id: newId,
      name,
      relation,
      image: image || '👤',
      description: description || `Your loving ${relation}`
    });
    await PatientDataService.updateActivePatient({ familyMemories: p.familyMemories });
  },

  async resetDailyProgress() {
    const p = PatientDataService.patients[PatientDataService.activePatientId];
    if (!p) return;
    p.todayGamesCompleted = 0;
    const g = p.gamesState;
    if (g) {
      g.game1.unlocked = true;  g.game1.completed = false;
      g.game2.unlocked = false; g.game2.completed = false;
      g.game3.unlocked = false; g.game3.completed = false;
      g.game4.unlocked = false; g.game4.completed = false;
      g.game5.unlocked = false; g.game5.completed = false;
    }
    await PatientDataService.updateActivePatient({ todayGamesCompleted: 0, gamesState: g });
  }
};

AdaptiveEngine.init();
