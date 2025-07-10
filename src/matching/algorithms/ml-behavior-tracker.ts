import { UserProfile, UserBehavior, MatchScore } from '../types/user';
import { calculateJaccardSimilarity } from '../utils/scoring';

/**
 * Machine Learning enhancement for the matching system
 * Tracks user behavior and improves recommendations over time
 */
export class MLBehaviorTracker {
  
  /**
   * Track user interaction with a match
   */
  public trackInteraction(
    userId: string,
    targetUserId: string,
    interactionType: 'like' | 'dislike' | 'accept' | 'decline' | 'report',
    matchScore: MatchScore,
    userBehavior: UserBehavior
  ): UserBehavior {
    const updatedBehavior = { ...userBehavior };

    switch (interactionType) {
      case 'like':
        if (!updatedBehavior.likedProfiles.includes(targetUserId)) {
          updatedBehavior.likedProfiles.push(targetUserId);
        }
        break;
      
      case 'dislike':
        if (!updatedBehavior.dislikedProfiles.includes(targetUserId)) {
          updatedBehavior.dislikedProfiles.push(targetUserId);
        }
        break;
      
      case 'accept':
        if (!updatedBehavior.acceptedConnections.includes(targetUserId)) {
          updatedBehavior.acceptedConnections.push(targetUserId);
        }
        break;
      
      case 'decline':
        if (!updatedBehavior.declinedConnections.includes(targetUserId)) {
          updatedBehavior.declinedConnections.push(targetUserId);
        }
        break;
      
      case 'report':
        if (!updatedBehavior.reportedUsers.includes(targetUserId)) {
          updatedBehavior.reportedUsers.push(targetUserId);
        }
        break;
    }

    // Update preference patterns based on interaction
    this.updatePreferencePatterns(updatedBehavior, matchScore, interactionType);

    return updatedBehavior;
  }

  /**
   * Analyze user behavior patterns to predict preferences
   */
  public analyzeUserPreferences(
    userBehavior: UserBehavior,
    allUsers: UserProfile[]
  ): {
    preferredAgeRange: { min: number; max: number };
    preferredDistanceRange: { min: number; max: number };
    preferredInterests: string[];
    preferredIslamicLevel: string[];
    behaviorScore: number;
  } {
    const likedUsers = this.getUsersFromIds(userBehavior.likedProfiles, allUsers);
    const acceptedUsers = this.getUsersFromIds(userBehavior.acceptedConnections, allUsers);
    const positiveInteractions = [...likedUsers, ...acceptedUsers];

    if (positiveInteractions.length === 0) {
      return {
        preferredAgeRange: { min: 18, max: 65 },
        preferredDistanceRange: { min: 0, max: 100 },
        preferredInterests: [],
        preferredIslamicLevel: [],
        behaviorScore: 0,
      };
    }

    // Analyze age preferences
    const ages = positiveInteractions.map(user => user.personalInfo.age);
    const preferredAgeRange = {
      min: Math.max(18, Math.min(...ages) - 2),
      max: Math.min(65, Math.max(...ages) + 2),
    };

    // Analyze interests
    const allInterests = positiveInteractions.flatMap(user => [
      ...user.interests.hobbies,
      ...user.interests.activities,
      ...user.interests.islamicInterests,
    ]);
    const interestCounts = this.countOccurrences(allInterests);
    const preferredInterests = Object.entries(interestCounts)
      .filter(([_, count]) => count >= 2)
      .map(([interest, _]) => interest);

    // Analyze Islamic practice levels
    const islamicLevels = positiveInteractions.map(user => user.islamicProfile.practiceLevel);
    const levelCounts = this.countOccurrences(islamicLevels);
    const preferredIslamicLevel = Object.entries(levelCounts)
      .filter(([_, count]) => count >= 1)
      .map(([level, _]) => level);

    // Calculate behavior score (how consistent the user is)
    const behaviorScore = this.calculateBehaviorConsistency(userBehavior);

    return {
      preferredAgeRange,
      preferredDistanceRange: { min: 0, max: 50 }, // Simplified
      preferredInterests,
      preferredIslamicLevel,
      behaviorScore,
    };
  }

