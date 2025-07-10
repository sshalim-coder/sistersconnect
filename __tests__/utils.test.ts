import { calculateDistance, isSameCity, isSameTimezone } from '../src/utils/location';
import { calculateAgeCompatibility, calculateJaccardSimilarity, calculateWeightedAverage } from '../src/utils/scoring';

describe('Location Utils', () => {
  test('should calculate distance between two locations', () => {
    const nyc = {
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
    };

    const la = {
      latitude: 34.0522,
      longitude: -118.2437,
      city: 'Los Angeles',
      country: 'USA',
      timezone: 'America/Los_Angeles',
    };

    const distance = calculateDistance(nyc, la);
    expect(distance).toBeGreaterThan(3900); // Approximately 3944 km
    expect(distance).toBeLessThan(4000);
  });

  test('should detect same city', () => {
    const loc1 = {
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
    };

    const loc2 = {
      latitude: 40.7589,
      longitude: -73.9851,
      city: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
    };

    const loc3 = {
      latitude: 34.0522,
      longitude: -118.2437,
      city: 'Los Angeles',
      country: 'USA',
      timezone: 'America/Los_Angeles',
    };

    expect(isSameCity(loc1, loc2)).toBe(true);
    expect(isSameCity(loc1, loc3)).toBe(false);
  });

  test('should detect same timezone', () => {
    const loc1 = {
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
    };

    const loc2 = {
      latitude: 42.3601,
      longitude: -71.0589,
      city: 'Boston',
      country: 'USA',
      timezone: 'America/New_York',
    };

    const loc3 = {
      latitude: 34.0522,
      longitude: -118.2437,
      city: 'Los Angeles',
      country: 'USA',
      timezone: 'America/Los_Angeles',
    };

    expect(isSameTimezone(loc1, loc2)).toBe(true);
    expect(isSameTimezone(loc1, loc3)).toBe(false);
  });
});

describe('Scoring Utils', () => {
  test('should calculate age compatibility correctly', () => {
    const preferredRange = { min: 20, max: 30 };

    // Perfect match (same age)
    expect(calculateAgeCompatibility(25, 25, preferredRange)).toBe(100);

    // Good match (within 2 years)
    expect(calculateAgeCompatibility(25, 27, preferredRange)).toBe(95);

    // Decent match (within 5 years)
    expect(calculateAgeCompatibility(25, 29, preferredRange)).toBe(80);

    // Outside range
    expect(calculateAgeCompatibility(25, 35, preferredRange)).toBe(0);
    expect(calculateAgeCompatibility(25, 15, preferredRange)).toBe(0);
  });

  test('should calculate Jaccard similarity', () => {
    const set1 = ['reading', 'cooking', 'hiking'];
    const set2 = ['reading', 'painting', 'hiking'];
    const set3 = ['swimming', 'dancing'];

    const similarity1 = calculateJaccardSimilarity(set1, set2);
    const similarity2 = calculateJaccardSimilarity(set1, set3);

    expect(similarity1).toBeGreaterThan(similarity2);
    expect(similarity1).toBeGreaterThan(0);
    expect(similarity2).toBe(0);
  });

  test('should calculate weighted average', () => {
    const scores = [
      { score: 80, weight: 0.5 },
      { score: 90, weight: 0.3 },
      { score: 70, weight: 0.2 },
    ];

    const weightedAvg = calculateWeightedAverage(scores);
    const expectedAvg = (80 * 0.5 + 90 * 0.3 + 70 * 0.2) / (0.5 + 0.3 + 0.2);

    expect(weightedAvg).toBeCloseTo(expectedAvg, 2);
  });

  test('should handle empty weighted average', () => {
    const emptyScores: { score: number; weight: number }[] = [];
    expect(calculateWeightedAverage(emptyScores)).toBe(0);

    const zeroWeights = [{ score: 80, weight: 0 }, { score: 90, weight: 0 }];
    expect(calculateWeightedAverage(zeroWeights)).toBe(0);
  });
});