/**
 * NeuroNova LevelService (Part 8, Part 9, Part 10)
 * Evaluates patient performance at the END OF DAILY SESSION against Personal Baseline.
 * Manages level promotions (Level +1) or non-punitive encouraging feedback.
 */

const LevelService = {
  /**
   * Evaluates the completed daily session against the patient's personal baseline.
   */
  async evaluateDailySession(patient, dailySessionSummary) {
    // If patient is still in 3-day baseline phase, level remains Level 1
    if (!patient.baselineStatus || !patient.baselineStatus.isCompleted) {
      return {
        promoted: false,
        inBaselinePhase: true,
        currentLevel: patient.currentLevel || 1,
        message: 'Great practice session during baseline assessment!'
      };
    }

    const baseline = patient.personalBaseline;
    if (!baseline || baseline.accuracy === null) {
      return { promoted: false, currentLevel: patient.currentLevel || 1 };
    }

    // Daily evaluation metric (Daily Accuracy % and Daily Score vs Personal Baseline)
    const improved = (dailySessionSummary.accuracy > baseline.accuracy) || 
                     (dailySessionSummary.score > baseline.score);

    if (improved) {
      const oldLevel = patient.currentLevel || 1;
      const newLevel = Math.min(5, oldLevel + 1); // Increase level by ONE (max Level 5)

      patient.currentLevel = newLevel;
      await PatientDataService.updateActivePatient({ currentLevel: newLevel });

      return {
        promoted: true,
        oldLevel,
        newLevel,
        dailyAccuracy: dailySessionSummary.accuracy,
        baselineAccuracy: baseline.accuracy,
        title: '🎉 Congratulations!',
        message: `You have improved your performance! You successfully completed Level ${oldLevel}. Welcome to Level ${newLevel}! Let's continue to the next challenge.`
      };
    } else {
      // Patient did NOT exceed baseline: DO NOT decrease level or punish!
      return {
        promoted: false,
        currentLevel: patient.currentLevel || 1,
        dailyAccuracy: dailySessionSummary.accuracy,
        baselineAccuracy: baseline.accuracy,
        title: '🌟 Outstanding Effort!',
        message: "Good job! Keep practicing. Every step helps you improve. Let's try again tomorrow!"
      };
    }
  }
};
