import { UserProfile, MatchingPreferences, UserBehavior } from '../../types/user';
import { calculateDistance } from '../../utils/location';

/**
 * Advanced preference filtering system that learns from user behavior
 * and applies both hard and soft filters
 */
export class PreferenceFilter {

  /**
   * Apply all filters to a list of potential matches
   */
  public filterCandidates(
    currentUser: UserProfile,
    candidates: UserProfile[],
    preferences: MatchingPreferences,
    userBehavior?: UserBehavior
  ): UserProfile[] {
    let filtered = candidates;

    // Apply hard filters (deal breakers)
    filtered = this.applyHardFilters(currentUser, filtered, preferences);

    // Apply learned behavior filters
    if (userBehavior) {
      filtered = this.applyBehaviorFilters(filtered, userBehavior);
    }

    // Apply privacy and safety filters
    filtered = this.applyPrivacyFilters(currentUser, filtered);

    return filtered;
  }

  /**
   * Apply hard filters that must be satisfied
   */
  private applyHardFilters(
    currentUser: UserProfile,
    candidates: UserProfile[],
    preferences: MatchingPreferences
  ): UserProfile[] {
    return candidates.filter(candidate => {
      // Age range filter
      if (candidate.personalInfo.age < preferences.ageRange.min ||
          candidate.personalInfo.age > preferences.ageRange.max) {
        return false;
      }

      // Distance filter
      const distance = calculateDistance(
        currentUser.personalInfo.location,
        candidate.personalInfo.location
      );
      if (distance > preferences.maxDistance) {
        return false;
      }

      // Required languages filter
      if (preferences.requiredLanguages.length > 0) {
        const candidateLanguages = [
          ...candidate.personalInfo.languages,
          ...(candidate.personalInfo.secondaryLanguages || [])
        ];
        const hasRequiredLanguage = preferences.requiredLanguages.some(lang =>
          candidateLanguages.includes(lang)
        );
        if (!hasRequiredLanguage) {
          return false;
        }
      }

      // Deal breaker filters
      if (preferences.dealBreakers.differentPracticeLevel &&
          currentUser.islamicProfile.practiceLevel !== candidate.islamicProfile.practiceLevel) {
        return false;
      }

      if (preferences.dealBreakers.noHijab &&
          !candidate.islamicProfile.hijabWearing) {
        return false;
      }

      if (preferences.dealBreakers.differentFamilyStatus &&
          currentUser.lifestyle.familyStatus !== candidate.lifestyle.familyStatus) {
        return false;
      }

      return true;
    });
  }

