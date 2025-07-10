import { Location } from '../types/user';

/**
 * Calculate distance between two geographic locations using Haversine formula
 * @param loc1 First location
 * @param loc2 Second location
 * @returns Distance in kilometers
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(loc2.latitude - loc1.latitude);
  const dLon = toRadians(loc2.longitude - loc1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.latitude)) * Math.cos(toRadians(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if two locations are in the same city
 */
export function isSameCity(loc1: Location, loc2: Location): boolean {
  return loc1.city.toLowerCase() === loc2.city.toLowerCase() &&
         loc1.country.toLowerCase() === loc2.country.toLowerCase();
}

/**
 * Check if two locations are in the same timezone
 */
export function isSameTimezone(loc1: Location, loc2: Location): boolean {
  return loc1.timezone === loc2.timezone;
}

/**
 * Get timezone difference in hours
 */
export function getTimezoneOffset(loc1: Location, loc2: Location): number {
  // This is a simplified implementation
  // In a real app, you'd use a proper timezone library like moment-timezone
  const timezones: { [key: string]: number } = {
    'UTC': 0,
    'America/New_York': -5,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Europe/Istanbul': 3,
    'Asia/Dubai': 4,
    'Asia/Karachi': 5,
    'Asia/Dhaka': 6,
    'Asia/Jakarta': 7,
    'Asia/Tokyo': 9,
    'Australia/Sydney': 10,
  };

  const offset1 = timezones[loc1.timezone] || 0;
  const offset2 = timezones[loc2.timezone] || 0;
  
  return Math.abs(offset1 - offset2);
}