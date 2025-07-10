import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SistersConnectMatching } from './src/index';
import type { UserProfile, MatchScore } from './src/types/user';

const App = () => {
  const [matchingService] = useState(() => SistersConnectMatching.create());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize with a sample user profile
    const sampleUser = SistersConnectMatching.createSampleProfile('user1', {
      personalInfo: {
        id: 'user1',
        firstName: 'Aisha',
        age: 28,
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York',
          country: 'USA',
          timezone: 'America/New_York',
        },
        languages: ['English', 'Urdu'],
        secondaryLanguages: ['Arabic'],
      },
      interests: {
        hobbies: ['reading', 'cooking', 'calligraphy'],
        activities: ['volunteering', 'community service'],
        islamicInterests: ['Quran study', 'Islamic history', 'hadith study'],
        studyInterests: ['Arabic language', 'Islamic studies'],
        professionalInterests: ['healthcare', 'education'],
      },
    });
    setCurrentUser(sampleUser);
  }, []);

  const findMatches = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Create sample users to match against
      const sampleUsers: UserProfile[] = [
        SistersConnectMatching.createSampleProfile('user2', {
          personalInfo: {
            id: 'user2',
            firstName: 'Fatima',
            age: 26,
            location: {
              latitude: 40.7589,
              longitude: -73.9851,
              city: 'New York',
              country: 'USA',
              timezone: 'America/New_York',
            },
            languages: ['English', 'Arabic'],
          },
          interests: {
            hobbies: ['reading', 'painting'],
            activities: ['hiking', 'volunteering'],
            islamicInterests: ['Quran study', 'Arabic language'],
            studyInterests: ['Arabic language', 'Tafsir'],
            professionalInterests: ['technology', 'design'],
          },
        }),
        SistersConnectMatching.createSampleProfile('user3', {
          personalInfo: {
            id: 'user3',
            firstName: 'Khadija',
            age: 32,
            location: {
              latitude: 40.6782,
              longitude: -73.9442,
              city: 'Brooklyn',
              country: 'USA',
              timezone: 'America/New_York',
            },
            languages: ['English'],
            secondaryLanguages: ['French', 'Arabic'],
          },
          islamicProfile: {
            practiceLevel: 'advanced',
            prayerFrequency: 'always',
            hijabWearing: true,
            mosqueAttendance: 'daily',
            quranStudyInterest: true,
            islamicHistoryInterest: true,
            arabicLearningInterest: true,
            isNewMuslim: false,
          },
          interests: {
            hobbies: ['calligraphy', 'gardening'],
            activities: ['community service', 'teaching'],
            islamicInterests: ['Quran study', 'Islamic history', 'hadith study'],
            studyInterests: ['Islamic studies', 'Arabic language'],
            professionalInterests: ['education', 'nonprofit'],
          },
          lifestyle: {
            workStatus: 'working',
            studyStatus: 'part_time',
            familyStatus: 'married',
            hasChildren: true,
            numberOfChildren: 2,
            availability: 'limited',
            preferredMeetingTimes: ['weekend'],
          },
        }),
      ];

      const preferences = SistersConnectMatching.createDefaultPreferences();
      const foundMatches = await matchingService.getMatchingService().findMatches(
        currentUser,
        sampleUsers,
        preferences,
        { limit: 10 }
      );

      setMatches(foundMatches);
    } catch (error) {
      // Handle error silently for demo
    } finally {
      setLoading(false);
    }
  };

  const renderMatch = (match: MatchScore, index: number) => {
    return (
      <View key={match.userId} style={styles.matchCard}>
        <Text style={styles.matchTitle}>Match #{index + 1}</Text>
        <Text style={styles.matchScore}>
          Compatibility: {match.totalScore.toFixed(1)}%
        </Text>
        
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Compatibility Breakdown:</Text>
          <Text style={styles.breakdownItem}>
            🎯 Interests: {match.breakdown.interestCompatibility.toFixed(1)}%
          </Text>
          <Text style={styles.breakdownItem}>
            📍 Location: {match.breakdown.locationProximity.toFixed(1)}%
          </Text>
          <Text style={styles.breakdownItem}>
            👥 Age: {match.breakdown.ageCompatibility.toFixed(1)}%
          </Text>
          <Text style={styles.breakdownItem}>
            🕌 Islamic: {match.breakdown.islamicCompatibility.toFixed(1)}%
          </Text>
          <Text style={styles.breakdownItem}>
            💬 Language: {match.breakdown.languageMatch.toFixed(1)}%
          </Text>
        </View>

        {match.reasons.length > 0 && (
          <View style={styles.reasons}>
            <Text style={styles.reasonsTitle}>Why you might connect:</Text>
            {match.reasons.map((reason, idx) => (
              <Text key={idx} style={styles.reason}>
                • {reason}
              </Text>
            ))}
          </View>
        )}

        {match.specialFeatures.length > 0 && (
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Special Features:</Text>
            {match.specialFeatures.map((feature, idx) => (
              <Text key={idx} style={styles.feature}>
                ⭐ {feature}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>SistersConnect</Text>
          <Text style={styles.subtitle}>Intelligent Islamic Matching</Text>
          
          {currentUser && (
            <View style={styles.userInfo}>
              <Text style={styles.userText}>
                As-salamu alaykum, {currentUser.personalInfo.firstName}!
              </Text>
              <Text style={styles.userDetails}>
                📍 {currentUser.personalInfo.location.city} • 
                🕌 {currentUser.islamicProfile.practiceLevel} level • 
                👥 {currentUser.personalInfo.age} years old
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.findButton} 
          onPress={findMatches}
          disabled={loading || !currentUser}
        >
          <Text style={styles.findButtonText}>
            {loading ? 'Finding Matches...' : 'Find Compatible Sisters'}
          </Text>
        </TouchableOpacity>

        {matches.length > 0 && (
          <View style={styles.matchesContainer}>
            <Text style={styles.matchesTitle}>
              Found {matches.length} Compatible Sister{matches.length > 1 ? 's' : ''}
            </Text>
            {matches.map((match, index) => renderMatch(match, index))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with Islamic values and respect for privacy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafe',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#5d7c47',
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  userText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: '#5d7c47',
    textAlign: 'center',
  },
  findButton: {
    backgroundColor: '#4a7c59',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  findButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  matchesContainer: {
    marginBottom: 24,
  },
  matchesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 16,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 8,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a7c59',
    marginBottom: 12,
  },
  breakdown: {
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 8,
  },
  breakdownItem: {
    fontSize: 12,
    color: '#5d7c47',
    marginBottom: 2,
  },
  reasons: {
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 8,
  },
  reason: {
    fontSize: 12,
    color: '#5d7c47',
    marginBottom: 2,
  },
  features: {
    marginBottom: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 8,
  },
  feature: {
    fontSize: 12,
    color: '#4a7c59',
    marginBottom: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#8a9a8a',
    fontStyle: 'italic',
  },
});

export default App;
