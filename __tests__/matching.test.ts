import { CompatibilityScorer } from '../src/matching/algorithms/compatibility-scorer';
import { SistersConnectMatching } from '../src/index';
import type { UserProfile, MatchingPreferences } from '../src/types/user';

describe('CompatibilityScorer', () => {
  let scorer: CompatibilityScorer;
  let user1: UserProfile;
  let user2: UserProfile;
  let preferences: MatchingPreferences;

  beforeEach(() => {
    scorer = new CompatibilityScorer();
    
    user1 = SistersConnectMatching.createSampleProfile('user1', {
      personalInfo: {
        id: 'user1',
        firstName: 'Aisha',
        age: 25,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York',
          country: 'USA',
          timezone: 'America/New_York',
        },
        languages: ['English', 'Arabic'],
      },
      interests: {
        hobbies: ['reading', 'cooking'],
        activities: ['volunteering'],
        islamicInterests: ['Quran study', 'Islamic history'],
        studyInterests: ['Arabic language'],
        professionalInterests: ['technology'],
      },
    });

    user2 = SistersConnectMatching.createSampleProfile('user2', {
      personalInfo: {
        id: 'user2',
        firstName: 'Fatima',
        age: 27,
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          city: 'New York',
          country: 'USA',
          timezone: 'America/New_York',
        },
        languages: ['English', 'Arabic'],
      },
      interests: {
        hobbies: ['reading', 'painting'],
        activities: ['hiking', 'volunteering'],
        islamicInterests: ['Quran study'],
        studyInterests: ['Arabic language'],
        professionalInterests: ['design'],
      },
    });

    preferences = SistersConnectMatching.createDefaultPreferences();
  });

  test('should calculate compatibility score correctly', () => {
    const score = scorer.calculateCompatibility(user1, user2, preferences, 0);
    
    expect(score).toBeDefined();
    expect(score.userId).toBe('user2');
    expect(score.totalScore).toBeGreaterThan(0);
    expect(score.totalScore).toBeLessThanOrEqual(100);
    expect(score.breakdown).toBeDefined();
  });

  test('should give higher scores for similar interests', () => {
    const user3 = SistersConnectMatching.createSampleProfile('user3', {
      personalInfo: {
        id: 'user3',
        firstName: 'Khadija',
        age: 25,
        location: user1.personalInfo.location,
        languages: ['English', 'Arabic'],
      },
      interests: {
        hobbies: ['reading', 'cooking'], // Same as user1
        activities: ['volunteering'], // Same as user1
        islamicInterests: ['Quran study', 'Islamic history'], // Same as user1
        studyInterests: ['Arabic language'], // Same as user1
        professionalInterests: ['technology'], // Same as user1
      },
    });

    const score1 = scorer.calculateCompatibility(user1, user2, preferences, 0);
    const score2 = scorer.calculateCompatibility(user1, user3, preferences, 0);

    expect(score2.totalScore).toBeGreaterThan(score1.totalScore);
    expect(score2.breakdown.interestCompatibility).toBeGreaterThan(score1.breakdown.interestCompatibility);
  });

  test('should apply deal breakers correctly', () => {
    const strictPreferences: MatchingPreferences = {
      ...preferences,
      ageRange: { min: 30, max: 40 }, // user2 is 27, should be filtered out
    };

    const score = scorer.calculateCompatibility(user1, user2, strictPreferences, 0);
    expect(score.totalScore).toBe(0);
    expect(score.reasons).toContain('Age 27 is outside preferred range 30-40');
  });

  test('should reward Islamic compatibility', () => {
    const user3 = SistersConnectMatching.createSampleProfile('user3', {
      personalInfo: {
        id: 'user3',
        firstName: 'Mariam',
        age: 25,
        location: user1.personalInfo.location,
        languages: ['English'],
      },
      islamicProfile: {
        practiceLevel: user1.islamicProfile.practiceLevel,
        prayerFrequency: user1.islamicProfile.prayerFrequency,
        hijabWearing: user1.islamicProfile.hijabWearing,
        mosqueAttendance: user1.islamicProfile.mosqueAttendance,
        quranStudyInterest: user1.islamicProfile.quranStudyInterest,
        islamicHistoryInterest: user1.islamicProfile.islamicHistoryInterest,
        arabicLearningInterest: user1.islamicProfile.arabicLearningInterest,
        isNewMuslim: user1.islamicProfile.isNewMuslim,
      },
    });

    const user4 = SistersConnectMatching.createSampleProfile('user4', {
      personalInfo: {
        id: 'user4',
        firstName: 'Layla',
        age: 25,
        location: user1.personalInfo.location,
        languages: ['English'],
      },
      islamicProfile: {
        practiceLevel: 'beginner', // Different from user1
        prayerFrequency: 'rarely', // Different from user1
        hijabWearing: false, // Different from user1
        mosqueAttendance: 'never', // Different from user1
        quranStudyInterest: false,
        islamicHistoryInterest: false,
        arabicLearningInterest: false,
        isNewMuslim: true,
      },
    });

    const score3 = scorer.calculateCompatibility(user1, user3, preferences, 0);
    const score4 = scorer.calculateCompatibility(user1, user4, preferences, 0);

    expect(score3.breakdown.islamicCompatibility).toBeGreaterThan(score4.breakdown.islamicCompatibility);
  });

  test('should consider social graph bonus', () => {
    const baseScore = scorer.calculateCompatibility(user1, user2, preferences, 0);
    const boostedScore = scorer.calculateCompatibility(user1, user2, preferences, 25);

    expect(boostedScore.breakdown.socialGraphBonus).toBe(25);
    expect(boostedScore.totalScore).toBeGreaterThan(baseScore.totalScore);
  });

  test('should generate meaningful match reasons', () => {
    const score = scorer.calculateCompatibility(user1, user2, preferences, 0);
    
    expect(score.reasons).toBeDefined();
    expect(Array.isArray(score.reasons)).toBe(true);
    expect(score.reasons.length).toBeGreaterThan(0);
  });

  test('should handle same city bonus', () => {
    const sameCityUser = SistersConnectMatching.createSampleProfile('samecity', {
      personalInfo: {
        id: 'samecity',
        firstName: 'Huda',
        age: 25,
        location: user1.personalInfo.location, // Same location
        languages: ['English'],
      },
    });

    const differentCityUser = SistersConnectMatching.createSampleProfile('diffcity', {
      personalInfo: {
        id: 'diffcity',
        firstName: 'Zara',
        age: 25,
        location: {
          latitude: 34.0522,
          longitude: -118.2437,
          city: 'Los Angeles',
          country: 'USA',
          timezone: 'America/Los_Angeles',
        },
        languages: ['English'],
      },
    });

    const sameCityScore = scorer.calculateCompatibility(user1, sameCityUser, preferences, 0);
    const diffCityScore = scorer.calculateCompatibility(user1, differentCityUser, preferences, 0);

    expect(sameCityScore.breakdown.locationProximity).toBeGreaterThan(diffCityScore.breakdown.locationProximity);
  });
});

