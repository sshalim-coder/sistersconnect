// Types for the SistersConnect Video Platform

export interface VideoStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  isFollowing: boolean;
  followerCount?: number;
  bio?: string;
}

export type VideoCategory = 
  | 'quran' 
  | 'reminder' 
  | 'friendship' 
  | 'learning' 
  | 'community' 
  | 'hijab' 
  | 'cooking'
  | 'nasheed'
  | 'dua'
  | 'hadith';

export interface VideoData {
  id: string;
  uri: string;
  thumbnail: string;
  title: string;
  description: string;
  creator: Creator;
  stats: VideoStats;
  hashtags: string[];
  category: VideoCategory;
  duration: number; // in seconds
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  location?: string;
  language?: 'ar' | 'en' | 'ur' | 'tr' | 'fr' | 'id'; // Islamic language support
  isEducational?: boolean;
  ageAppropriate?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'rejected';
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  isVerified?: boolean;
}

export interface VideoCollection {
  id: string;
  name: string;
  description: string;
  videoIds: string[];
  isPrivate: boolean;
  createdAt: string;
}

export interface UserPreferences {
  preferredLanguages: string[];
  preferredCategories: VideoCategory[];
  contentFilters: {
    educationalOnly: boolean;
    verifiedCreatorsOnly: boolean;
    localCommunityOnly: boolean;
  };
  notificationSettings: {
    newFollowerVideos: boolean;
    likedVideoComments: boolean;
    weeklyIslamicReminders: boolean;
  };
}

export interface ReportReason {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const REPORT_REASONS: ReportReason[] = [
  {
    id: 'inappropriate',
    title: 'Inappropriate Content',
    description: 'Content that violates Islamic guidelines',
    severity: 'high',
  },
  {
    id: 'spam',
    title: 'Spam',
    description: 'Repetitive or promotional content',
    severity: 'medium',
  },
  {
    id: 'harassment',
    title: 'Harassment',
    description: 'Content that targets or harasses individuals',
    severity: 'critical',
  },
  {
    id: 'misinformation',
    title: 'False Islamic Information',
    description: 'Incorrect Islamic teachings or facts',
    severity: 'high',
  },
  {
    id: 'copyright',
    title: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
    severity: 'medium',
  },
];

export const ISLAMIC_CATEGORIES = {
  quran: {
    name: 'Quran Recitation',
    icon: '📖',
    color: '#2D5016',
    description: 'Beautiful Quranic recitations and explanations',
  },
  reminder: {
    name: 'Islamic Reminders',
    icon: '💫',
    color: '#8B4513',
    description: 'Daily hadith, Islamic quotes, and spiritual motivation',
  },
  friendship: {
    name: 'Sisterhood',
    icon: '💕',
    color: '#E91E63',
    description: 'Sisters sharing halal activities and bonding moments',
  },
  learning: {
    name: 'Islamic Learning',
    icon: '🎓',
    color: '#673AB7',
    description: 'Arabic lessons, Islamic history, and fiqh explanations',
  },
  community: {
    name: 'Community Events',
    icon: '🕌',
    color: '#2196F3',
    description: 'Mosque activities, Islamic conferences, and gatherings',
  },
  hijab: {
    name: 'Modest Fashion',
    icon: '👗',
    color: '#9C27B0',
    description: 'Hijab tutorials and modest fashion inspiration',
  },
  cooking: {
    name: 'Halal Cooking',
    icon: '🍽️',
    color: '#FF9800',
    description: 'Halal recipes and traditional Islamic foods',
  },
  nasheed: {
    name: 'Islamic Music',
    icon: '🎵',
    color: '#4CAF50',
    description: 'Beautiful nasheeds and Islamic songs',
  },
  dua: {
    name: 'Duas & Supplications',
    icon: '🤲',
    color: '#795548',
    description: 'Daily duas and their meanings',
  },
  hadith: {
    name: 'Hadith Wisdom',
    icon: '📜',
    color: '#607D8B',
    description: 'Prophetic teachings and their applications',
  },
};

export const ISLAMIC_HASHTAGS = [
  '#IslamicReminder',
  '#SisterhoodGoals',
  '#QuranDaily',
  '#HijabStyle',
  '#IslamicLearning',
  '#MuslimSisters',
  '#HalalLife',
  '#IslamicMotivation',
  '#DuaRequest',
  '#MosqueCommunity',
  '#IslamicWisdom',
  '#ModestFashion',
  '#Ramadan',
  '#Eid',
  '#IslamicArt',
  '#ArabicLearning',
  '#IslamicHistory',
  '#ProphetMuhammad',
  '#IslamicQuotes',
  '#MuslimWomen',
];

// Color scheme for Islamic theming
export const ISLAMIC_COLORS = {
  primary: '#2D5016', // Deep Islamic green
  secondary: '#8B4513', // Islamic brown
  gold: '#FFD700', // Islamic gold
  background: '#0F172A', // Dark background for videos
  overlay: 'rgba(0, 0, 0, 0.3)',
  white: '#FFFFFF',
  text: '#E2E8F0',
  textSecondary: '#94A3B8',
  heart: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#DC2626',
  gradient: ['#2D5016', '#8B4513', '#FFD700'],
};