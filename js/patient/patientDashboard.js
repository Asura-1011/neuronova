/**
 * NeuroNova PatientDataService Layer (Parts 2, 3, 4, 7, 8, 9, 12)
 * Modular data service providing strict patient data isolation by unique patient ID.
 * Includes safe patient profile deletion via deletePatient(patientId).
 * 
 * PROTOTYPE PERSISTENCE NOTICE:
 * This service uses browser localStorage for prototype demonstration purposes.
 * It is structured as an async service abstraction so a production REST API / Backend
 * database (Node.js/Express, Cloud Firestore, PostgreSQL) can seamlessly replace localStorage
 * without modifying UI components.
 */

const PATIENTS_STORAGE_KEY = 'neuro_nova_patients_v4';
const ACTIVE_PATIENT_KEY = 'neuro_nova_active_patient_id_v4';

// Initial Sample Patients (Ravi and Shaik) with UNIQUE PATIENT IDs
const INITIAL_PATIENTS = {
  'patient_ravi_101': {
    patientId: 'patient_ravi_101', // UNIQUE PATIENT ID
    patientName: 'Ravi',
    age: 72,
    profileInformation: 'Loves gardening, memory activities, and classical music.',
    createdAt: '2026-09-01',
    currentLevel: 1,
    streak: 5,
    lastSessionDate: new Date().toISOString().split('T')[0],
    todayGamesCompleted: 0,
    baselineStatus: {
      isCompleted: false, // false during Days 1-3, true after Day 3
      currentDay: 1,      // 1, 2, or 3
      day1Completed: false,
      day2Completed: false,
      day3Completed: false,
      day1Date: null,
      day2Date: null,
      day3Date: null
    },
    baselineRecords: {
      day1: null,
      day2: null,
      day3: null
    },
    personalBaseline: {
      accuracy: null,
      score: null,
      responseTime: null,
      establishedDate: null
    },
    gamesState: {
      game1: { id: 'game1', title: 'Memory Match', icon: '🃏', unlocked: true, completed: false },
      game2: { id: 'game2', title: 'Sequence Recall', icon: '🎨', unlocked: false, completed: false },
      game3: { id: 'game3', title: 'Picture Recall', icon: '🖼️', unlocked: false, completed: false },
      game4: { id: 'game4', title: 'Pattern Memory', icon: '🧩', unlocked: false, completed: false },
      game5: { id: 'game5', title: 'What Changed?', icon: '🔍', unlocked: false, completed: false }
    },
    gameLogs: [
      { date: '2026-09-01', gameId: 'game1', gameName: 'Memory Match', score: 100, accuracy: 70, timeSeconds: 32, level: 1 }
    ],
    reminders: [
      { id: 1, text: 'Take Morning Blood Pressure Medication 💊', time: '08:00 AM', active: true },
      { id: 2, text: 'Morning Walk with Daughter Fathima 🚶‍♀️', time: '10:30 AM', active: true }
    ],
    familyMemories: [
      { id: 1, name: 'Fathima', relation: 'Daughter', image: '👩‍⚕️', description: 'Your eldest daughter who visits every weekend.' },
      { id: 2, name: 'Arun', relation: 'Son', image: '👨‍💼', description: 'Your loving son who works as a software engineer.' }
    ]
  },

  'patient_shaik_102': {
    patientId: 'patient_shaik_102', // UNIQUE PATIENT ID
    patientName: 'Shaik',
    age: 75,
    profileInformation: 'Enjoys chess, reading books, and morning tea.',
    createdAt: '2026-08-25',
    currentLevel: 1,
    streak: 3,
    lastSessionDate: new Date().toISOString().split('T')[0],
    todayGamesCompleted: 0,
    baselineStatus: {
      isCompleted: false,
      currentDay: 2,
      day1Completed: true,
      day2Completed: false,
      day3Completed: false,
      day1Date: '2026-09-05',
      day2Date: null,
      day3Date: null
    },
    baselineRecords: {
      day1: { accuracy: 75, score: 120, timeSeconds: 25 },
      day2: null,
      day3: null
    },
    personalBaseline: {
      accuracy: null,
      score: null,
      responseTime: null,
      establishedDate: null
    },
    gamesState: {
      game1: { id: 'game1', title: 'Memory Match', icon: '🃏', unlocked: true, completed: false },
      game2: { id: 'game2', title: 'Sequence Recall', icon: '🎨', unlocked: false, completed: false },
      game3: { id: 'game3', title: 'Picture Recall', icon: '🖼️', unlocked: false, completed: false },
      game4: { id: 'game4', title: 'Pattern Memory', icon: '🧩', unlocked: false, completed: false },
      game5: { id: 'game5', title: 'What Changed?', icon: '🔍', unlocked: false, completed: false }
    },
    gameLogs: [
      { date: '2026-09-05', gameId: 'game1', gameName: 'Memory Match', score: 120, accuracy: 75, timeSeconds: 25, level: 1 }
    ],
    reminders: [
      { id: 101, text: 'Take Evening Heart Medicine 💊', time: '07:00 PM', active: true }
    ],
    familyMemories: [
      { id: 201, name: 'Lakshmi', relation: 'Spouse', image: '👵', description: 'Your beloved wife.' }
    ]
  }
};