  /**
   * Apply filters based on learned user behavior
   */
  private applyBehaviorFilters(
    candidates: UserProfile[],
    userBehavior: UserBehavior
  ): UserProfile[] {
    return candidates.filter(candidate => {
      const candidateId = candidate.personalInfo.id;

      // Exclude previously disliked users
      if (userBehavior.dislikedProfiles.includes(candidateId)) {
        return false;
      }

      // Exclude reported users
      if (userBehavior.reportedUsers.includes(candidateId)) {
        return false;
      }

      // Exclude already declined connections
      if (userBehavior.declinedConnections.includes(candidateId)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Apply privacy and safety filters
   */
  private applyPrivacyFilters(
    currentUser: UserProfile,
    candidates: UserProfile[]
  ): UserProfile[] {
    return candidates.filter(candidate => {
      // Don't match with self
      if (candidate.personalInfo.id === currentUser.personalInfo.id) {
        return false;
      }

      // Only show verified users for safety
      if (!candidate.verified) {
        return false;
      }

      // Filter out inactive users (more than 30 days)
      const daysSinceActive = Math.floor(
        (Date.now() - candidate.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceActive > 30) {
        return false;
      }

      return true;
    });
  }

  /**
   * Learn and update preferences based on user interactions
   */
  public updatePreferencesFromBehavior(
    currentPreferences: MatchingPreferences,
    userBehavior: UserBehavior,
    allUsers: UserProfile[]
  ): MatchingPreferences {
    const updatedPreferences = { ...currentPreferences };

    // Analyze liked profiles to learn preferred age ranges
    const likedAges = this.getLikedUserAges(userBehavior, allUsers);
    if (likedAges.length >= 3) {
      const avgAge = likedAges.reduce((sum, age) => sum + age, 0) / likedAges.length;
      const ageStdDev = Math.sqrt(
        likedAges.reduce((sum, age) => sum + Math.pow(age - avgAge, 2), 0) / likedAges.length
      );
      
      // Adjust age range based on learned preferences
      updatedPreferences.ageRange = {
        min: Math.max(18, Math.floor(avgAge - ageStdDev * 1.5)),
        max: Math.min(80, Math.ceil(avgAge + ageStdDev * 1.5))
      };
    }

    // Analyze preferred distances
    const likedDistances = this.getLikedUserDistances(userBehavior, allUsers);
    if (likedDistances.length >= 3) {
      const avgDistance = likedDistances.reduce((sum, dist) => sum + dist, 0) / likedDistances.length;
      updatedPreferences.maxDistance = Math.max(
        updatedPreferences.maxDistance,
        Math.ceil(avgDistance * 1.2) // 20% buffer
      );
    }

    // Update soft preferences based on successful connections
    const acceptedConnections = this.getAcceptedConnectionProfiles(userBehavior, allUsers);
    if (acceptedConnections.length >= 2) {
      updatedPreferences.softPreferences = this.updateSoftPreferences(
        updatedPreferences.softPreferences,
        acceptedConnections
      );
    }

    return updatedPreferences;
  }

  /**
   * Create personalized conversation starters based on shared interests
   */
  public generateConversationStarters(
    user1: UserProfile,
    user2: UserProfile
  ): string[] {
    const starters: string[] = [];

    // Islamic interests
    const islamicCommon = user1.interests.islamicInterests.filter(interest =>
      user2.interests.islamicInterests.includes(interest)
    );
    if (islamicCommon.includes('Quran study')) {
      starters.push("As-salamu alaykum sister! I noticed you're interested in Quran study. Do you have a favorite surah?");
    }
    if (islamicCommon.includes('Islamic history')) {
      starters.push("I see we both love Islamic history! Have you read any good books on the topic recently?");
    }

    // Hobbies and activities
    const hobbyCommon = user1.interests.hobbies.filter(hobby =>
      user2.interests.hobbies.includes(hobby)
    );
    if (hobbyCommon.length > 0) {
      starters.push(`I noticed we both enjoy ${hobbyCommon[0]}! How did you get started with it?`);
    }

    // Professional interests
    const professionalCommon = user1.interests.professionalInterests.filter(interest =>
      user2.interests.professionalInterests.includes(interest)
    );
    if (professionalCommon.length > 0) {
      starters.push(`Great to meet someone else interested in ${professionalCommon[0]}! Are you working in this field?`);
    }

    // Location-based
    if (user1.personalInfo.location.city === user2.personalInfo.location.city) {
      starters.push(`Nice to meet a fellow sister from ${user1.personalInfo.location.city}! Do you know any good halal restaurants here?`);
    }

    // New Muslim support
    if (user2.islamicProfile.isNewMuslim) {
      starters.push("Welcome to Islam, sister! How has your journey been so far? I'd love to support you in any way I can.");
    }

    // Default Islamic greeting
    if (starters.length === 0) {
      starters.push("As-salamu alaykum sister! I'd love to get to know you better. How are you doing today?");
    }

    return starters.slice(0, 3); // Return top 3 starters
  }

  /**
   * Apply special feature filters
   */
  public applySpecialFeatureFilters(
    currentUser: UserProfile,
    candidates: UserProfile[],
    featureType: 'studyBuddy' | 'mentorship' | 'eventCompanion' | 'professionalNetworking'
  ): UserProfile[] {
    switch (featureType) {
      case 'studyBuddy':
        return this.filterForStudyBuddy(currentUser, candidates);
      case 'mentorship':
        return this.filterForMentorship(currentUser, candidates);
      case 'eventCompanion':
        return this.filterForEventCompanion(currentUser, candidates);
      case 'professionalNetworking':
        return this.filterForProfessionalNetworking(currentUser, candidates);
      default:
        return candidates;
    }
  }

  private filterForStudyBuddy(currentUser: UserProfile, candidates: UserProfile[]): UserProfile[] {
    return candidates.filter(candidate => {
      // Must have overlapping study interests
      const studyOverlap = currentUser.interests.studyInterests.filter(interest =>
        candidate.interests.studyInterests.includes(interest)
      );
      
      // Must have similar practice level for Islamic studies
      const islamicStudyOverlap = currentUser.interests.islamicInterests.filter(interest =>
        candidate.interests.islamicInterests.includes(interest)
      );
      
      return studyOverlap.length > 0 || islamicStudyOverlap.length > 0;
    });
  }

  private filterForMentorship(currentUser: UserProfile, candidates: UserProfile[]): UserProfile[] {
    return candidates.filter(candidate => {
      // For new Muslims seeking mentorship
      if (currentUser.islamicProfile.isNewMuslim && !candidate.islamicProfile.isNewMuslim) {
        return true;
      }
      
      // For experienced Muslims who can mentor
      if (!currentUser.islamicProfile.isNewMuslim && candidate.islamicProfile.isNewMuslim) {
        return true;
      }
      
      // Age-based mentorship (older can mentor younger)
      const ageDiff = currentUser.personalInfo.age - candidate.personalInfo.age;
      if (Math.abs(ageDiff) >= 5) {
        return true;
      }
      
      return false;
    });
  }

  private filterForEventCompanion(currentUser: UserProfile, candidates: UserProfile[]): UserProfile[] {
    return candidates.filter(candidate => {
      // Same city for events
      if (currentUser.personalInfo.location.city !== candidate.personalInfo.location.city) {
        return false;
      }
      
      // Compatible availability
      const timeOverlap = currentUser.lifestyle.preferredMeetingTimes.filter(time =>
        candidate.lifestyle.preferredMeetingTimes.includes(time)
      );
      
      return timeOverlap.length > 0;
    });
  }

  private filterForProfessionalNetworking(currentUser: UserProfile, candidates: UserProfile[]): UserProfile[] {
    return candidates.filter(candidate => {
      // Must have overlapping professional interests
      const professionalOverlap = currentUser.interests.professionalInterests.filter(interest =>
        candidate.interests.professionalInterests.includes(interest)
      );
      
      // Both should be working or studying
      const isWorkingOrStudying = (user: UserProfile) => 
        user.lifestyle.workStatus === 'working' || 
        user.lifestyle.studyStatus !== 'not_studying';
      
      return professionalOverlap.length > 0 && 
             isWorkingOrStudying(currentUser) && 
             isWorkingOrStudying(candidate);
    });
  }

  // Helper methods
  private getLikedUserAges(userBehavior: UserBehavior, allUsers: UserProfile[]): number[] {
    return userBehavior.likedProfiles
      .map(userId => allUsers.find(user => user.personalInfo.id === userId))
      .filter(user => user !== undefined)
      .map(user => user!.personalInfo.age);
  }

  private getLikedUserDistances(userBehavior: UserBehavior, allUsers: UserProfile[]): number[] {
    // This would require the current user's location context
    // Simplified implementation
    return [];
  }

  private getAcceptedConnectionProfiles(userBehavior: UserBehavior, allUsers: UserProfile[]): UserProfile[] {
    return userBehavior.acceptedConnections
      .map(userId => allUsers.find(user => user.personalInfo.id === userId))
      .filter(user => user !== undefined) as UserProfile[];
  }

  private updateSoftPreferences(
    currentPrefs: any,
    acceptedProfiles: UserProfile[]
  ): any {
    // Analyze patterns in accepted connections and adjust weights
    // This is a simplified implementation
    return currentPrefs;
  }
}