/**
 * NeuroNova CaregiverAuthService Layer (Part 4 & Part 19)
 * Centralized Caregiver Authentication Service.
 * Protects Caregiver Dashboard from accidental elderly patient access.
 * Abstracted so real backend API / JWT authentication can replace it later.
 */

const CAREGIVER_AUTH_KEY = 'neuro_nova_caregiver_auth_v1';

const CaregiverAuthService = {
  authenticated: false,
  config: {
    pin: '1234', // Default PIN for demonstration
    caregiverName: 'Sarah',
    lastLogin: null
  },

  init() {
    const saved = localStorage.getItem(CAREGIVER_AUTH_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      } catch (e) {
        console.error('Failed to parse caregiver auth config', e);
      }
    }
  },

  save() {
    localStorage.setItem(CAREGIVER_AUTH_KEY, JSON.stringify(this.config));
  },

  isAuthenticated() {
    return this.authenticated;
  },

  async login(pinInput) {
    if (!pinInput || pinInput.trim() !== this.config.pin) {
      return { success: false, message: 'Incorrect PIN. Please try again.' };
    }
    
    this.authenticated = true;
    this.config.lastLogin = new Date().toISOString();
    this.save();
    return { success: true, message: 'Authentication successful.' };
  },

  logout() {
    this.authenticated = false;
  },

  getCaregiverName() {
    return this.config.caregiverName || 'Sarah';
  },

  setCaregiverName(name) {
    if (name && name.trim()) {
      this.config.caregiverName = name.trim();
      this.save();
    }
  },

  updatePin(oldPin, newPin) {
    if (oldPin !== this.config.pin) {
      return { success: false, message: 'Current PIN is incorrect.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'New PIN must be at least 4 digits.' };
    }
    this.config.pin = newPin;
    this.save();
    return { success: true, message: 'PIN updated successfully!' };
  }
};

CaregiverAuthService.init();
