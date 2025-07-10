import { UserProfile, Connection, IslamicCommunity, CommunityEvent } from '../../types/user';
import { calculateDistance } from '../../utils/location';

/**
 * Social graph algorithm for finding connections through mutual friends
 * and community relationships
 */
export class SocialGraphAlgorithm {
  
  /**
   * Calculate social graph bonus score for a potential match
   */
  public calculateSocialGraphBonus(
    user1: UserProfile,
    user2: UserProfile,
    allConnections: Connection[],
    communities: IslamicCommunity[],
    events: CommunityEvent[]
  ): number {
    let bonus = 0;

    // Mutual connections bonus
    const mutualConnectionsBonus = this.calculateMutualConnectionsBonus(
      user1.personalInfo.id,
      user2.personalInfo.id,
      allConnections
    );
    bonus += mutualConnectionsBonus;

    // Community clustering bonus
    const communityBonus = this.calculateCommunityBonus(user1, user2, communities);
    bonus += communityBonus;

    // Event attendance bonus
    const eventBonus = this.calculateEventBonus(user1, user2, events);
    bonus += eventBonus;

    // Network density bonus (friends of friends)
    const networkBonus = this.calculateNetworkDensityBonus(
      user1.personalInfo.id,
      user2.personalInfo.id,
      allConnections
    );
    bonus += networkBonus;

    return Math.min(50, bonus); // Cap at 50 points bonus
  }

  /**
   * Find mutual connections between two users
   */
  public findMutualConnections(
    user1Id: string,
    user2Id: string,
    allConnections: Connection[]
  ): string[] {
    const user1Connections = this.getUserConnections(user1Id, allConnections);
    const user2Connections = this.getUserConnections(user2Id, allConnections);

    return user1Connections.filter(connectionId => 
      user2Connections.includes(connectionId)
    );
  }

  /**
   * Find friends of friends (second-degree connections)
   */
  public findFriendsOfFriends(
    userId: string,
    allConnections: Connection[]
  ): string[] {
    const directConnections = this.getUserConnections(userId, allConnections);
    const friendsOfFriends = new Set<string>();

    directConnections.forEach(friendId => {
      const friendsConnections = this.getUserConnections(friendId, allConnections);
      friendsConnections.forEach(friendOfFriendId => {
        // Don't include the original user or direct connections
        if (friendOfFriendId !== userId && !directConnections.includes(friendOfFriendId)) {
          friendsOfFriends.add(friendOfFriendId);
        }
      });
    });

    return Array.from(friendsOfFriends);
  }

  /**
   * Find users in the same Islamic communities
   */
  public findCommunityMembers(
    user: UserProfile,
    communities: IslamicCommunity[]
  ): string[] {
    const userCommunities = communities.filter(community =>
      community.members.includes(user.personalInfo.id)
    );

    const communityMembers = new Set<string>();
    userCommunities.forEach(community => {
      community.members.forEach(memberId => {
        if (memberId !== user.personalInfo.id) {
          communityMembers.add(memberId);
        }
      });
    });

    return Array.from(communityMembers);
  }

  /**
   * Find users who attended the same events
   */
  public findEventAttendees(
    user: UserProfile,
    events: CommunityEvent[]
  ): string[] {
    const userEvents = events.filter(event =>
      event.attendees.includes(user.personalInfo.id)
    );

    const eventAttendees = new Set<string>();
    userEvents.forEach(event => {
      event.attendees.forEach(attendeeId => {
        if (attendeeId !== user.personalInfo.id) {
          eventAttendees.add(attendeeId);
        }
      });
    });

    return Array.from(eventAttendees);
  }

