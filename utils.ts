// Utility functions for the SistersConnect Video Platform

import { VideoData, VideoCategory, ISLAMIC_CATEGORIES } from './types';

/**
 * Format large numbers with K/M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Format video duration from seconds to MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get category icon and metadata
 */
export const getCategoryData = (category: VideoCategory) => {
  return ISLAMIC_CATEGORIES[category] || {
    name: 'Islamic Content',
    icon: '✨',
    color: '#2D5016',
    description: 'Islamic content for sisters',
  };
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 604800)}w ago`;
};

/**
 * Extract hashtags from text
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[\w\u0621-\u064A]+/g;
  return text.match(hashtagRegex) || [];
};

/**
 * Islamic content filter - checks if content meets Islamic guidelines
 */
export const isContentAppropriate = (video: VideoData): boolean => {
  // Basic content appropriateness checks
  const inappropriateKeywords = [
    'dating', 'boyfriend', 'girlfriend', 'alcohol', 'gambling'
  ];
  
  const text = `${video.title} ${video.description}`.toLowerCase();
  
  for (const keyword of inappropriateKeywords) {
    if (text.includes(keyword)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Generate Islamic greeting based on time of day
 */
export const getIslamicGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Assalamu Alaikum! Good morning, sister 🌅';
  if (hour < 18) return 'Assalamu Alaikum! Good afternoon, sister ☀️';
  return 'Assalamu Alaikum! Good evening, sister 🌙';
};

/**
 * Islamic prayer time notifications
 */
export const getPrayerTimeMessage = (): string | null => {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  
  // Simplified prayer time checks (would normally use proper calculation)
  if (hour === 5 && minute < 30) return 'Time for Fajr prayer 🕌';
  if (hour === 12 && minute < 30) return 'Time for Dhuhr prayer 🕌';
  if (hour === 15 && minute < 30) return 'Time for Asr prayer 🕌';
  if (hour === 18 && minute < 30) return 'Time for Maghrib prayer 🕌';
  if (hour === 20 && minute < 30) return 'Time for Isha prayer 🕌';
  
  return null;
};

/**
 * Generate daily Islamic reminder
 */
export const getDailyReminder = (): string => {
  const reminders = [
    "Remember to recite Surah Al-Fatiha today 📖",
    "Don't forget to make du'a for your sisters 🤲",
    "Practice gratitude - Alhamdulillah for everything 💫",
    "Send peace and blessings upon Prophet Muhammad (PBUH) ﷺ",
    "Remember Allah often - SubhanAllah, Alhamdulillah, Allahu Akbar 💎",
    "Be kind to your parents today - Jannah lies at their feet 💕",
    "Seek knowledge - it's every Muslim's duty 📚",
    "Give charity, even if it's just a smile 😊",
    "Make time for dhikr today 🌟",
    "Read the Quran with reflection and understanding 🌙",
  ];
  
  const today = new Date().getDate();
  return reminders[today % reminders.length];
};

/**
 * Validate if text contains appropriate Islamic content
 */
export const validateIslamicContent = (text: string): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Check for inappropriate content
  const inappropriateTerms = ['haram', 'dating', 'boyfriend', 'alcohol'];
  inappropriateTerms.forEach(term => {
    if (lowerText.includes(term)) {
      issues.push(`Content may contain inappropriate term: ${term}`);
    }
  });
  
  // Check for positive Islamic content
  const islamicTerms = ['allah', 'islam', 'muslim', 'quran', 'prophet', 'hadith', 'dua'];
  const hasIslamicContent = islamicTerms.some(term => lowerText.includes(term));
  
  if (!hasIslamicContent && text.length > 50) {
    issues.push('Content should include Islamic themes or references');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Generate suggested hashtags based on content
 */
export const suggestHashtags = (title: string, description: string, category: VideoCategory): string[] => {
  const content = `${title} ${description}`.toLowerCase();
  const suggestions: string[] = [];
  
  // Category-based suggestions
  const categoryData = getCategoryData(category);
  switch (category) {
    case 'quran':
      suggestions.push('#QuranDaily', '#IslamicReminder', '#Recitation');
      break;
    case 'friendship':
      suggestions.push('#SisterhoodGoals', '#MuslimSisters', '#IslamicFriendship');
      break;
    case 'hijab':
      suggestions.push('#HijabStyle', '#ModestFashion', '#IslamicFashion');
      break;
    case 'cooking':
      suggestions.push('#HalalFood', '#IslamicCooking', '#MuslimKitchen');
      break;
    case 'learning':
      suggestions.push('#IslamicLearning', '#IslamicEducation', '#IslamicKnowledge');
      break;
    default:
      suggestions.push('#IslamicContent', '#MuslimCommunity');
  }
  
  // Content-based suggestions
  if (content.includes('ramadan')) suggestions.push('#Ramadan');
  if (content.includes('eid')) suggestions.push('#Eid');
  if (content.includes('dua')) suggestions.push('#Dua');
  if (content.includes('hadith')) suggestions.push('#Hadith');
  if (content.includes('mosque')) suggestions.push('#Mosque');
  if (content.includes('prayer')) suggestions.push('#Prayer');
  
  return [...new Set(suggestions)].slice(0, 5); // Remove duplicates and limit to 5
};

/**
 * Calculate content engagement score for algorithm
 */
export const calculateEngagementScore = (video: VideoData): number => {
  const { likes, comments, shares, views } = video.stats;
  
  if (views === 0) return 0;
  
  const likeRatio = likes / views;
  const commentRatio = comments / views;
  const shareRatio = shares / views;
  
  // Weighted scoring
  const score = (likeRatio * 0.4) + (commentRatio * 0.3) + (shareRatio * 0.3);
  
  return Math.min(score * 100, 100); // Cap at 100
};

/**
 * Islamic date converter (simplified)
 */
export const getIslamicDate = (): string => {
  // This is a simplified version - real implementation would use proper Hijri calendar
  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  const now = new Date();
  const month = islamicMonths[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear() - 579; // Approximate conversion
  
  return `${day} ${month} ${year} AH`;
};

/**
 * Check if current time is during Ramadan (simplified)
 */
export const isRamadanPeriod = (): boolean => {
  // This is a simplified check - real implementation would use proper Islamic calendar
  const now = new Date();
  const month = now.getMonth();
  
  // Approximate Ramadan timing (varies each year)
  return month === 3 || month === 4; // April-May approximation
};

/**
 * Generate content recommendation reasons
 */
export const getRecommendationReason = (video: VideoData): string => {
  const reasons = [
    `Popular in ${getCategoryData(video.category).name}`,
    `From ${video.creator.displayName}`,
    `Trending in your community`,
    `Recommended for Islamic learning`,
    `Popular among Muslim sisters`,
    `Educational Islamic content`,
  ];
  
  // Return random reason for demo purposes
  return reasons[Math.floor(Math.random() * reasons.length)];
};