  /**
   * Predict compatibility using collaborative filtering
   */
  public predictCompatibilityUsingCollaborativeFiltering(
    userId: string,
    targetUserId: string,
    allUserBehaviors: Map<string, UserBehavior>
  ): number {
    const userBehavior = allUserBehaviors.get(userId);
    if (!userBehavior) return 50; // Neutral score

    // Find similar users based on behavior patterns
    const similarUsers = this.findSimilarUsers(userId, allUserBehaviors);
    
    let totalScore = 0;
    let weightSum = 0;

    for (const { userId: similarUserId, similarity } of similarUsers.slice(0, 5)) {
      const similarUserBehavior = allUserBehaviors.get(similarUserId);
      if (!similarUserBehavior) continue;

      // Check if similar user interacted with target
      let score = 50; // Neutral
      
      if (similarUserBehavior.likedProfiles.includes(targetUserId)) {
        score = 80;
      } else if (similarUserBehavior.acceptedConnections.includes(targetUserId)) {
        score = 90;
      } else if (similarUserBehavior.dislikedProfiles.includes(targetUserId)) {
        score = 20;
      } else if (similarUserBehavior.declinedConnections.includes(targetUserId)) {
        score = 10;
      }

      totalScore += score * similarity;
      weightSum += similarity;
    }

    return weightSum > 0 ? totalScore / weightSum : 50;
  }

  /**
   * Generate personalized conversation starters based on successful interactions
   */
  public generatePersonalizedStarters(
    userId: string,
    targetUser: UserProfile,
    userBehavior: UserBehavior,
    allUsers: UserProfile[]
  ): string[] {
    const starters: string[] = [];
    
    // Analyze successful conversation patterns
    const successfulConnections = this.getUsersFromIds(userBehavior.acceptedConnections, allUsers);
    
    if (successfulConnections.length > 0) {
      // Find common interests with successful connections
      const successfulInterests = successfulConnections.flatMap(user => [
        ...user.interests.hobbies,
        ...user.interests.islamicInterests,
      ]);
      
      const targetInterests = [
        ...targetUser.interests.hobbies,
        ...targetUser.interests.islamicInterests,
      ];
      
      const commonSuccessfulInterests = successfulInterests.filter(interest =>
        targetInterests.includes(interest)
      );
      
      if (commonSuccessfulInterests.length > 0) {
        const topInterest = this.getMostFrequent(commonSuccessfulInterests);
        starters.push(`I see you're interested in ${topInterest}! I've had great conversations about this with other sisters.`);
      }
    }

    // Add Islamic context if user tends to start with Islamic greetings
    if (this.userTendsToUseIslamicGreetings(userBehavior)) {
      starters.push("As-salamu alaykum sister! Your profile caught my attention. How has your day been?");
    }

    // Default personalized starter
    if (starters.length === 0) {
      starters.push("I'd love to connect with you! What inspired you to join SistersConnect?");
    }

    return starters.slice(0, 3);
  }

  /**
   * Calculate recommendation diversity to avoid filter bubbles
   */
  public calculateRecommendationDiversity(
    recommendations: MatchScore[],
    allUsers: UserProfile[]
  ): number {
    if (recommendations.length < 2) return 100;

    const recommendedUsers = recommendations.map(rec => 
      allUsers.find(user => user.personalInfo.id === rec.userId)
    ).filter(user => user !== undefined) as UserProfile[];

    // Calculate diversity across multiple dimensions
    const ageDiversity = this.calculateDimensionDiversity(
      recommendedUsers.map(user => user.personalInfo.age)
    );
    
    const locationDiversity = this.calculateDimensionDiversity(
      recommendedUsers.map(user => user.personalInfo.location.city)
    );
    
    const practiceDiversity = this.calculateDimensionDiversity(
      recommendedUsers.map(user => user.islamicProfile.practiceLevel)
    );

    return (ageDiversity + locationDiversity + practiceDiversity) / 3;
  }

