/**
 * Utility functions for scoring and normalization in the matching system
 */

/**
 * Calculate age compatibility score based on actual ages and preferred range
 */
export function calculateAgeCompatibility(
  age1: number,
  age2: number,
  preferredRange: { min: number; max: number }
): number {
  // Check if age2 is within preferred range
  if (age2 < preferredRange.min || age2 > preferredRange.max) {
    return 0;
  }

  // Calculate age difference
  const ageDiff = Math.abs(age1 - age2);
  
  // Perfect match for same age
  if (ageDiff === 0) return 100;
  
  // Good match within 2 years
  if (ageDiff <= 2) return 95;
  
  // Decent match within 5 years
  if (ageDiff <= 5) return 80;
  
  // Moderate match within 10 years
  if (ageDiff <= 10) return 60;
  
  // Lower score for larger differences, but still within range
  const rangeSize = preferredRange.max - preferredRange.min;
  const normalizedDiff = ageDiff / rangeSize;
  
  return Math.max(20, 100 - (normalizedDiff * 80));
}

/**
 * Normalize a score to be between 0 and 100
 */
export function normalizeScore(score: number, min: number = 0, max: number = 100): number {
  return Math.min(max, Math.max(min, score));
}

/**
 * Apply sigmoid function to smooth score transitions
 */
export function applySigmoid(score: number, steepness: number = 0.1): number {
  return 100 / (1 + Math.exp(-steepness * (score - 50)));
}

/**
 * Calculate weighted average of multiple scores
 */
export function calculateWeightedAverage(
  scores: { score: number; weight: number }[]
): number {
  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  
  if (totalWeight === 0) return 0;
  
  const weightedSum = scores.reduce((sum, item) => sum + (item.score * item.weight), 0);
  
  return weightedSum / totalWeight;
}

/**
 * Calculate Jaccard similarity coefficient for two sets
 */
export function calculateJaccardSimilarity<T>(set1: T[], set2: T[]): number {
  const setA = new Set(set1);
  const setB = new Set(set2);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  
  return (intersection.size / union.size) * 100;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;

  return (dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))) * 100;
}

/**
 * Apply decay function based on time difference
 */
export function applyTimeDecay(
  baseScore: number,
  daysSinceLastActive: number,
  decayRate: number = 0.02
): number {
  return baseScore * Math.exp(-decayRate * daysSinceLastActive);
}

/**
 * Calculate percentile rank of a score in a distribution
 */
export function calculatePercentileRank(score: number, allScores: number[]): number {
  const sortedScores = allScores.sort((a, b) => a - b);
  const rank = sortedScores.findIndex(s => s >= score);
  
  if (rank === -1) return 100; // Score is higher than all others
  
  return (rank / sortedScores.length) * 100;
}

/**
 * Apply logarithmic scaling to reduce the impact of extreme values
 */
export function applyLogScaling(value: number, base: number = 10): number {
  return Math.log(value + 1) / Math.log(base + 1);
}

/**
 * Calculate diversity score to promote varied recommendations
 */
export function calculateDiversityBonus(
  candidateFeatures: string[],
  alreadyRecommendedFeatures: string[][],
  maxBonus: number = 10
): number {
  if (alreadyRecommendedFeatures.length === 0) return 0;
  
  const allRecommendedFeatures = alreadyRecommendedFeatures.flat();
  const uniqueFeatures = new Set(allRecommendedFeatures);
  
  const novelFeatures = candidateFeatures.filter(feature => 
    !uniqueFeatures.has(feature)
  );
  
  const diversityRatio = novelFeatures.length / candidateFeatures.length;
  
  return diversityRatio * maxBonus;
}

/**
 * Apply popularity penalty to avoid always recommending the same popular users
 */
export function applyPopularityPenalty(
  baseScore: number,
  userPopularity: number,
  maxPenalty: number = 15
): number {
  // Popularity is measured as number of recent connections/interactions
  // Higher popularity gets a penalty to promote diversity
  const normalizedPopularity = Math.min(1, userPopularity / 100);
  const penalty = normalizedPopularity * maxPenalty;
  
  return Math.max(0, baseScore - penalty);
}