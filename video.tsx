import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  SafeAreaView,
  Image,
  TextInput,
  Modal,
  Alert,
  I18nManager,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { VideoData, ISLAMIC_COLORS } from './types';
import { 
  formatNumber, 
  formatDuration, 
  getCategoryData, 
  formatRelativeTime,
  getIslamicGreeting,
  getDailyReminder 
} from './utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock data for demonstration
const MOCK_VIDEOS: VideoData[] = [
  {
    id: '1',
    uri: 'https://example.com/video1.mp4',
    thumbnail: 'https://example.com/thumb1.jpg',
    title: 'Beautiful Quran Recitation',
    description: 'Surah Al-Fatiha with English translation 🤲',
    creator: {
      id: 'sister1',
      username: '@aisha_recites',
      displayName: 'Sister Aisha',
      avatar: 'https://example.com/avatar1.jpg',
      isVerified: true,
      isFollowing: false,
    },
    stats: { likes: 1247, comments: 89, shares: 156, views: 5430 },
    hashtags: ['#QuranDaily', '#IslamicReminder', '#Recitation'],
    category: 'quran',
    duration: 180,
    isLiked: false,
    isSaved: false,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    uri: 'https://example.com/video2.mp4',
    thumbnail: 'https://example.com/thumb2.jpg',
    title: 'Sisterhood Goals',
    description: 'Making new friends at the mosque! 💕',
    creator: {
      id: 'sister2',
      username: '@fatima_connects',
      displayName: 'Sister Fatima',
      avatar: 'https://example.com/avatar2.jpg',
      isVerified: false,
      isFollowing: true,
    },
    stats: { likes: 892, comments: 127, shares: 78, views: 3210 },
    hashtags: ['#SisterhoodGoals', '#MosqueFriends', '#Community'],
    category: 'friendship',
    duration: 95,
    isLiked: true,
    isSaved: false,
    createdAt: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    uri: 'https://example.com/video3.mp4',
    thumbnail: 'https://example.com/thumb3.jpg',
    title: 'Hijab Tutorial',
    description: 'Easy and elegant hijab style for beginners ✨',
    creator: {
      id: 'sister3',
      username: '@modest_fashion',
      displayName: 'Sister Zainab',
      avatar: 'https://example.com/avatar3.jpg',
      isVerified: true,
      isFollowing: false,
    },
    stats: { likes: 2156, comments: 234, shares: 445, views: 8760 },
    hashtags: ['#HijabTutorial', '#ModestFashion', '#IslamicStyle'],
    category: 'hijab',
    duration: 120,
    isLiked: false,
    isSaved: true,
    createdAt: '2024-01-13T09:15:00Z',
  },
];