  /**
   * Calculate community clustering score
   */
  public calculateCommunityClusteringScore(
    communities: IslamicCommunity[]
  ): { [communityId: string]: number } {
    const clusteringScores: { [communityId: string]: number } = {};

    communities.forEach(community => {
      // Calculate how tightly connected the community is
      const memberCount = community.members.length;
      if (memberCount < 2) {
        clusteringScores[community.id] = 0;
        return;
      }

      // This is a simplified clustering coefficient
      // In a real implementation, you'd analyze actual connections between members
      const maxPossibleConnections = (memberCount * (memberCount - 1)) / 2;
      const estimatedConnections = Math.min(maxPossibleConnections, memberCount * 3); // Assume each member has ~3 connections
      
      clusteringScores[community.id] = (estimatedConnections / maxPossibleConnections) * 100;
    });

    return clusteringScores;
  }

  /**
   * Recommend matches based on social graph analysis
   */
  public getRecommendationsByTrustPath(
    userId: string,
    allUsers: UserProfile[],
    allConnections: Connection[],
    communities: IslamicCommunity[],
    maxDistance: number = 3
  ): { userId: string; trustScore: number; path: string[] }[] {
    const recommendations: { userId: string; trustScore: number; path: string[] }[] = [];
    
    // Find friends of friends
    const friendsOfFriends = this.findFriendsOfFriends(userId, allConnections);
    
    friendsOfFriends.forEach(candidateId => {
      const trustPath = this.findShortestTrustPath(userId, candidateId, allConnections, maxDistance);
      if (trustPath.length > 0 && trustPath.length <= maxDistance) {
        const trustScore = this.calculateTrustScore(trustPath, allConnections);
        recommendations.push({
          userId: candidateId,
          trustScore,
          path: trustPath
        });
      }
    });

    // Sort by trust score
    return recommendations.sort((a, b) => b.trustScore - a.trustScore);
  }

  /**
   * Calculate influence score for users in the network
   */
  public calculateInfluenceScore(
    userId: string,
    allConnections: Connection[],
    communities: IslamicCommunity[],
    events: CommunityEvent[]
  ): number {
    let influenceScore = 0;

    // Connection count influence
    const connectionCount = this.getUserConnections(userId, allConnections).length;
    influenceScore += Math.min(50, connectionCount * 2);

    // Community leadership influence
    const leadCommunities = communities.filter(community => 
      community.members.includes(userId) && community.members.indexOf(userId) === 0 // Assume first member is leader
    );
    influenceScore += leadCommunities.length * 15;

    // Event organization influence
    const organizedEvents = events.filter(event => event.organizer === userId);
    influenceScore += organizedEvents.length * 10;

    // Community membership diversity
    const memberCommunities = communities.filter(community => 
      community.members.includes(userId)
    );
    influenceScore += Math.min(20, memberCommunities.length * 5);

    return Math.min(100, influenceScore);
  }

  // Private helper methods

  private calculateMutualConnectionsBonus(
    user1Id: string,
    user2Id: string,
    allConnections: Connection[]
  ): number {
    const mutualConnections = this.findMutualConnections(user1Id, user2Id, allConnections);
    
    // Each mutual connection gives 5 points, up to 25 points
    return Math.min(25, mutualConnections.length * 5);
  }

  private calculateCommunityBonus(
    user1: UserProfile,
    user2: UserProfile,
    communities: IslamicCommunity[]
  ): number {
    const user1Communities = communities.filter(community =>
      community.members.includes(user1.personalInfo.id)
    );
    
    const user2Communities = communities.filter(community =>
      community.members.includes(user2.personalInfo.id)
    );

    const sharedCommunities = user1Communities.filter(community =>
      user2Communities.some(c => c.id === community.id)
    );

    let bonus = 0;
    
    // Bonus for each shared community
    bonus += sharedCommunities.length * 8;
    
    // Extra bonus for smaller, more exclusive communities
    sharedCommunities.forEach(community => {
      if (community.members.length <= 20) {
        bonus += 5; // Bonus for small, tight-knit communities
      }
    });

    // Bonus for same mosque affiliation
    const samemosque = sharedCommunities.some(community => 
      community.mosqueAffiliation && 
      user1Communities.some(c => c.mosqueAffiliation === community.mosqueAffiliation)
    );
    if (samemosque) {
      bonus += 10;
    }

    return Math.min(20, bonus);
  }