  /**
   * Adjust match scores based on machine learning insights
   */
  public adjustScoresWithML(
    matches: MatchScore[],
    userId: string,
    userBehavior: UserBehavior,
    allUserBehaviors: Map<string, UserBehavior>
  ): MatchScore[] {
    return matches.map(match => {
      // Apply collaborative filtering bonus
      const cfScore = this.predictCompatibilityUsingCollaborativeFiltering(
        userId,
        match.userId,
        allUserBehaviors
      );
      
      const cfBonus = (cfScore - 50) * 0.2; // Max 10 point bonus/penalty
      
      // Apply behavior pattern matching
      const behaviorBonus = this.calculateBehaviorPatternBonus(match, userBehavior);
      
      const adjustedScore = Math.min(100, Math.max(0, 
        match.totalScore + cfBonus + behaviorBonus
      ));

      return {
        ...match,
        totalScore: adjustedScore,
        reasons: [
          ...match.reasons,
          ...(cfBonus > 2 ? ['Sisters with similar preferences also connected with this person'] : []),
          ...(behaviorBonus > 2 ? ['Matches your interaction patterns'] : []),
        ],
      };
    });
  }

  // Private helper methods

  private updatePreferencePatterns(
    userBehavior: UserBehavior,
    matchScore: MatchScore,
    interactionType: string
  ): void {
    // Update preferred age ranges based on positive interactions
    if (interactionType === 'like' || interactionType === 'accept') {
      // This would update the preferredAgeRanges array
      // Simplified for this implementation
    }
  }

  private getUsersFromIds(userIds: string[], allUsers: UserProfile[]): UserProfile[] {
    return userIds
      .map(id => allUsers.find(user => user.personalInfo.id === id))
      .filter(user => user !== undefined) as UserProfile[];
  }

  private countOccurrences<T>(array: T[]): { [key: string]: number } {
    return array.reduce((acc, item) => {
      const key = String(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private calculateBehaviorConsistency(userBehavior: UserBehavior): number {
    const totalInteractions = 
      userBehavior.likedProfiles.length +
      userBehavior.dislikedProfiles.length +
      userBehavior.acceptedConnections.length +
      userBehavior.declinedConnections.length;

    if (totalInteractions === 0) return 0;

    const positiveInteractions = 
      userBehavior.likedProfiles.length + userBehavior.acceptedConnections.length;

    const consistency = positiveInteractions / totalInteractions;
    return consistency * 100;
  }

  private findSimilarUsers(
    userId: string,
    allUserBehaviors: Map<string, UserBehavior>
  ): { userId: string; similarity: number }[] {
    const userBehavior = allUserBehaviors.get(userId);
    if (!userBehavior) return [];

    const similarities: { userId: string; similarity: number }[] = [];

    for (const [otherUserId, otherBehavior] of allUserBehaviors.entries()) {
      if (otherUserId === userId) continue;

      const similarity = this.calculateBehaviorSimilarity(userBehavior, otherBehavior);
      if (similarity > 0.3) { // Threshold for similarity
        similarities.push({ userId: otherUserId, similarity });
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  private calculateBehaviorSimilarity(
    behavior1: UserBehavior,
    behavior2: UserBehavior
  ): number {
    const likedSimilarity = calculateJaccardSimilarity(
      behavior1.likedProfiles,
      behavior2.likedProfiles
    ) / 100;

    const acceptedSimilarity = calculateJaccardSimilarity(
      behavior1.acceptedConnections,
      behavior2.acceptedConnections
    ) / 100;

    return (likedSimilarity + acceptedSimilarity) / 2;
  }

  private getMostFrequent<T>(array: T[]): T {
    const counts = this.countOccurrences(array);
    const maxCount = Math.max(...Object.values(counts));
    const mostFrequent = Object.keys(counts).find(key => counts[key] === maxCount);
    return mostFrequent as T;
  }

  private userTendsToUseIslamicGreetings(userBehavior: UserBehavior): boolean {
    // Simplified - in real implementation, would analyze message history
    return userBehavior.acceptedConnections.length > 2;
  }

  private calculateDimensionDiversity(values: (string | number)[]): number {
    const uniqueValues = new Set(values);
    return Math.min(100, (uniqueValues.size / values.length) * 100);
  }

  private calculateBehaviorPatternBonus(
    match: MatchScore,
    userBehavior: UserBehavior
  ): number {
    // Simplified pattern matching
    // In real implementation, would analyze complex patterns
    const hasConsistentBehavior = userBehavior.likedProfiles.length > 3;
    return hasConsistentBehavior ? 5 : 0;
  }
}