describe('MatchingService Integration', () => {
  test('should find matches successfully', async () => {
    const matching = SistersConnectMatching.create();
    const service = matching.getMatchingService();

    const currentUser = SistersConnectMatching.createSampleProfile('current');
    const candidates = [
      SistersConnectMatching.createSampleProfile('candidate1'),
      SistersConnectMatching.createSampleProfile('candidate2'),
      SistersConnectMatching.createSampleProfile('candidate3'),
    ];

    const preferences = SistersConnectMatching.createDefaultPreferences();
    const matches = await service.findMatches(currentUser, candidates, preferences);

    expect(matches).toBeDefined();
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.length).toBeLessThanOrEqual(candidates.length);
  });

  test('should respect match limit', async () => {
    const matching = SistersConnectMatching.create();
    const service = matching.getMatchingService();

    const currentUser = SistersConnectMatching.createSampleProfile('current');
    const candidates = Array.from({ length: 10 }, (_, i) => 
      SistersConnectMatching.createSampleProfile(`candidate${i}`)
    );

    const preferences = SistersConnectMatching.createDefaultPreferences();
    const matches = await service.findMatches(currentUser, candidates, preferences, { limit: 3 });

    expect(matches.length).toBeLessThanOrEqual(3);
  });

  test('should generate conversation starters', () => {
    const matching = SistersConnectMatching.create();
    const service = matching.getMatchingService();

    const user1 = SistersConnectMatching.createSampleProfile('user1', {
      interests: {
        hobbies: ['reading'],
        activities: ['volunteering'],
        islamicInterests: ['Quran study'],
        studyInterests: ['Arabic language'],
        professionalInterests: ['technology'],
      },
    });

    const user2 = SistersConnectMatching.createSampleProfile('user2', {
      interests: {
        hobbies: ['reading'],
        activities: ['hiking'],
        islamicInterests: ['Quran study'],
        studyInterests: ['Islamic studies'],
        professionalInterests: ['design'],
      },
    });

    const starters = service.generateConversationStarters(user1, user2);

    expect(starters).toBeDefined();
    expect(Array.isArray(starters)).toBe(true);
    expect(starters.length).toBeGreaterThan(0);
    expect(starters.length).toBeLessThanOrEqual(3);
  });
});