import { UserProfile, MatchingPreferences, MatchScore } from '../../types/user';
import { calculateDistance } from '../../utils/location';
import { calculateAgeCompatibility, normalizeScore } from '../../utils/scoring';

/**
 * Core compatibility scoring algorithm for SistersConnect
 * Respects Islamic values while providing meaningful connections
 */
export class CompatibilityScorer {
  
  /**
   * Calculate overall compatibility score between two users
   */
  public calculateCompatibility(
    user1: UserProfile,
    user2: UserProfile,
    preferences: MatchingPreferences,
    socialGraphBonus: number = 0
  ): MatchScore {
    
    // Check deal breakers first
    const dealBreakerResult = this.checkDealBreakers(user1, user2, preferences);
    if (!dealBreakerResult.passed) {
      return {
        userId: user2.personalInfo.id,
        totalScore: 0,
        breakdown: {
          interestCompatibility: 0,
          locationProximity: 0,
          ageCompatibility: 0,
          languageMatch: 0,
          islamicCompatibility: 0,
          lifestyleCompatibility: 0,
          socialGraphBonus: 0,
        },
        reasons: dealBreakerResult.reasons,
        specialFeatures: [],
      };
    }

    // Calculate individual compatibility scores
    const interestScore = this.calculateInterestCompatibility(user1, user2);
    const locationScore = this.calculateLocationCompatibility(user1, user2, preferences.maxDistance);
    const ageScore = this.calculateAgeCompatibility(user1, user2, preferences.ageRange);
    const languageScore = this.calculateLanguageCompatibility(user1, user2, preferences.requiredLanguages);
    const islamicScore = this.calculateIslamicCompatibility(user1, user2);
    const lifestyleScore = this.calculateLifestyleCompatibility(user1, user2);

    // Apply preference weights
    const weightedScores = {
      interestCompatibility: interestScore * preferences.softPreferences.similarInterests,
      locationProximity: locationScore * (preferences.softPreferences.sameCity || 0.3),
      ageCompatibility: ageScore * preferences.softPreferences.similarAge,
      languageMatch: languageScore * 0.2, // Fixed weight for language
      islamicCompatibility: islamicScore * preferences.softPreferences.similarPracticeLevel,
      lifestyleCompatibility: lifestyleScore * preferences.softPreferences.similarLifestyle,
      socialGraphBonus: socialGraphBonus,
    };

    // Calculate total score (weighted average)
    const totalWeight = Object.values(preferences.softPreferences).reduce((sum, weight) => sum + weight, 0.5); // 0.5 for language and social graph
    const totalScore = (Object.values(weightedScores).reduce((sum, score) => sum + score, 0)) / totalWeight;

    const reasons = this.generateMatchReasons(user1, user2, weightedScores);
    const specialFeatures = this.identifySpecialFeatures(user1, user2, preferences);

    return {
      userId: user2.personalInfo.id,
      totalScore: Math.min(100, Math.max(0, totalScore)),
      breakdown: weightedScores,
      reasons,
      specialFeatures,
    };
  }