  private calculateEventBonus(
    user1: UserProfile,
    user2: UserProfile,
    events: CommunityEvent[]
  ): number {
    const user1Events = events.filter(event =>
      event.attendees.includes(user1.personalInfo.id)
    );
    
    const user2Events = events.filter(event =>
      event.attendees.includes(user2.personalInfo.id)
    );

    const sharedEvents = user1Events.filter(event =>
      user2Events.some(e => e.id === event.id)
    );

    let bonus = 0;
    
    // Bonus for each shared event
    bonus += sharedEvents.length * 3;
    
    // Extra bonus for recent events (within last 6 months)
    const recentEvents = sharedEvents.filter(event => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return event.startDate >= sixMonthsAgo;
    });
    bonus += recentEvents.length * 2;

    return Math.min(15, bonus);
  }

  private calculateNetworkDensityBonus(
    user1Id: string,
    user2Id: string,
    allConnections: Connection[]
  ): number {
    const user1Connections = this.getUserConnections(user1Id, allConnections);
    const user2Connections = this.getUserConnections(user2Id, allConnections);
    
    // Calculate how well-connected their combined network is
    const combinedNetwork = new Set([...user1Connections, ...user2Connections]);
    let interconnections = 0;
    
    combinedNetwork.forEach(userId => {
      const userConnections = this.getUserConnections(userId, allConnections);
      const commonConnections = userConnections.filter(id => combinedNetwork.has(id));
      interconnections += commonConnections.length;
    });
    
    const networkSize = combinedNetwork.size;
    if (networkSize < 2) return 0;
    
    const maxPossibleConnections = (networkSize * (networkSize - 1)) / 2;
    const density = interconnections / maxPossibleConnections;
    
    return Math.min(10, density * 50); // Up to 10 points for network density
  }

  private getUserConnections(userId: string, allConnections: Connection[]): string[] {
    return allConnections
      .filter(connection => 
        connection.status === 'accepted' &&
        (connection.user1Id === userId || connection.user2Id === userId)
      )
      .map(connection => 
        connection.user1Id === userId ? connection.user2Id : connection.user1Id
      );
  }

  private findShortestTrustPath(
    startUserId: string,
    targetUserId: string,
    allConnections: Connection[],
    maxDistance: number
  ): string[] {
    // Simplified BFS implementation for finding shortest path
    const queue: { userId: string; path: string[] }[] = [{ userId: startUserId, path: [startUserId] }];
    const visited = new Set<string>([startUserId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.path.length > maxDistance) continue;
      
      if (current.userId === targetUserId) {
        return current.path;
      }

      const connections = this.getUserConnections(current.userId, allConnections);
      
      connections.forEach(connectionId => {
        if (!visited.has(connectionId)) {
          visited.add(connectionId);
          queue.push({
            userId: connectionId,
            path: [...current.path, connectionId]
          });
        }
      });
    }

    return []; // No path found
  }

  private calculateTrustScore(path: string[], allConnections: Connection[]): number {
    if (path.length <= 1) return 0;
    
    let trustScore = 100;
    
    // Decay trust score based on path length
    const decayFactor = 0.7;
    for (let i = 1; i < path.length; i++) {
      trustScore *= decayFactor;
    }
    
    // Consider the strength of connections in the path
    for (let i = 0; i < path.length - 1; i++) {
      const connection = allConnections.find(conn => 
        (conn.user1Id === path[i] && conn.user2Id === path[i + 1]) ||
        (conn.user1Id === path[i + 1] && conn.user2Id === path[i])
      );
      
      if (connection) {
        // Factor in how long the connection has existed
        const ageInDays = Math.floor((Date.now() - connection.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const stabilityMultiplier = Math.min(1.2, 1 + (ageInDays / 365) * 0.2); // 20% bonus per year
        trustScore *= stabilityMultiplier;
      }
    }
    
    return Math.min(100, trustScore);
  }
}