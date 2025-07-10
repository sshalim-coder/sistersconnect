// Core user profile types for the SistersConnect matching system

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export interface IslamicProfile {
  practiceLevel: 'beginner' | 'intermediate' | 'advanced' | 'scholar';
  prayerFrequency: 'rarely' | 'sometimes' | 'regularly' | 'always';
  hijabWearing: boolean;
  mosqueAttendance: 'never' | 'occasionally' | 'weekly' | 'daily';
  quranStudyInterest: boolean;
  islamicHistoryInterest: boolean;
  arabicLearningInterest: boolean;
  isNewMuslim: boolean;
  yearsInIslam?: number;
}

export interface PersonalInfo {
  id: string;
  firstName: string;
  age: number;
  location: Location;
  languages: string[];
  secondaryLanguages?: string[];
}

export interface Interests {
  hobbies: string[];
  activities: string[];
  islamicInterests: string[];
  studyInterests: string[];
  professionalInterests: string[];
}

export interface Lifestyle {
  workStatus: 'student' | 'working' | 'homemaker' | 'retired' | 'unemployed';
  studyStatus: 'not_studying' | 'part_time' | 'full_time';
  familyStatus: 'single' | 'married' | 'married_with_children' | 'widowed';
  hasChildren: boolean;
  numberOfChildren?: number;
  availability: 'very_limited' | 'limited' | 'moderate' | 'flexible' | 'very_flexible';
  preferredMeetingTimes: ('morning' | 'afternoon' | 'evening' | 'weekend')[];
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  islamicProfile: IslamicProfile;
  interests: Interests;
  lifestyle: Lifestyle;
  createdAt: Date;
  lastActive: Date;
  verified: boolean;
}

export interface MatchingPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number; // in kilometers
  requiredLanguages: string[];
  dealBreakers: {
    differentPracticeLevel?: boolean;
    noHijab?: boolean;
    differentFamilyStatus?: boolean;
    tooFarDistance?: boolean;
  };
  softPreferences: {
    similarInterests: number; // weight 0-1
    similarAge: number; // weight 0-1
    sameCity: number; // weight 0-1
    similarPracticeLevel: number; // weight 0-1
    similarLifestyle: number; // weight 0-1
  };
  specialFeatures: {
    studyBuddy: boolean;
    mentorship: boolean;
    eventCompanion: boolean;
    professionalNetworking: boolean;
  };
}

export interface MatchScore {
  userId: string;
  totalScore: number;
  breakdown: {
    interestCompatibility: number;
    locationProximity: number;
    ageCompatibility: number;
    languageMatch: number;
    islamicCompatibility: number;
    lifestyleCompatibility: number;
    socialGraphBonus: number;
  };
  reasons: string[];
  specialFeatures: string[];
}

export interface Connection {
  id: string;
  user1Id: string;
  user2Id: string;
  initiatedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  matchScore: number;
  createdAt: Date;
  acceptedAt?: Date;
  lastInteraction?: Date;
  conversationStarters?: string[];
}

export interface UserBehavior {
  userId: string;
  likedProfiles: string[];
  dislikedProfiles: string[];
  acceptedConnections: string[];
  declinedConnections: string[];
  reportedUsers: string[];
  preferredAgeRanges: number[];
  preferredDistances: number[];
  interactionPatterns: {
    responseTime: number; // in minutes
    messageFrequency: number; // messages per day
    activeHours: number[]; // array of hours 0-23
  };
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: 'religious' | 'educational' | 'social' | 'professional' | 'charity';
  location: Location;
  startDate: Date;
  endDate: Date;
  attendees: string[]; // user IDs
  organizer: string; // user ID
}

export interface IslamicCommunity {
  id: string;
  name: string;
  location: Location;
  members: string[]; // user IDs
  mosqueAffiliation?: string;
  activities: string[];
  establishedYear?: number;
}