  /**
   * Check if any deal breakers are violated
   */
  private checkDealBreakers(
    user1: UserProfile,
    user2: UserProfile,
    preferences: MatchingPreferences
  ): { passed: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Age range check
    if (user2.personalInfo.age < preferences.ageRange.min || 
        user2.personalInfo.age > preferences.ageRange.max) {
      reasons.push(`Age ${user2.personalInfo.age} is outside preferred range ${preferences.ageRange.min}-${preferences.ageRange.max}`);
    }

    // Distance check
    const distance = calculateDistance(
      user1.personalInfo.location,
      user2.personalInfo.location
    );
    if (distance > preferences.maxDistance) {
      reasons.push(`Distance ${distance.toFixed(1)}km exceeds maximum ${preferences.maxDistance}km`);
    }

    // Practice level check
    if (preferences.dealBreakers.differentPracticeLevel &&
        user1.islamicProfile.practiceLevel !== user2.islamicProfile.practiceLevel) {
      reasons.push('Different Islamic practice levels');
    }

    // Hijab check
    if (preferences.dealBreakers.noHijab &&
        !user2.islamicProfile.hijabWearing) {
      reasons.push('Does not wear hijab');
    }

    // Family status check
    if (preferences.dealBreakers.differentFamilyStatus &&
        user1.lifestyle.familyStatus !== user2.lifestyle.familyStatus) {
      reasons.push('Different family status');
    }

    // Language requirement check
    const hasRequiredLanguage = preferences.requiredLanguages.some(lang =>
      user2.personalInfo.languages.includes(lang) ||
      (user2.personalInfo.secondaryLanguages && user2.personalInfo.secondaryLanguages.includes(lang))
    );
    if (preferences.requiredLanguages.length > 0 && !hasRequiredLanguage) {
      reasons.push(`Does not speak required languages: ${preferences.requiredLanguages.join(', ')}`);
    }

    return {
      passed: reasons.length === 0,
      reasons
    };
  }

  /**
   * Calculate interest compatibility score
   */
  private calculateInterestCompatibility(user1: UserProfile, user2: UserProfile): number {
    const allInterests1 = [
      ...user1.interests.hobbies,
      ...user1.interests.activities,
      ...user1.interests.islamicInterests,
      ...user1.interests.studyInterests,
      ...user1.interests.professionalInterests
    ];

    const allInterests2 = [
      ...user2.interests.hobbies,
      ...user2.interests.activities,
      ...user2.interests.islamicInterests,
      ...user2.interests.studyInterests,
      ...user2.interests.professionalInterests
    ];

    const commonInterests = allInterests1.filter(interest => 
      allInterests2.includes(interest)
    );

    const totalInterests = new Set([...allInterests1, ...allInterests2]).size;
    
    if (totalInterests === 0) return 50; // Neutral score if no interests
    
    // Weight Islamic interests more heavily
    const islamicCommon = user1.interests.islamicInterests.filter(interest =>
      user2.interests.islamicInterests.includes(interest)
    ).length;
    
    const baseScore = (commonInterests.length / Math.max(allInterests1.length, allInterests2.length)) * 100;
    const islamicBonus = islamicCommon * 10; // Bonus for shared Islamic interests
    
    return Math.min(100, baseScore + islamicBonus);
  }

  /**
   * Calculate location compatibility score
   */
  private calculateLocationCompatibility(
    user1: UserProfile,
    user2: UserProfile,
    maxDistance: number
  ): number {
    const distance = calculateDistance(user1.personalInfo.location, user2.personalInfo.location);
    
    if (distance > maxDistance) return 0;
    
    // Same city bonus
    if (user1.personalInfo.location.city === user2.personalInfo.location.city) {
      return 100;
    }
    
    // Linear decay based on distance
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }

  /**
   * Calculate age compatibility score
   */
  private calculateAgeCompatibility(
    user1: UserProfile,
    user2: UserProfile,
    preferredRange: { min: number; max: number }
  ): number {
    return calculateAgeCompatibility(
      user1.personalInfo.age,
      user2.personalInfo.age,
      preferredRange
    );
  }

  /**
   * Calculate language compatibility score
   */
  private calculateLanguageCompatibility(
    user1: UserProfile,
    user2: UserProfile,
    requiredLanguages: string[]
  ): number {
    const user1Languages = [
      ...user1.personalInfo.languages,
      ...(user1.personalInfo.secondaryLanguages || [])
    ];
    
    const user2Languages = [
      ...user2.personalInfo.languages,
      ...(user2.personalInfo.secondaryLanguages || [])
    ];

    const commonLanguages = user1Languages.filter(lang => 
      user2Languages.includes(lang)
    );

    if (commonLanguages.length === 0) return 0;

    // Bonus for primary language match
    const primaryMatch = user1.personalInfo.languages.some(lang =>
      user2.personalInfo.languages.includes(lang)
    );

    const baseScore = (commonLanguages.length / Math.max(user1Languages.length, user2Languages.length)) * 100;
    const primaryBonus = primaryMatch ? 20 : 0;

    return Math.min(100, baseScore + primaryBonus);
  }

