import { 
  UserProfile, 
  MatchingPreferences, 
  MatchScore, 
  Connection,
  UserBehavior,
  IslamicCommunity,
  CommunityEvent
} from '../types/user';
import { CompatibilityScorer } from '../matching/algorithms/compatibility-scorer';
import { PreferenceFilter } from '../matching/filters/preference-filter';
import { SocialGraphAlgorithm } from '../matching/algorithms/social-graph';
import { applyTimeDecay, calculatePercentileRank, applyPopularityPenalty } from '../utils/scoring';

/**
 * Main matching service that orchestrates all matching algorithms
 * Provides intelligent, Islamic-values-based matching for SistersConnect
 */
export class MatchingService {
  private compatibilityScorer: CompatibilityScorer;
  private preferenceFilter: PreferenceFilter;
  private socialGraph: SocialGraphAlgorithm;
  private matchCache: Map<string, MatchScore[]>;
  private cacheExpiry: Map<string, number>;

  constructor() {
    this.compatibilityScorer = new CompatibilityScorer();
    this.preferenceFilter = new PreferenceFilter();
    this.socialGraph = new SocialGraphAlgorithm();
    this.matchCache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * Find the best matches for a user
   */
  public async findMatches(
    currentUser: UserProfile,
    allUsers: UserProfile[],
    preferences: MatchingPreferences,
    options: {
      allConnections?: Connection[];
      userBehavior?: UserBehavior;
      communities?: IslamicCommunity[];
      events?: CommunityEvent[];
      limit?: number;
      useCache?: boolean;
    } = {}
  ): Promise<MatchScore[]> {
    const {
      allConnections = [],
      userBehavior,
      communities = [],
      events = [],
      limit = 20,
      useCache = true
    } = options;

    const cacheKey = this.generateCacheKey(currentUser.personalInfo.id, preferences);
    
    // Check cache first
    if (useCache && this.isCacheValid(cacheKey)) {
      const cachedResults = this.matchCache.get(cacheKey);
      if (cachedResults) {
        return cachedResults.slice(0, limit);
      }
    }

    // Filter candidates based on preferences
    let candidates = allUsers.filter(user => 
      user.personalInfo.id !== currentUser.personalInfo.id
    );

    // Apply preference filters
    candidates = this.preferenceFilter.filterCandidates(
      currentUser,
      candidates,
      preferences,
      userBehavior
    );

    // Calculate compatibility scores
    const matches: MatchScore[] = [];
    
    for (const candidate of candidates) {
      // Calculate social graph bonus
      const socialGraphBonus = this.socialGraph.calculateSocialGraphBonus(
        currentUser,
        candidate,
        allConnections,
        communities,
        events
      );

      // Calculate compatibility score
      const matchScore = this.compatibilityScorer.calculateCompatibility(
        currentUser,
        candidate,
        preferences,
        socialGraphBonus
      );

      // Apply time decay for inactive users
      const daysSinceActive = Math.floor(
        (Date.now() - candidate.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      matchScore.totalScore = applyTimeDecay(matchScore.totalScore, daysSinceActive);

      // Apply popularity penalty to promote diversity
      const userPopularity = this.calculateUserPopularity(candidate.personalInfo.id, allConnections);
      matchScore.totalScore = applyPopularityPenalty(matchScore.totalScore, userPopularity);

      if (matchScore.totalScore > 0) {
        matches.push(matchScore);
      }
    }

    // Sort and rank matches
    const rankedMatches = this.rankMatches(matches, userBehavior);

    // Cache results
    if (useCache) {
      this.cacheResults(cacheKey, rankedMatches);
    }

    return rankedMatches.slice(0, limit);
  }

  /**
   * Find matches for specific features
   */
  public async findSpecialFeatureMatches(
    currentUser: UserProfile,
    allUsers: UserProfile[],
    featureType: 'studyBuddy' | 'mentorship' | 'eventCompanion' | 'professionalNetworking',
    preferences: MatchingPreferences,
    options: {
      allConnections?: Connection[];
      communities?: IslamicCommunity[];
      events?: CommunityEvent[];
      limit?: number;
    } = {}
  ): Promise<MatchScore[]> {
    const { allConnections = [], communities = [], events = [], limit = 10 } = options;

    // Filter candidates for the specific feature
    let candidates = this.preferenceFilter.applySpecialFeatureFilters(
      currentUser,
      allUsers,
      featureType
    );

    // Remove current user
    candidates = candidates.filter(user => 
      user.personalInfo.id !== currentUser.personalInfo.id
    );

    const matches: MatchScore[] = [];

    for (const candidate of candidates) {
      const socialGraphBonus = this.socialGraph.calculateSocialGraphBonus(
        currentUser,
        candidate,
        allConnections,
        communities,
        events
      );

      const matchScore = this.compatibilityScorer.calculateCompatibility(
        currentUser,
        candidate,
        preferences,
        socialGraphBonus
      );

      // Apply feature-specific scoring bonuses
      matchScore.totalScore += this.getFeatureSpecificBonus(
        currentUser,
        candidate,
        featureType
      );

      if (matchScore.totalScore > 0) {
        matches.push(matchScore);
      }
    }

    return matches
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  /**
   * Get recommendations based on collaborative filtering
   */
  public async getCollaborativeRecommendations(
    currentUser: UserProfile,
    allUsers: UserProfile[],
    allConnections: Connection[],
    userBehavior: UserBehavior,
    limit: number = 10
  ): Promise<{ userId: string; score: number; reason: string }[]> {
    const recommendations: { userId: string; score: number; reason: string }[] = [];

    // Find users with similar behavior patterns
    const similarUsers = this.findSimilarUsers(currentUser, allUsers, userBehavior, allConnections);

    for (const similarUser of similarUsers.slice(0, 5)) {
      // Find who similar users connected with
      const similarUserConnections = allConnections.filter(conn =>
        (conn.user1Id === similarUser.userId || conn.user2Id === similarUser.userId) &&
        conn.status === 'accepted'
      );

      for (const connection of similarUserConnections) {
        const connectedUserId = connection.user1Id === similarUser.userId 
          ? connection.user2Id 
          : connection.user1Id;

        // Skip if current user already connected or interacted
        if (userBehavior.acceptedConnections.includes(connectedUserId) ||
            userBehavior.declinedConnections.includes(connectedUserId) ||
            userBehavior.likedProfiles.includes(connectedUserId) ||
            userBehavior.dislikedProfiles.includes(connectedUserId)) {
          continue;
        }

        const existingRec = recommendations.find(r => r.userId === connectedUserId);
        if (existingRec) {
          existingRec.score += similarUser.similarityScore * 0.3;
        } else {
          recommendations.push({
            userId: connectedUserId,
            score: similarUser.similarityScore * 0.3,
            reason: `Sisters like you also connected with this person`
          });
        }
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate conversation starters for a match
   */
  public generateConversationStarters(
    user1: UserProfile,
    user2: UserProfile
  ): string[] {
    return this.preferenceFilter.generateConversationStarters(user1, user2);
  }

  /**
   * Update user preferences based on behavior
   */
  public updatePreferencesFromBehavior(
    currentPreferences: MatchingPreferences,
    userBehavior: UserBehavior,
    allUsers: UserProfile[]
  ): MatchingPreferences {
    return this.preferenceFilter.updatePreferencesFromBehavior(
      currentPreferences,
      userBehavior,
      allUsers
    );
  }

  /**
   * Get network analysis for a user
   */
  public getNetworkAnalysis(
    user: UserProfile,
    allConnections: Connection[],
    communities: IslamicCommunity[],
    events: CommunityEvent[]
  ): {
    connectionCount: number;
    mutualConnections: { [userId: string]: number };
    communityMemberships: number;
    influenceScore: number;
    networkDensity: number;
  } {
    const connectionCount = allConnections.filter(conn =>
      (conn.user1Id === user.personalInfo.id || conn.user2Id === user.personalInfo.id) &&
      conn.status === 'accepted'
    ).length;

    const mutualConnections: { [userId: string]: number } = {};
    // Calculate mutual connections with other users (simplified)

    const communityMemberships = communities.filter(community =>
      community.members.includes(user.personalInfo.id)
    ).length;

    const influenceScore = this.socialGraph.calculateInfluenceScore(
      user.personalInfo.id,
      allConnections,
      communities,
      events
    );

    const networkDensity = this.calculateNetworkDensity(user.personalInfo.id, allConnections);

    return {
      connectionCount,
      mutualConnections,
      communityMemberships,
      influenceScore,
      networkDensity
    };
  }

  /**
   * Clear cache for a user (call when user profile changes)
   */
  public clearCache(userId?: string): void {
    if (userId) {
      const keysToDelete = Array.from(this.matchCache.keys()).filter(key => 
        key.includes(userId)
      );
      keysToDelete.forEach(key => {
        this.matchCache.delete(key);
        this.cacheExpiry.delete(key);
      });
    } else {
      this.matchCache.clear();
      this.cacheExpiry.clear();
    }
  }

  // Private helper methods

  private rankMatches(matches: MatchScore[], userBehavior?: UserBehavior): MatchScore[] {
    // Calculate percentile ranks for additional context
    const scores = matches.map(m => m.totalScore);
    
    return matches
      .map(match => ({
        ...match,
        percentileRank: calculatePercentileRank(match.totalScore, scores)
      }))
      .sort((a, b) => {
        // Primary sort by total score
        if (Math.abs(a.totalScore - b.totalScore) > 5) {
          return b.totalScore - a.totalScore;
        }
        
        // Secondary sort by breakdown variety (more balanced matches first)
        const aVariety = this.calculateScoreVariety(a.breakdown);
        const bVariety = this.calculateScoreVariety(b.breakdown);
        
        return bVariety - aVariety;
      });
  }

  private calculateScoreVariety(breakdown: any): number {
    const scores = Object.values(breakdown) as number[];
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Lower variance = more balanced match
    return 100 - Math.sqrt(variance);
  }

  private findSimilarUsers(
    currentUser: UserProfile,
    allUsers: UserProfile[],
    userBehavior: UserBehavior,
    allConnections: Connection[]
  ): { userId: string; similarityScore: number }[] {
    const similarUsers: { userId: string; similarityScore: number }[] = [];

    for (const user of allUsers) {
      if (user.personalInfo.id === currentUser.personalInfo.id) continue;

      let similarity = 0;

      // Age similarity
      const ageDiff = Math.abs(currentUser.personalInfo.age - user.personalInfo.age);
      similarity += Math.max(0, 20 - ageDiff);

      // Location similarity
      if (currentUser.personalInfo.location.city === user.personalInfo.location.city) {
        similarity += 15;
      }

      // Islamic practice similarity
      if (currentUser.islamicProfile.practiceLevel === user.islamicProfile.practiceLevel) {
        similarity += 10;
      }

      // Interest overlap
      const interestOverlap = currentUser.interests.hobbies.filter(hobby =>
        user.interests.hobbies.includes(hobby)
      ).length;
      similarity += interestOverlap * 2;

      if (similarity > 20) {
        similarUsers.push({
          userId: user.personalInfo.id,
          similarityScore: similarity
        });
      }
    }

    return similarUsers.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  private calculateUserPopularity(userId: string, allConnections: Connection[]): number {
    const recentConnections = allConnections.filter(conn => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return (conn.user1Id === userId || conn.user2Id === userId) &&
             conn.status === 'accepted' &&
             conn.acceptedAt &&
             conn.acceptedAt >= thirtyDaysAgo;
    });

    return recentConnections.length;
  }

  private getFeatureSpecificBonus(
    user1: UserProfile,
    user2: UserProfile,
    featureType: string
  ): number {
    switch (featureType) {
      case 'studyBuddy':
        const studyOverlap = user1.interests.studyInterests.filter(interest =>
          user2.interests.studyInterests.includes(interest)
        ).length;
        return studyOverlap * 5;

      case 'mentorship':
        if (user1.islamicProfile.isNewMuslim !== user2.islamicProfile.isNewMuslim) {
          return 15; // Bonus for potential mentorship
        }
        return 0;

      case 'eventCompanion':
        if (user1.personalInfo.location.city === user2.personalInfo.location.city) {
          return 10; // Same city bonus for events
        }
        return 0;

      case 'professionalNetworking':
        const professionalOverlap = user1.interests.professionalInterests.filter(interest =>
          user2.interests.professionalInterests.includes(interest)
        ).length;
        return professionalOverlap * 3;

      default:
        return 0;
    }
  }

  private generateCacheKey(userId: string, preferences: MatchingPreferences): string {
    const prefsHash = JSON.stringify(preferences);
    return `${userId}_${this.hashString(prefsHash).slice(0, 20)}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    if (!expiry) return false;
    
    return Date.now() < expiry;
  }

  private cacheResults(cacheKey: string, results: MatchScore[]): void {
    const cacheExpiryTime = Date.now() + (30 * 60 * 1000); // 30 minutes
    this.matchCache.set(cacheKey, results);
    this.cacheExpiry.set(cacheKey, cacheExpiryTime);
  }

  private calculateNetworkDensity(userId: string, allConnections: Connection[]): number {
    const userConnections = allConnections.filter(conn =>
      (conn.user1Id === userId || conn.user2Id === userId) &&
      conn.status === 'accepted'
    );

    if (userConnections.length < 2) return 0;

    // Simplified network density calculation
    const connectionCount = userConnections.length;
    const maxPossibleConnections = (connectionCount * (connectionCount - 1)) / 2;
    
    return Math.min(100, (connectionCount / maxPossibleConnections) * 100);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}