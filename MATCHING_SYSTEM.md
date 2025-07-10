# SistersConnect Intelligent Matching System

## Overview

The SistersConnect app features a comprehensive intelligent matching algorithm designed specifically for Muslim sisters to find compatible friends while respecting Islamic values and promoting meaningful connections.

## Core Features

### 1. Compatibility Scoring Algorithm
- **Interest-based matching**: Matches based on hobbies, activities, and Islamic interests
- **Location proximity**: Distance-based scoring with configurable radius
- **Age group compatibility**: Similar age ranges with weighted scoring
- **Language preferences**: Primary and secondary language matching
- **Islamic practice level**: Prayer frequency, hijab wearing, mosque attendance
- **Lifestyle factors**: Work/study status, family situation, availability

### 2. Preference Filtering System
- **Deal-breaker filters**: Hard requirements that must be met
- **Soft preferences**: Nice-to-have attributes with weighted scoring
- **Dynamic learning**: Adapts based on user interactions and feedback

### 3. Social Graph Algorithm
- **Mutual connections**: Friends of friends with higher weighting
- **Community clustering**: Finding sisters in similar Islamic communities
- **Activity-based connections**: Sisters who attend similar events or groups

### 4. Islamic Values Integration
- **Respectful matching**: Ensuring appropriate and modest connection approaches
- **Privacy-first**: Protecting personal information while enabling meaningful connections
- **Community guidelines**: Built-in Islamic etiquette and values

## Technical Architecture

### Core Components

1. **CompatibilityScorer**: Main algorithm for calculating compatibility scores
2. **PreferenceFilter**: Handles filtering and learning from user behavior
3. **SocialGraphAlgorithm**: Manages social network analysis and mutual connections
4. **MatchingService**: Orchestrates all algorithms and provides the main API

### File Structure

```
src/
├── matching/
│   ├── algorithms/
│   │   ├── compatibility-scorer.ts
│   │   └── social-graph.ts
│   └── filters/
│       └── preference-filter.ts
├── services/
│   └── matching-service.ts
├── types/
│   └── user.ts
├── utils/
│   ├── location.ts
│   └── scoring.ts
└── index.ts
```

## Usage Example

```typescript
import { SistersConnectMatching } from './src/index';

// Initialize the matching system
const matching = SistersConnectMatching.create();
const service = matching.getMatchingService();

// Create user profiles
const currentUser = SistersConnectMatching.createSampleProfile('user1');
const candidates = [
  SistersConnectMatching.createSampleProfile('user2'),
  SistersConnectMatching.createSampleProfile('user3'),
];

// Set preferences
const preferences = SistersConnectMatching.createDefaultPreferences();

// Find matches
const matches = await service.findMatches(currentUser, candidates, preferences);

// Generate conversation starters
const starters = service.generateConversationStarters(currentUser, matches[0]);
```

## Key Algorithms

### Compatibility Scoring

The compatibility score is calculated using multiple factors:

1. **Interest Compatibility** (weighted): Common hobbies, activities, and Islamic interests
2. **Location Proximity** (weighted): Distance-based with same-city bonus
3. **Age Compatibility** (weighted): Age difference with preferred range consideration
4. **Language Match** (fixed weight): Common languages with primary language bonus
5. **Islamic Compatibility** (weighted): Practice level, prayer frequency, hijab, mosque attendance
6. **Lifestyle Compatibility** (weighted): Work status, family status, availability overlap
7. **Social Graph Bonus**: Mutual connections and community relationships

### Special Features

- **Study Buddy Matching**: For Quran study, Arabic learning, Islamic knowledge
- **Mentorship Connections**: Experienced sisters with newcomers to Islam
- **Event Companion Finding**: For Islamic events, conferences, community gatherings
- **Professional Networking**: Career-focused connections within Islamic guidelines

### Islamic Values Considerations

- Higher weighting for Islamic practice compatibility
- Respect for hijab preferences
- Support for new Muslim sisters
- Emphasis on community and mutual connections
- Privacy-first approach
- Modest and respectful interaction guidelines

## Performance Features

- **Caching System**: Stores computed scores for 30-minute periods
- **Efficient Filtering**: Multi-stage filtering to reduce computation
- **Popularity Balancing**: Prevents always showing the same popular users
- **Time Decay**: Accounts for user activity recency

## Testing

The system includes comprehensive tests covering:

- Core compatibility scoring algorithms
- Preference filtering functionality
- Location and scoring utilities
- Integration testing of the main service
- Edge cases and error handling

Run tests with:
```bash
npm test
```

## Configuration

Default preferences are optimized for Islamic values:

```typescript
{
  ageRange: { min: 18, max: 65 },
  maxDistance: 50, // 50km radius
  softPreferences: {
    similarInterests: 0.8,
    similarAge: 0.6,
    sameCity: 0.4,
    similarPracticeLevel: 0.9, // High weight for Islamic compatibility
    similarLifestyle: 0.7,
  },
  specialFeatures: {
    studyBuddy: true,
    mentorship: true,
    eventCompanion: true,
    professionalNetworking: false,
  }
}
```

## Future Enhancements

- Machine learning behavior tracking
- A/B testing framework for algorithm optimization
- Advanced collaborative filtering
- Real-time match updates
- Enhanced privacy controls
- Community event integration