interface VideoPlayerProps {
  video: VideoData;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onFollow: () => void;
  onReport: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  onLike,
  onComment,
  onShare,
  onSave,
  onFollow,
  onReport,
}) => {
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsPlaying(isActive);
    if (isActive) {
      // Simulate video progress
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, video.duration * 10);
      return () => clearInterval(interval);
    }
  }, [isActive, video.duration]);

  useEffect(() => {
    // Check for screen reader accessibility
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);
    
    // Listen for RTL layout changes
    const subscription = I18nManager.addEventListener ? 
      I18nManager.addEventListener('localeIdentifierDidChange', () => {
        setIsRTL(I18nManager.isRTL);
      }) : null;
    
    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  const handleDoubleTap = useCallback(() => {
    onLike();
    // Animate heart
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [onLike, likeAnimation]);

  const handleSingleTap = useCallback(() => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
    
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = getCategoryData(category as any);
    return categoryData.icon;
  };

  return (
    <View style={styles.videoContainer}>
      {/* Video Background - Using placeholder */}
      <View style={styles.videoBackground}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoPlaceholderText}>
            {getCategoryIcon(video.category)} Video Player
          </Text>
          <Text style={styles.videoTitle}>{video.title}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Play/Pause Overlay */}
      {showControls && (
        <TouchableOpacity 
          style={styles.playPauseOverlay} 
          onPress={handleSingleTap}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
          accessibilityRole="button"
          accessibilityHint={`${isPlaying ? 'Pauses' : 'Plays'} the current video`}
        >
          <View style={styles.playPauseIcon}>
            <Text style={styles.playPauseText}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Double Tap Area for Like */}
      <TouchableOpacity
        style={styles.doubleTapArea}
        onPress={handleSingleTap}
        onLongPress={handleDoubleTap}
        activeOpacity={1}
        accessible={screenReaderEnabled}
        accessibilityLabel="Double tap to like video"
        accessibilityRole="button"
      >
        <Animated.View
          style={[
            styles.likeAnimation,
            {
              opacity: likeAnimation,
              transform: [
                {
                  scale: likeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1.5],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.likeAnimationText}>❤️</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Right Side Actions */}
      <View style={[styles.rightActions, isRTL && styles.leftActions]}>
        {/* Creator Avatar */}
        <TouchableOpacity 
          style={styles.creatorAvatar} 
          onPress={onFollow}
          accessible={true}
          accessibilityLabel={`${video.creator.displayName}'s profile`}
          accessibilityRole="button"
          accessibilityHint={video.creator.isFollowing ? 'Already following this creator' : 'Tap to follow this creator'}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          {!video.creator.isFollowing && (
            <View style={styles.followButton}>
              <Text style={styles.followButtonText}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onLike}
          accessible={true}
          accessibilityLabel={`${video.isLiked ? 'Unlike' : 'Like'} video`}
          accessibilityRole="button"
          accessibilityHint={`This video has ${formatNumber(video.stats.likes)} likes`}
        >
          <Text style={[styles.actionIcon, { color: video.isLiked ? ISLAMIC_COLORS.heart : ISLAMIC_COLORS.white }]}>
            {video.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionCount}>{formatNumber(video.stats.likes)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onComment}
          accessible={true}
          accessibilityLabel="View comments"
          accessibilityRole="button"
          accessibilityHint={`This video has ${formatNumber(video.stats.comments)} comments`}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{formatNumber(video.stats.comments)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onShare}
          accessible={true}
          accessibilityLabel="Share video"
          accessibilityRole="button"
          accessibilityHint={`This video has been shared ${formatNumber(video.stats.shares)} times`}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionCount}>{formatNumber(video.stats.shares)}</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onSave}
          accessible={true}
          accessibilityLabel={video.isSaved ? 'Remove from saved' : 'Save video'}
          accessibilityRole="button"
          accessibilityHint={video.isSaved ? 'This video is saved to your collection' : 'Tap to save this video'}
        >
          <Text style={[styles.actionIcon, { color: video.isSaved ? ISLAMIC_COLORS.gold : ISLAMIC_COLORS.white }]}>
            {video.isSaved ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>

        {/* More Actions */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onReport}
          accessible={true}
          accessibilityLabel="Report content"
          accessibilityRole="button"
          accessibilityHint="Report this video if it violates community guidelines"
        >
          <Text style={styles.actionIcon}>⚠️</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={[styles.bottomInfo, isRTL && styles.bottomInfoRTL]}>
        <View style={styles.creatorInfo}>
          <View style={[styles.creatorNameRow, isRTL && styles.creatorNameRowRTL]}>
            <Text style={[styles.creatorName, isRTL && styles.textRTL]}>
              {video.creator.displayName}
              {video.creator.isVerified && <Text style={styles.verifiedIcon}> ✅</Text>}
            </Text>
            <Text style={[styles.username, isRTL && styles.textRTL]}>{video.creator.username}</Text>
          </View>
          <Text 
            style={[styles.description, isRTL && styles.textRTL]}
            accessible={true}
            accessibilityLabel={`Video description: ${video.description}`}
          >
            {video.description}
          </Text>
          
          {/* Hashtags */}
          <View style={[styles.hashtagContainer, isRTL && styles.hashtagContainerRTL]}>
            {video.hashtags.map((hashtag, index) => (
              <Text 
                key={index} 
                style={[styles.hashtag, isRTL && styles.textRTL]}
                accessible={true}
                accessibilityLabel={`Hashtag ${hashtag}`}
              >
                {hashtag}
              </Text>
            ))}
          </View>
        </View>

        {/* Sound Control */}
        <TouchableOpacity 
          style={styles.soundButton} 
          onPress={() => setIsMuted(!isMuted)}
          accessible={true}
          accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
          accessibilityRole="button"
          accessibilityHint={`Video is currently ${isMuted ? 'muted' : 'unmuted'}`}
        >
          <Text style={styles.soundIcon}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ForYouPageProps {
  videos?: VideoData[];
}

const ForYouPage: React.FC<ForYouPageProps> = ({ videos = MOCK_VIDEOS }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoData, setVideoData] = useState(videos);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 && currentIndex > 0) {
          // Swipe down - previous video
          const newIndex = currentIndex - 1;
          setCurrentIndex(newIndex);
          scrollViewRef.current?.scrollTo({ y: newIndex * SCREEN_HEIGHT, animated: true });
        } else if (gestureState.dy < -50 && currentIndex < videoData.length - 1) {
          // Swipe up - next video
          const newIndex = currentIndex + 1;
          setCurrentIndex(newIndex);
          scrollViewRef.current?.scrollTo({ y: newIndex * SCREEN_HEIGHT, animated: true });
        }
      },
    })
  ).current;

  const handleLike = useCallback((videoId: string) => {
    setVideoData(prev => prev.map(video => 
      video.id === videoId 
        ? { 
            ...video, 
            isLiked: !video.isLiked,
            stats: { 
              ...video.stats, 
              likes: video.isLiked ? video.stats.likes - 1 : video.stats.likes + 1 
            }
          }
        : video
    ));
  }, []);

  const handleSave = useCallback((videoId: string) => {
    setVideoData(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, isSaved: !video.isSaved }
        : video
    ));
  }, []);

  const handleFollow = useCallback((creatorId: string) => {
    setVideoData(prev => prev.map(video => 
      video.creator.id === creatorId 
        ? { 
            ...video, 
            creator: { ...video.creator, isFollowing: !video.creator.isFollowing }
          }
        : video
    ));
  }, []);

  const handleComment = useCallback(() => {
    setShowComments(true);
  }, []);

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const handleReport = useCallback(() => {
    Alert.alert(
      'Report Content',
      'Please select a reason for reporting this content:',
      [
        { text: 'Inappropriate Content', onPress: () => console.log('Reported: Inappropriate') },
        { text: 'Spam', onPress: () => console.log('Reported: Spam') },
        { text: 'Harassment', onPress: () => console.log('Reported: Harassment') },
        { text: 'False Information', onPress: () => console.log('Reported: False Info') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessible={true} accessibilityRole="header">
          {getIslamicGreeting().split('!')[0]}
        </Text>
        <TouchableOpacity 
          style={styles.searchButton}
          accessible={true}
          accessibilityLabel="Search videos"
          accessibilityRole="button"
          accessibilityHint="Search for Islamic videos and content"
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Video Feed */}
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
          setCurrentIndex(newIndex);
        }}
        {...panResponder.panHandlers}
        accessible={true}
        accessibilityLabel="Video feed"
        accessibilityHint="Swipe up or down to navigate between videos"
      >
        {videoData.map((video, index) => (
          <VideoPlayer
            key={video.id}
            video={video}
            isActive={index === currentIndex}
            onLike={() => handleLike(video.id)}
            onComment={handleComment}
            onShare={handleShare}
            onSave={() => handleSave(video.id)}
            onFollow={() => handleFollow(video.creator.id)}
            onReport={handleReport}
          />
        ))}
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent
        onRequestClose={() => setShowComments(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.commentsModal}>
            <View style={styles.modalHeader}>
              <Text 
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
              >
                Comments
              </Text>
              <TouchableOpacity 
                onPress={() => setShowComments(false)}
                accessible={true}
                accessibilityLabel="Close comments"
                accessibilityRole="button"
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.commentsContent}>
              <Text style={styles.commentsPlaceholder}>
                Comments feature coming soon! 💬
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowShareModal(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.shareModal}>
            <View style={styles.modalHeader}>
              <Text 
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
              >
                Share with Sisters
              </Text>
              <TouchableOpacity 
                onPress={() => setShowShareModal(false)}
                accessible={true}
                accessibilityLabel="Close share options"
                accessibilityRole="button"
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.shareOptions}>
              <TouchableOpacity 
                style={styles.shareOption}
                accessible={true}
                accessibilityLabel="Copy video link"
                accessibilityRole="button"
              >
                <Text style={styles.shareIcon}>📱</Text>
                <Text style={styles.shareText}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.shareOption}
                accessible={true}
                accessibilityLabel="Send as message"
                accessibilityRole="button"
              >
                <Text style={styles.shareIcon}>📧</Text>
                <Text style={styles.shareText}>Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.shareOption}
                accessible={true}
                accessibilityLabel="Share to story"
                accessibilityRole="button"
              >
                <Text style={styles.shareIcon}>💌</Text>
                <Text style={styles.shareText}>Share Story</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ISLAMIC_COLORS.background,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ISLAMIC_COLORS.white,
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ISLAMIC_COLORS.background,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 80, 22, 0.3)',
  },
  videoPlaceholderText: {
    fontSize: 24,
    color: ISLAMIC_COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 16,
    color: ISLAMIC_COLORS.text,
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: ISLAMIC_COLORS.white,
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseText: {
    fontSize: 30,
    color: ISLAMIC_COLORS.white,
  },
  doubleTapArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeAnimation: {
    position: 'absolute',
  },
  likeAnimationText: {
    fontSize: 60,
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
  },
  leftActions: {
    left: 12,
    right: 'auto',
  },
  creatorAvatar: {
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ISLAMIC_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ISLAMIC_COLORS.white,
  },
  avatarText: {
    fontSize: 20,
    color: ISLAMIC_COLORS.white,
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ISLAMIC_COLORS.heart,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 16,
    color: ISLAMIC_COLORS.white,
    fontWeight: 'bold',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 12,
    color: ISLAMIC_COLORS.white,
    fontWeight: 'bold',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bottomInfoRTL: {
    left: 80,
    right: 16,
    flexDirection: 'row-reverse',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorNameRowRTL: {
    flexDirection: 'row-reverse',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ISLAMIC_COLORS.white,
    marginRight: 8,
  },
  verifiedIcon: {
    fontSize: 14,
  },
  username: {
    fontSize: 14,
    color: ISLAMIC_COLORS.textSecondary,
  },
  description: {
    fontSize: 14,
    color: ISLAMIC_COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtagContainerRTL: {
    flexDirection: 'row-reverse',
  },
  hashtag: {
    fontSize: 14,
    color: ISLAMIC_COLORS.gold,
    marginRight: 8,
    marginBottom: 4,
  },
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundIcon: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  commentsModal: {
    backgroundColor: ISLAMIC_COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  shareModal: {
    backgroundColor: ISLAMIC_COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ISLAMIC_COLORS.background,
  },
  closeButton: {
    fontSize: 18,
    color: ISLAMIC_COLORS.textSecondary,
  },
  commentsContent: {
    padding: 20,
    alignItems: 'center',
  },
  commentsPlaceholder: {
    fontSize: 16,
    color: ISLAMIC_COLORS.textSecondary,
    textAlign: 'center',
  },
  shareOptions: {
    padding: 20,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  shareIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  shareText: {
    fontSize: 16,
    color: ISLAMIC_COLORS.background,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default ForYouPage;