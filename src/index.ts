// Main exports for the SistersConnect matching system

// Core service
export { MatchingService } from './services/matching-service';

// Algorithms
export { CompatibilityScorer } from './matching/algorithms/compatibility-scorer';
export { SocialGraphAlgorithm } from './matching/algorithms/social-graph';

// Filters
export { PreferenceFilter } from './matching/filters/preference-filter';

// Types
export * from './types/user';

// Utilities
export * from './utils/location';
export * from './utils/scoring';

import { MatchingService } from './services/matching-service';
import type { MatchingPreferences, UserProfile } from './types/user';

// Example usage and factory functions
export class SistersConnectMatching {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }

  /**
   * Initialize the matching system with default Islamic values
   */
  static create(): SistersConnectMatching {
    return new SistersConnectMatching();
  }

  /**
   * Get the main matching service
   */
  getMatchingService(): MatchingService {
    return this.matchingService;
  }

  /**
   * Create default matching preferences with Islamic values
   */
  static createDefaultPreferences(): MatchingPreferences {
    return {
      ageRange: { min: 18, max: 65 },
      maxDistance: 50, // 50km radius
      requiredLanguages: [],
      dealBreakers: {
        differentPracticeLevel: false,
        noHijab: false,
        differentFamilyStatus: false,
        tooFarDistance: true,
      },
      softPreferences: {
        similarInterests: 0.8,
        similarAge: 0.6,
        sameCity: 0.4,
        similarPracticeLevel: 0.9, // High weight for Islamic compatibility
        similarLifestyle: 0.7,
      },
      specialFeatures: {
        studyBuddy: true,
        mentorship: true,
        eventCompanion: true,
        professionalNetworking: false,
      },
    };
  }

  /**
   * Create a sample user profile for testing
   */
  static createSampleProfile(id: string, overrides: Partial<UserProfile> = {}): UserProfile {
    const defaultProfile: UserProfile = {
      personalInfo: {
        id,
        firstName: 'Sister',
        age: 25,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York',
          country: 'USA',
          timezone: 'America/New_York',
        },
        languages: ['English'],
        secondaryLanguages: ['Arabic'],
      },
      islamicProfile: {
        practiceLevel: 'intermediate',
        prayerFrequency: 'regularly',
        hijabWearing: true,
        mosqueAttendance: 'weekly',
        quranStudyInterest: true,
        islamicHistoryInterest: false,
        arabicLearningInterest: true,
        isNewMuslim: false,
      },
      interests: {
        hobbies: ['reading', 'cooking'],
        activities: ['hiking', 'volunteering'],
        islamicInterests: ['Quran study', 'Islamic history'],
        studyInterests: ['Arabic language', 'Islamic studies'],
        professionalInterests: ['technology', 'education'],
      },
      lifestyle: {
        workStatus: 'working',
        studyStatus: 'not_studying',
        familyStatus: 'single',
        hasChildren: false,
        availability: 'moderate',
        preferredMeetingTimes: ['evening', 'weekend'],
      },
      createdAt: new Date(),
      lastActive: new Date(),
      verified: true,
    };

    return { ...defaultProfile, ...overrides };
  }
}