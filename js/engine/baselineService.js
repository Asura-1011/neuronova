/**
 * NeuroNova BaselineService (Part 6 & Part 7)
 * Manages the 3-Day Personal Baseline Assessment & Demo Mode Simulation
 */

const BaselineService = {
  isDemoMode: false,

  setDemoMode(enabled) {
    this.isDemoMode = !!enabled;
  },

  /**
   * Evaluates baseline status after a daily session completes
   */
  async processSessionForBaseline(patient, sessionSummary) {
    const today = new Date().toISOString().split('T')[0];
    const status = patient.baselineStatus;

    if (status.isCompleted) {
      return { baselineComplete: true, statusMessage: 'Personal baseline already established.' };
    }

    // Check if session is on a new day (or if Demo Mode is enabled)
    let currentDay = status.currentDay || 1;

    if (currentDay === 1 && !status.day1Completed) {
      status.day1Completed = true;
      status.day1Date = today;
      patient.baselineRecords.day1 = sessionSummary;
      status.currentDay = 2;

      await PatientDataService.updateActivePatient({ baselineStatus: status, baselineRecords: patient.baselineRecords });
      return {
        baselineComplete: false,
        dayCompleted: 1,
        message: 'Day 1 of 3 Assessment Complete! Keep up the great work!'
      };
    } 
    else if (currentDay === 2 && !status.day2Completed) {
      if (status.day1Date === today && !this.isDemoMode) {
        return { baselineComplete: false, message: 'Day 1 already logged today. Come back tomorrow for Day 2!' };
      }
      status.day2Completed = true;
      status.day2Date = today;
      patient.baselineRecords.day2 = sessionSummary;
      status.currentDay = 3;

      await PatientDataService.updateActivePatient({ baselineStatus: status, baselineRecords: patient.baselineRecords });
      return {
        baselineComplete: false,
        dayCompleted: 2,
        message: 'Day 2 of 3 Assessment Complete! One more day to establish your baseline!'
      };
    } 
    else if (currentDay === 3 && !status.day3Completed) {
      if (status.day2Date === today && !this.isDemoMode) {
        return { baselineComplete: false, message: 'Day 2 already logged today. Come back tomorrow for Day 3!' };
      }
      status.day3Completed = true;
      status.day3Date = today;
      patient.baselineRecords.day3 = sessionSummary;
      status.isCompleted = true;

      // Calculate PERSONAL BASELINE across all 3 days
      const r1 = patient.baselineRecords.day1;
      const r2 = patient.baselineRecords.day2;
      const r3 = sessionSummary;

      const avgAccuracy = Math.round((r1.accuracy + r2.accuracy + r3.accuracy) / 3);
      const avgScore = Math.round((r1.score + r2.score + r3.score) / 3);
      const avgTime = Math.round((r1.timeSeconds + r2.timeSeconds + r3.timeSeconds) / 3);

      patient.personalBaseline = {
        accuracy: avgAccuracy,
        score: avgScore,
        responseTime: avgTime,
        establishedDate: today
      };

      await PatientDataService.updateActivePatient({
        baselineStatus: status,
        baselineRecords: patient.baselineRecords,
        personalBaseline: patient.personalBaseline
      });

      return {
        baselineJustFinished: true,
        baselineComplete: true,
        personalBaseline: patient.personalBaseline,
        message: 'Your initial 3-day assessment is complete! Your personal baseline has now been established.'
      };
    }

    return { baselineComplete: status.isCompleted, message: 'Baseline assessment in progress.' };
  },

  getBaselineStatusText(patient) {
    if (!patient || !patient.baselineStatus) return 'Assessment pending';
    const s = patient.baselineStatus;
    if (s.isCompleted) return 'Personal Baseline Established ✅';
    return `Baseline Assessment: Day ${s.currentDay || 1} of 3`;
  }
};