  /**
   * Calculate Islamic practice compatibility score
   */
  private calculateIslamicCompatibility(user1: UserProfile, user2: UserProfile): number {
    let score = 0;
    let factors = 0;

    // Practice level compatibility
    const practiceLevels = ['beginner', 'intermediate', 'advanced', 'scholar'];
    const level1Index = practiceLevels.indexOf(user1.islamicProfile.practiceLevel);
    const level2Index = practiceLevels.indexOf(user2.islamicProfile.practiceLevel);
    const levelDiff = Math.abs(level1Index - level2Index);
    score += Math.max(0, 100 - (levelDiff * 25));
    factors++;

    // Prayer frequency compatibility
    const prayerFreq = ['rarely', 'sometimes', 'regularly', 'always'];
    const prayer1Index = prayerFreq.indexOf(user1.islamicProfile.prayerFrequency);
    const prayer2Index = prayerFreq.indexOf(user2.islamicProfile.prayerFrequency);
    const prayerDiff = Math.abs(prayer1Index - prayer2Index);
    score += Math.max(0, 100 - (prayerDiff * 30));
    factors++;

    // Hijab compatibility (bonus for both wearing)
    if (user1.islamicProfile.hijabWearing === user2.islamicProfile.hijabWearing) {
      score += user1.islamicProfile.hijabWearing ? 100 : 80; // Higher score for both wearing hijab
    } else {
      score += 60; // Moderate score for different hijab practices
    }
    factors++;

    // Mosque attendance compatibility
    const mosqueFreq = ['never', 'occasionally', 'weekly', 'daily'];
    const mosque1Index = mosqueFreq.indexOf(user1.islamicProfile.mosqueAttendance);
    const mosque2Index = mosqueFreq.indexOf(user2.islamicProfile.mosqueAttendance);
    const mosqueDiff = Math.abs(mosque1Index - mosque2Index);
    score += Math.max(0, 100 - (mosqueDiff * 25));
    factors++;

    // New Muslim support bonus
    if (user1.islamicProfile.isNewMuslim || user2.islamicProfile.isNewMuslim) {
      score += 10; // Bonus for supporting new Muslims
    }

    return score / factors;
  }

  /**
   * Calculate lifestyle compatibility score
   */
  private calculateLifestyleCompatibility(user1: UserProfile, user2: UserProfile): number {
    let score = 0;
    let factors = 0;

    // Work status compatibility
    if (user1.lifestyle.workStatus === user2.lifestyle.workStatus) {
      score += 100;
    } else {
      // Partial compatibility for similar statuses
      const workCompatibility = this.getWorkStatusCompatibility(
        user1.lifestyle.workStatus,
        user2.lifestyle.workStatus
      );
      score += workCompatibility;
    }
    factors++;

    // Family status compatibility
    if (user1.lifestyle.familyStatus === user2.lifestyle.familyStatus) {
      score += 100;
    } else {
      score += 60; // Some compatibility for different family statuses
    }
    factors++;

    // Children compatibility
    if (user1.lifestyle.hasChildren === user2.lifestyle.hasChildren) {
      score += 100;
    } else {
      score += 70; // Moderate compatibility
    }
    factors++;

    // Availability compatibility
    const availabilityCompatibility = this.getAvailabilityCompatibility(
      user1.lifestyle.availability,
      user2.lifestyle.availability
    );
    score += availabilityCompatibility;
    factors++;

    // Meeting times overlap
    const timeOverlap = user1.lifestyle.preferredMeetingTimes.filter(time =>
      user2.lifestyle.preferredMeetingTimes.includes(time)
    ).length;
    const timeScore = (timeOverlap / Math.max(
      user1.lifestyle.preferredMeetingTimes.length,
      user2.lifestyle.preferredMeetingTimes.length
    )) * 100;
    score += timeScore;
    factors++;

    return score / factors;
  }