const PatientDataService = {
  patients: {},
  activePatientId: null,

  init() {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.patients = {};
        Object.values(parsed).forEach(p => {
          if (p && p.patientId) {
            this.patients[p.patientId] = p;
          }
        });
      } catch (e) {
        console.error('Failed to parse patient data from localStorage', e);
        this.patients = {};
      }
    }

    if (Object.keys(this.patients).length === 0) {
      this.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
      this.save();
    }

    const savedActiveId = localStorage.getItem(ACTIVE_PATIENT_KEY);
    if (savedActiveId && this.patients[savedActiveId]) {
      this.activePatientId = savedActiveId;
    } else {
      const ids = Object.keys(this.patients);
      this.activePatientId = ids.length > 0 ? ids[0] : null;
      if (this.activePatientId) {
        localStorage.setItem(ACTIVE_PATIENT_KEY, this.activePatientId);
      }
    }
  },

  save() {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(this.patients));
    if (this.activePatientId) {
      localStorage.setItem(ACTIVE_PATIENT_KEY, this.activePatientId);
    } else {
      localStorage.removeItem(ACTIVE_PATIENT_KEY);
    }
  },

  async getAllPatients() {
    const patientMap = new Map();
    Object.values(this.patients).forEach(p => {
      if (p && p.patientId && !patientMap.has(p.patientId)) {
        patientMap.set(p.patientId, p);
      }
    });
    return Array.from(patientMap.values());
  },

  async getActivePatient() {
    if (!this.activePatientId || !this.patients[this.activePatientId]) {
      const ids = Object.keys(this.patients);
      if (ids.length > 0) {
        this.activePatientId = ids[0];
        this.save();
      } else {
        return null;
      }
    }
    return this.patients[this.activePatientId];
  },

  async setActivePatient(patientId) {
    if (!this.patients[patientId]) {
      throw new Error(`Patient ID "${patientId}" not found.`);
    }

    this.save();

    this.activePatientId = patientId;
    this.save();
    return this.patients[patientId];
  },

  async createPatient(name, age = null, profileInfo = '') {
    const uniqueId = `patient_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const newPatient = {
      patientId: uniqueId,
      patientName: name.trim() || 'New Patient',
      age: age ? parseInt(age, 10) : null,
      profileInformation: profileInfo.trim() || 'No additional information.',
      createdAt: new Date().toISOString().split('T')[0],
      currentLevel: 1,
      streak: 1,
      lastSessionDate: new Date().toISOString().split('T')[0],
      todayGamesCompleted: 0,
      baselineStatus: {
        isCompleted: false,
        currentDay: 1,
        day1Completed: false,
        day2Completed: false,
        day3Completed: false,
        day1Date: null,
        day2Date: null,
        day3Date: null
      },
      baselineRecords: {
        day1: null,
        day2: null,
        day3: null
      },
      personalBaseline: {
        accuracy: null,
        score: null,
        responseTime: null,
        establishedDate: null
      },
      gamesState: {
        game1: { id: 'game1', title: 'Memory Match', icon: '🃏', unlocked: true, completed: false },
        game2: { id: 'game2', title: 'Sequence Recall', icon: '🎨', unlocked: false, completed: false },
        game3: { id: 'game3', title: 'Picture Recall', icon: '🖼️', unlocked: false, completed: false },
        game4: { id: 'game4', title: 'Pattern Memory', icon: '🧩', unlocked: false, completed: false },
        game5: { id: 'game5', title: 'What Changed?', icon: '🔍', unlocked: false, completed: false }
      },
      gameLogs: [],
      reminders: [
        { id: 1, text: 'Morning Memory Training Session 🧠', time: '09:30 AM', active: true }
      ],
      familyMemories: [
        { id: 1, name: 'Family', relation: 'Relative', image: '👨‍👩‍👧', description: 'Your loving family.' }
      ]
    };

    this.patients[uniqueId] = newPatient;
    this.activePatientId = uniqueId;
    this.save();
    return newPatient;
  },

  async updateActivePatient(updates) {
    if (!this.activePatientId || !this.patients[this.activePatientId]) return null;
    this.patients[this.activePatientId] = {
      ...this.patients[this.activePatientId],
      ...updates
    };
    this.save();
    return this.patients[this.activePatientId];
  },

  /**
   * Permanently deletes a patient profile and all associated data by unique patientId.
   */
  async deletePatient(patientId) {
    if (!patientId || !this.patients[patientId]) {
      return { success: false, message: 'Patient profile not found.' };
    }

    const patientName = this.patients[patientId].patientName;

    // Delete patient entry using unique patientId
    delete this.patients[patientId];

    // If deleted patient was active, select another remaining patient or clear active ID
    if (this.activePatientId === patientId) {
      const remainingIds = Object.keys(this.patients);
      if (remainingIds.length > 0) {
        this.activePatientId = remainingIds[0];
      } else {
        this.activePatientId = null;
        localStorage.removeItem(ACTIVE_PATIENT_KEY);
      }
    }

    this.save();

    return {
      success: true,
      patientId,
      patientName,
      remainingCount: Object.keys(this.patients).length
    };
  }
};

PatientDataService.init();