  private getWorkStatusCompatibility(status1: string, status2: string): number {
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'student': { 'student': 100, 'working': 70, 'homemaker': 60, 'retired': 50, 'unemployed': 80 },
      'working': { 'student': 70, 'working': 100, 'homemaker': 60, 'retired': 50, 'unemployed': 50 },
      'homemaker': { 'student': 60, 'working': 60, 'homemaker': 100, 'retired': 80, 'unemployed': 70 },
      'retired': { 'student': 50, 'working': 50, 'homemaker': 80, 'retired': 100, 'unemployed': 60 },
      'unemployed': { 'student': 80, 'working': 50, 'homemaker': 70, 'retired': 60, 'unemployed': 100 }
    };

    return compatibilityMatrix[status1]?.[status2] || 50;
  }

  private getAvailabilityCompatibility(avail1: string, avail2: string): number {
    const availabilityLevels = ['very_limited', 'limited', 'moderate', 'flexible', 'very_flexible'];
    const index1 = availabilityLevels.indexOf(avail1);
    const index2 = availabilityLevels.indexOf(avail2);
    const diff = Math.abs(index1 - index2);
    
    return Math.max(0, 100 - (diff * 20));
  }

  /**
   * Generate human-readable reasons for the match
   */
  private generateMatchReasons(
    user1: UserProfile,
    user2: UserProfile,
    scores: any
  ): string[] {
    const reasons: string[] = [];

    if (scores.interestCompatibility > 70) {
      reasons.push('You share many common interests');
    }

    if (scores.islamicCompatibility > 80) {
      reasons.push('You have similar Islamic practice levels');
    }

    if (scores.locationProximity > 90) {
      reasons.push('You live in the same city');
    } else if (scores.locationProximity > 70) {
      reasons.push('You live relatively close to each other');
    }

    if (scores.ageCompatibility > 80) {
      reasons.push('You are in similar age groups');
    }

    if (scores.languageMatch > 80) {
      reasons.push('You speak the same languages');
    }

    if (scores.lifestyleCompatibility > 75) {
      reasons.push('You have compatible lifestyles');
    }

    if (scores.socialGraphBonus > 0) {
      reasons.push('You have mutual connections');
    }

    return reasons;
  }

  /**
   * Identify special features for this match
   */
  private identifySpecialFeatures(
    user1: UserProfile,
    user2: UserProfile,
    preferences: MatchingPreferences
  ): string[] {
    const features: string[] = [];

    // Study buddy potential
    if (preferences.specialFeatures.studyBuddy) {
      const studyOverlap = user1.interests.studyInterests.filter(interest =>
        user2.interests.studyInterests.includes(interest)
      );
      if (studyOverlap.length > 0) {
        features.push(`Study buddy for: ${studyOverlap.join(', ')}`);
      }
    }

    // Mentorship potential
    if (preferences.specialFeatures.mentorship) {
      if (user1.islamicProfile.isNewMuslim && !user2.islamicProfile.isNewMuslim) {
        features.push('Potential mentor for Islamic guidance');
      } else if (!user1.islamicProfile.isNewMuslim && user2.islamicProfile.isNewMuslim) {
        features.push('Opportunity to mentor a new Muslim sister');
      }
    }

    // Professional networking
    if (preferences.specialFeatures.professionalNetworking) {
      const professionalOverlap = user1.interests.professionalInterests.filter(interest =>
        user2.interests.professionalInterests.includes(interest)
      );
      if (professionalOverlap.length > 0) {
        features.push(`Professional networking: ${professionalOverlap.join(', ')}`);
      }
    }

    return features;
  }
}